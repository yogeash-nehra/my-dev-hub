'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

type AgentId = 'fundamentals' | 'technical' | 'sentiment' | 'bull' | 'bear' | 'risk'
type AgentStatus = 'pending' | 'running' | 'done' | 'error'
type PreflightStatus = 'checking' | 'ready' | 'partial' | 'missing' | 'error'

interface TradeRecord {
  id: string
  ticker: string
  date: string
  decision: string
  confidence: string
  model: string
  ts: string
}

interface FinalResult {
  decision: string
  confidence: string
  reasoning: string
  ticker: string
  date: string
  model: string
}

// ── Agent config ───────────────────────────────────────────────────────────────

const AGENTS: {
  id: AgentId
  label: string
  textColor: string
  borderColor: string
  bgColor: string
}[] = [
  { id: 'fundamentals', label: 'Fundamentals',  textColor: 'text-blue-400',    borderColor: 'border-blue-500/30',    bgColor: 'bg-blue-500/10' },
  { id: 'technical',    label: 'Technical',     textColor: 'text-purple-400',  borderColor: 'border-purple-500/30',  bgColor: 'bg-purple-500/10' },
  { id: 'sentiment',    label: 'Sentiment',     textColor: 'text-amber-400',   borderColor: 'border-amber-500/30',   bgColor: 'bg-amber-500/10' },
  { id: 'bull',         label: 'Bull Case',     textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/10' },
  { id: 'bear',         label: 'Bear Case',     textColor: 'text-red-400',     borderColor: 'border-red-500/30',     bgColor: 'bg-red-500/10' },
  { id: 'risk',         label: 'Risk Manager',  textColor: 'text-violet-400',  borderColor: 'border-violet-500/30',  bgColor: 'bg-violet-500/10' },
]

const MODELS = [
  { value: 'claude-sonnet-4-6',         label: 'Sonnet 4.6 — Balanced' },
  { value: 'claude-opus-4-7',           label: 'Opus 4.7 — Most Capable' },
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — Fast' },
]

const DECISION_STYLE: Record<string, string> = {
  BUY:  'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  SELL: 'text-red-400     border-red-500/40     bg-red-500/10',
  HOLD: 'text-amber-400   border-amber-500/40   bg-amber-500/10',
}

const LS_KEY = 'trading_history_v2'

// ── Helpers ────────────────────────────────────────────────────────────────────

function loadHistory(): TradeRecord[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function saveHistory(r: TradeRecord[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(r.slice(0, 20))) } catch {}
}

function fmtElapsed(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

// Extract the score/decision line from agent output for the collapsed preview
function extractScore(content: string, agentId: AgentId): string | null {
  if (!content) return null
  const patterns: Partial<Record<AgentId, RegExp>> = {
    fundamentals: /FUNDAMENTAL SCORE:\s*(Bullish|Neutral|Bearish)/i,
    technical:    /TECHNICAL SCORE:\s*(Bullish|Neutral|Bearish)/i,
    sentiment:    /SENTIMENT SCORE:\s*(Bullish|Neutral|Bearish)/i,
    risk:         /DECISION:\s*(BUY|SELL|HOLD)/i,
  }
  const m = patterns[agentId]?.exec(content)
  return m ? m[1] : null
}

function scoreColor(score: string): string {
  const s = score.toUpperCase()
  if (['BULLISH', 'BUY'].includes(s))  return 'text-emerald-400'
  if (['BEARISH', 'SELL'].includes(s)) return 'text-red-400'
  return 'text-amber-400'
}

// Turn raw error strings into actionable messages
function parseErrorMessage(raw: string): { title: string; hint: string } {
  if (raw.includes('ANTHROPIC_API_KEY'))
    return { title: 'Anthropic key not configured', hint: 'Add ANTHROPIC_API_KEY to your Vercel environment variables and redeploy.' }
  if (raw.includes('ALPHA_VANTAGE_API_KEY'))
    return { title: 'Alpha Vantage key not configured', hint: 'Add ALPHA_VANTAGE_API_KEY to Vercel env vars. Get a free key at alphavantage.co.' }
  if (raw.toLowerCase().includes('rate limit'))
    return { title: 'Alpha Vantage rate limit hit', hint: 'Free tier allows 5 requests/min and 25/day. Wait 60 seconds then try again.' }
  if (raw.toLowerCase().includes('authentication') || raw.includes('401'))
    return { title: 'API authentication failed', hint: 'Your Anthropic API key may be invalid or expired. Check the key in Vercel settings.' }
  if (raw.toLowerCase().includes('invalid symbol') || raw.toLowerCase().includes('invalid api call'))
    return { title: 'Invalid ticker symbol', hint: `Check that the ticker exists on US markets (e.g. NVDA, AAPL, MSFT).` }
  if (raw.includes('fetch failed') || raw.includes('ECONNREFUSED'))
    return { title: 'Network error', hint: 'Could not reach Alpha Vantage or Anthropic. Check your internet connection.' }
  return { title: 'Analysis failed', hint: raw.slice(0, 200) }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TradingDashboard() {
  const [ticker, setTicker] = useState('NVDA')
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10)
  })
  const [model, setModel] = useState('claude-sonnet-4-6')

  // Preflight
  const [preflight, setPreflight]       = useState<PreflightStatus>('checking')
  const [avReady,   setAvReady]         = useState(false)
  const [anthropicReady, setAnthropicReady] = useState(false)

  // Run state
  const [running,       setRunning]       = useState(false)
  const [elapsed,       setElapsed]       = useState(0)
  const [currentStep,   setCurrentStep]   = useState(0)
  const [totalSteps,    setTotalSteps]    = useState(7)
  const [stepLabel,     setStepLabel]     = useState('')

  // Agent state
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatus>>({} as Record<AgentId, AgentStatus>)
  const [agentContent,  setAgentContent]  = useState<Record<AgentId, string>>({} as Record<AgentId, string>)
  const [collapsedAgents, setCollapsedAgents] = useState<Set<AgentId>>(new Set())

  // Output state
  const [marketInfo, setMarketInfo]  = useState<{ price?: string; change?: string; changePct?: string } | null>(null)
  const [statusLines, setStatusLines] = useState<{ type: string; content: string }[]>([])
  const [errors,     setErrors]      = useState<{ title: string; hint: string }[]>([])
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null)
  const [history,    setHistory]     = useState<TradeRecord[]>([])

  const termRef    = useRef<HTMLDivElement>(null)
  const startRef   = useRef<number | null>(null)
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load history + preflight on mount
  useEffect(() => {
    setHistory(loadHistory())
    fetch('/api/trading/analyze')
      .then(r => r.json())
      .then(({ anthropic, alphaVantage }: { anthropic: boolean; alphaVantage: boolean }) => {
        setAnthropicReady(anthropic)
        setAvReady(alphaVantage)
        if (anthropic && alphaVantage) setPreflight('ready')
        else if (!anthropic && !alphaVantage) setPreflight('missing')
        else setPreflight('partial')
      })
      .catch(() => setPreflight('error'))
  }, [])

  // Elapsed timer
  useEffect(() => {
    if (running) {
      startRef.current = Date.now()
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running])

  // Auto-scroll terminal
  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' })
  }, [agentContent, statusLines, errors, finalResult])

  const reset = () => {
    setAgentStatuses({} as Record<AgentId, AgentStatus>)
    setAgentContent({} as Record<AgentId, string>)
    setCollapsedAgents(new Set())
    setMarketInfo(null)
    setStatusLines([])
    setErrors([])
    setFinalResult(null)
    setCurrentStep(0)
    setStepLabel('')
  }

  const run = useCallback(async () => {
    reset()
    setRunning(true)

    try {
      const res = await fetch('/api/trading/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase().trim(), date, model }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setErrors([parseErrorMessage(err.error ?? String(err))])
        return
      }

      if (!res.body) { setErrors([parseErrorMessage('No response body')]); return }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          let ev: Record<string, unknown>
          try { ev = JSON.parse(line) } catch { continue }

          if (ev.type === 'progress') {
            setCurrentStep(ev.step as number)
            setTotalSteps(ev.total as number)
            setStepLabel(ev.label as string)

          } else if (ev.type === 'status' || ev.type === 'warning') {
            setStatusLines(p => [...p, { type: ev.type as string, content: ev.content as string }])

          } else if (ev.type === 'market_data') {
            setMarketInfo({ price: ev.price as string, change: ev.change as string, changePct: ev.changePct as string })

          } else if (ev.type === 'agent_start') {
            const aid = ev.agentId as AgentId
            setAgentStatuses(p => ({ ...p, [aid]: 'running' as AgentStatus }))
            setAgentContent(p => ({ ...p, [aid]: '' }))
            setCollapsedAgents(p => { const n = new Set(p); n.delete(aid); return n })

          } else if (ev.type === 'agent_chunk') {
            const aid = ev.agentId as AgentId
            setAgentContent(p => ({ ...p, [aid]: (p[aid] ?? '') + (ev.content as string) }))

          } else if (ev.type === 'agent_done') {
            const aid = ev.agentId as AgentId
            setAgentStatuses(p => ({ ...p, [aid]: 'done' as AgentStatus }))
            // Auto-collapse analyst agents (keep risk manager open — it has the decision)
            if (aid !== 'risk') {
              setCollapsedAgents(p => new Set([...p, aid]))
            }

          } else if (ev.type === 'result') {
            setFinalResult(ev as unknown as FinalResult)
            const rec: TradeRecord = {
              id: `${ev.ticker}-${ev.date}-${Date.now()}`,
              ticker:     ev.ticker as string,
              date:       ev.date as string,
              decision:   ev.decision as string,
              confidence: ev.confidence as string,
              model:      ev.model as string,
              ts:         new Date().toISOString(),
            }
            setHistory(prev => {
              const next = [rec, ...prev].slice(0, 20)
              saveHistory(next)
              return next
            })

          } else if (ev.type === 'error') {
            setErrors(p => [...p, parseErrorMessage(ev.content as string)])
          }
        }
      }
    } catch (err) {
      setErrors([parseErrorMessage(String(err))])
    } finally {
      setRunning(false)
    }
  }, [ticker, date, model]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAgent = (id: AgentId) =>
    setCollapsedAgents(p => {
      const n = new Set(p)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })

  const hasOutput = statusLines.length > 0 || marketInfo != null || Object.keys(agentStatuses).length > 0 || errors.length > 0
  const canRun    = !running && preflight !== 'checking' && preflight !== 'missing'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">

      {/* Page header */}
      <div className="border-b border-white/5 bg-[#080D14]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">Trading Agent Firm</h1>
              <p className="text-slate-400 text-sm max-w-2xl">
                Six specialized Claude agents — Fundamentals, Technical, Sentiment, Bull &amp; Bear
                Researchers, and Risk Manager — collaborate on real market data to produce a trade
                recommendation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {AGENTS.map(a => (
                <span key={a.id} className={`px-2 py-0.5 rounded text-xs font-medium border ${a.textColor} ${a.borderColor} ${a.bgColor}`}>
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Controls */}
            <div className="bg-[#080D14] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Run Analysis</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Ticker</label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={e => setTicker(e.target.value.toUpperCase())}
                    className="w-full bg-[#030712] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500/50 outline-none transition"
                    placeholder="e.g. NVDA"
                    disabled={running}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Analysis Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-[#030712] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition"
                    disabled={running}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Claude Model</label>
                  <select
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-[#030712] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition"
                    disabled={running}
                  >
                    {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>

                {/* Env preflight status */}
                <div className="pt-1 space-y-1.5">
                  <PreflightRow label="Anthropic API"  ok={anthropicReady} checking={preflight === 'checking'} />
                  <PreflightRow label="Alpha Vantage"  ok={avReady}        checking={preflight === 'checking'} />
                </div>

                {/* Missing keys warning */}
                {(preflight === 'missing' || preflight === 'partial') && (
                  <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    Missing API keys — add them to Vercel environment variables and redeploy.
                    See <code className="text-amber-300">.env.example</code> for required variables.
                  </div>
                )}

                {finalResult && !running ? (
                  <button
                    onClick={reset}
                    className="w-full py-2.5 rounded-lg text-sm font-bold transition bg-slate-700 hover:bg-slate-600 text-slate-200"
                  >
                    Clear &amp; Run Again
                  </button>
                ) : (
                  <button
                    onClick={run}
                    disabled={!canRun}
                    title={preflight === 'missing' ? 'API keys not configured' : preflight === 'checking' ? 'Checking configuration…' : undefined}
                    className={`w-full py-2.5 rounded-lg text-sm font-bold transition ${
                      !canRun
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                    }`}
                  >
                    {running ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Analyzing…
                      </span>
                    ) : preflight === 'checking' ? 'Checking configuration…' : 'Run Agent Analysis'}
                  </button>
                )}
              </div>
            </div>

            {/* Agent pipeline */}
            <div className="bg-[#080D14] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Pipeline</h2>
              <div className="space-y-1.5">
                {AGENTS.map((agent, i) => {
                  const status = agentStatuses[agent.id]
                  const isRunning = status === 'running'
                  const isDone    = status === 'done'
                  return (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-300 ${
                        isRunning ? `${agent.bgColor} ${agent.borderColor}` :
                        isDone    ? 'bg-white/3 border-white/5' :
                                    'border-transparent opacity-30'
                      }`}
                    >
                      {/* Status dot */}
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        isRunning ? `${agent.borderColor} ${agent.bgColor}` :
                        isDone    ? 'border-white/20 bg-white/5' :
                                    'border-white/10'
                      }`}>
                        {isRunning ? (
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${agent.textColor.replace('text-', 'bg-')}`} />
                        ) : isDone ? (
                          <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <span className={`text-xs font-medium flex-1 ${
                        isRunning ? agent.textColor : isDone ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {i + 1}. {agent.label}
                      </span>
                      {isRunning && <span className={`text-[10px] font-mono ${agent.textColor} animate-pulse`}>LIVE</span>}
                    </div>
                  )
                })}
              </div>

              {/* Step progress bar */}
              {running && (
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Step {currentStep} / {totalSteps}</span>
                    <span>{fmtElapsed(elapsed)}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((currentStep / totalSteps) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Trade history */}
            {history.length > 0 && (
              <div className="bg-[#080D14] border border-white/5 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">History</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map(rec => (
                    <div key={rec.id} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-sm font-mono font-bold text-slate-200">{rec.ticker}</span>
                        <span className="text-xs text-slate-500 ml-2">{rec.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${
                          rec.decision === 'BUY' ? 'text-emerald-400' :
                          rec.decision === 'SELL' ? 'text-red-400' : 'text-amber-400'
                        }`}>{rec.decision}</span>
                        <span className="text-[10px] text-slate-600">{rec.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Terminal + result ────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Terminal */}
            <div className="bg-black border border-white/10 rounded-xl flex flex-col shadow-2xl overflow-hidden">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F18] border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {running
                      ? `Step ${currentStep}/${totalSteps} — ${stepLabel}`
                      : finalResult
                      ? `${finalResult.ticker} — complete`
                      : 'agent terminal'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {running && (
                    <>
                      <span className="font-mono text-xs text-slate-500">{fmtElapsed(elapsed)}</span>
                      <div className="flex gap-1">
                        {[0, 150, 300].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Body */}
              <div ref={termRef} className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-1 min-h-[480px] max-h-[600px]">
                {!hasOutput && !running && (
                  <p className="text-slate-600 italic text-xs">Enter a ticker and date, then click Run Agent Analysis.</p>
                )}

                {/* Status lines */}
                {statusLines.map((line, i) => (
                  <div key={i} className={`text-xs ${
                    line.type === 'error'   ? 'text-red-400' :
                    line.type === 'warning' ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {line.type === 'warning' ? '⚠ ' : '→ '}{line.content}
                  </div>
                ))}

                {/* Market data */}
                {marketInfo && (
                  <div className="mt-2 mb-4 flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 w-fit text-xs">
                    <span className="font-bold text-slate-200">{ticker}</span>
                    {marketInfo.price && <span className="text-slate-300">${marketInfo.price}</span>}
                    {marketInfo.changePct && (
                      <span className={parseFloat(marketInfo.change ?? '0') >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {parseFloat(marketInfo.change ?? '0') >= 0 ? '+' : ''}{marketInfo.changePct}
                      </span>
                    )}
                    <span className="text-slate-600">market data loaded</span>
                  </div>
                )}

                {/* Agent sections */}
                {AGENTS.map(agent => {
                  const status    = agentStatuses[agent.id]
                  const content   = agentContent[agent.id] ?? ''
                  const collapsed = collapsedAgents.has(agent.id)
                  const score     = extractScore(content, agent.id)
                  if (!status) return null

                  return (
                    <div key={agent.id} className="mt-3">
                      {/* Agent header — clickable when done */}
                      <div
                        className={`flex items-center gap-2 mb-1 ${
                          status === 'done' ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={() => status === 'done' && toggleAgent(agent.id)}
                      >
                        <span className={`text-xs font-bold uppercase tracking-widest ${agent.textColor}`}>
                          [{agent.label}]
                        </span>
                        {status === 'running' && (
                          <span className={`text-[10px] ${agent.textColor} animate-pulse`}>streaming…</span>
                        )}
                        {status === 'done' && score && (
                          <span className={`text-[10px] font-bold ${scoreColor(score)}`}>{score.toUpperCase()}</span>
                        )}
                        {status === 'done' && (
                          <span className="ml-auto text-[10px] text-slate-600">
                            {collapsed ? '▸ expand' : '▾ collapse'}
                          </span>
                        )}
                      </div>

                      {/* Agent content */}
                      {!collapsed && (
                        <div className={`text-slate-300 text-xs leading-relaxed whitespace-pre-wrap pl-2 border-l border-white/5 ${
                          status === 'running' ? 'streaming-cursor' : ''
                        }`}>
                          {content || (status === 'running' ? '' : '—')}
                        </div>
                      )}

                      {/* Collapsed preview */}
                      {collapsed && content && (
                        <div className="text-slate-600 text-xs pl-2 border-l border-white/5 truncate">
                          {content.split('\n').find(l => l.trim()) ?? '…'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Error cards */}
            {errors.length > 0 && (
              <div className="space-y-3">
                {errors.map((err, i) => (
                  <div key={i} className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="text-red-400 text-sm mt-0.5 shrink-0">✕</span>
                      <div>
                        <div className="text-sm font-semibold text-red-300">{err.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{err.hint}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Final result card */}
            {finalResult && (
              <div className={`rounded-xl border p-6 ${DECISION_STYLE[finalResult.decision] ?? DECISION_STYLE.HOLD}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">
                      {finalResult.ticker} — {finalResult.date}
                    </div>
                    <div className="text-5xl font-black tracking-tight mb-1">{finalResult.decision}</div>
                    <div className="text-sm opacity-70">Confidence: {finalResult.confidence}</div>
                  </div>
                  <div className="text-xs opacity-40 text-right shrink-0">
                    <div>{finalResult.model.replace('claude-', '')}</div>
                    <div className="mt-1">{fmtElapsed(elapsed)} elapsed</div>
                  </div>
                </div>
                {finalResult.reasoning && (
                  <p className="mt-4 text-sm leading-relaxed opacity-80 border-t border-current/20 pt-4">
                    {finalResult.reasoning}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Preflight row ──────────────────────────────────────────────────────────────

function PreflightRow({ label, ok, checking }: { label: string; ok: boolean; checking: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      {checking ? (
        <span className="w-3 h-3 border border-slate-600 border-t-transparent rounded-full animate-spin" />
      ) : ok ? (
        <span className="text-emerald-400 font-medium">Ready</span>
      ) : (
        <span className="text-red-400 font-medium">Missing</span>
      )}
    </div>
  )
}
