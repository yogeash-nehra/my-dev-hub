'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

type AgentId = 'fundamentals' | 'technical' | 'sentiment' | 'bull' | 'bear' | 'risk'
type AgentStatus = 'pending' | 'running' | 'done' | 'error'

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

// ── Config ─────────────────────────────────────────────────────────────────────

const AGENTS: { id: AgentId; label: string; textColor: string; borderColor: string; bgColor: string }[] = [
  { id: 'fundamentals', label: 'Fundamentals', textColor: 'text-blue-400',    borderColor: 'border-blue-500/30',   bgColor: 'bg-blue-500/10' },
  { id: 'technical',    label: 'Technical',    textColor: 'text-purple-400',  borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/10' },
  { id: 'sentiment',    label: 'Sentiment',    textColor: 'text-amber-400',   borderColor: 'border-amber-500/30',  bgColor: 'bg-amber-500/10' },
  { id: 'bull',         label: 'Bull Case',    textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30',bgColor: 'bg-emerald-500/10' },
  { id: 'bear',         label: 'Bear Case',    textColor: 'text-red-400',     borderColor: 'border-red-500/30',    bgColor: 'bg-red-500/10' },
  { id: 'risk',         label: 'Risk Manager', textColor: 'text-violet-400',  borderColor: 'border-violet-500/30', bgColor: 'bg-violet-500/10' },
]

const AGENT_TEXT_COLOR: Record<AgentId, string> = Object.fromEntries(
  AGENTS.map(a => [a.id, a.textColor])
) as Record<AgentId, string>

const MODELS = [
  { value: 'claude-sonnet-4-6',         label: 'Sonnet 4.6 — Balanced' },
  { value: 'claude-opus-4-7',           label: 'Opus 4.7 — Most Capable' },
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — Fast' },
]

const DECISION_STYLE: Record<string, string> = {
  BUY:  'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
  SELL: 'text-red-400 border-red-500/40 bg-red-500/10',
  HOLD: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
}

const LS_KEY = 'trading_history_v1'

function loadHistory(): TradeRecord[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function saveHistory(records: TradeRecord[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(records.slice(0, 20))) } catch {}
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TradingDashboard() {
  const [ticker, setTicker]         = useState('NVDA')
  const [date, setDate]             = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10)
  })
  const [model, setModel]           = useState('claude-sonnet-4-6')
  const [running, setRunning]       = useState(false)
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatus>>({} as any)
  const [agentContent,  setAgentContent]  = useState<Record<AgentId, string>>({} as any)
  const [activeAgent,   setActiveAgent]   = useState<AgentId | null>(null)
  const [marketInfo,    setMarketInfo]    = useState<{ price?: string; change?: string; changePct?: string } | null>(null)
  const [statusLines,   setStatusLines]   = useState<{ type: string; content: string }[]>([])
  const [finalResult,   setFinalResult]   = useState<FinalResult | null>(null)
  const [history,       setHistory]       = useState<TradeRecord[]>([])
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setHistory(loadHistory()) }, [])

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' })
  }, [agentContent, statusLines, finalResult])

  const reset = () => {
    setAgentStatuses({} as any)
    setAgentContent({} as any)
    setActiveAgent(null)
    setMarketInfo(null)
    setStatusLines([])
    setFinalResult(null)
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
      if (!res.body) throw new Error('No response body')

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
          let ev: any
          try { ev = JSON.parse(line) } catch { continue }

          if (ev.type === 'status' || ev.type === 'warning') {
            setStatusLines(p => [...p, { type: ev.type, content: ev.content }])

          } else if (ev.type === 'market_data') {
            setMarketInfo({ price: ev.price, change: ev.change, changePct: ev.changePct })

          } else if (ev.type === 'agent_start') {
            setActiveAgent(ev.agentId)
            setAgentStatuses(p => ({ ...p, [ev.agentId]: 'running' }))
            setAgentContent(p => ({ ...p, [ev.agentId]: '' }))

          } else if (ev.type === 'agent_chunk') {
            const aid = ev.agentId as AgentId
            setAgentContent(p => ({ ...p, [aid]: (p[aid] ?? '') + ev.content }))

          } else if (ev.type === 'agent_done') {
            setAgentStatuses(p => ({ ...p, [ev.agentId as AgentId]: 'done' as AgentStatus }))
            setActiveAgent(null)

          } else if (ev.type === 'result') {
            setFinalResult(ev)
            const rec: TradeRecord = {
              id: `${ev.ticker}-${ev.date}-${Date.now()}`,
              ticker: ev.ticker,
              date: ev.date,
              decision: ev.decision,
              confidence: ev.confidence,
              model: ev.model,
              ts: new Date().toISOString(),
            }
            setHistory(prev => {
              const next = [rec, ...prev].slice(0, 20)
              saveHistory(next)
              return next
            })

          } else if (ev.type === 'error') {
            setStatusLines(p => [...p, { type: 'error', content: ev.content }])
          }
        }
      }
    } catch (err) {
      setStatusLines(p => [...p, { type: 'error', content: String(err) }])
    } finally {
      setRunning(false)
    }
  }, [ticker, date, model])

  const hasOutput = statusLines.length > 0 || marketInfo || Object.keys(agentStatuses).length > 0

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#080D14]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">Trading Agent Firm</h1>
              <p className="text-slate-400 text-sm max-w-2xl">
                Six specialized Claude agents — Fundamentals, Technical, Sentiment, Bull Researcher,
                Bear Researcher, and Risk Manager — collaborate using real market data from Alpha Vantage
                to produce a final trade recommendation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {AGENTS.map(a => (
                <span
                  key={a.id}
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${a.textColor} ${a.borderColor} ${a.bgColor}`}
                >
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Left sidebar ──────────────────────────────────────────────── */}
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
                    {MODELS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={run}
                  disabled={running}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition ${
                    running
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                  }`}
                >
                  {running ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Analyzing…
                    </span>
                  ) : 'Run Agent Analysis'}
                </button>
              </div>
            </div>

            {/* Agent pipeline status */}
            <div className="bg-[#080D14] border border-white/5 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Agent Pipeline</h2>
              <div className="space-y-2">
                {AGENTS.map((agent, i) => {
                  const status = agentStatuses[agent.id]
                  return (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300 ${
                        status === 'running'
                          ? `${agent.bgColor} ${agent.borderColor}`
                          : status === 'done'
                          ? 'bg-white/3 border-white/5 opacity-70'
                          : 'border-transparent opacity-30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 border ${
                        status === 'running' ? `${agent.borderColor} ${agent.bgColor}` :
                        status === 'done'    ? 'border-white/20 bg-white/5' :
                                              'border-white/10 bg-transparent'
                      }`}>
                        {status === 'running' ? (
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'currentColor' }} />
                        ) : status === 'done' ? (
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        status === 'running' ? agent.textColor :
                        status === 'done'    ? 'text-slate-400' :
                                              'text-slate-600'
                      }`}>
                        {i + 1}. {agent.label}
                      </span>
                      {status === 'running' && (
                        <span className={`ml-auto text-[10px] font-mono ${agent.textColor} animate-pulse`}>LIVE</span>
                      )}
                      {status === 'done' && (
                        <span className="ml-auto text-[10px] text-slate-600">done</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trade history */}
            {history.length > 0 && (
              <div className="bg-[#080D14] border border-white/5 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">History</h2>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {history.map(rec => (
                    <div key={rec.id} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-sm font-mono font-bold text-slate-200">{rec.ticker}</span>
                        <span className="text-xs text-slate-500 ml-2">{rec.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${
                          rec.decision === 'BUY' ? 'text-emerald-400' :
                          rec.decision === 'SELL' ? 'text-red-400' : 'text-amber-400'
                        }`}>{rec.decision}</span>
                        <span className="text-xs text-slate-600">{rec.confidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: terminal + result ───────────────────────────────────── */}
          <div className="space-y-5">

            {/* Terminal */}
            <div className="bg-black border border-white/10 rounded-xl flex flex-col shadow-2xl overflow-hidden">
              {/* Terminal toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F18] border-b border-white/8">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="font-mono text-xs text-slate-500 ml-2">
                    {running ? `${ticker} — analysis running` : hasOutput ? `${ticker} — complete` : 'terminal'}
                  </span>
                </div>
                {running && (
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Terminal body */}
              <div
                ref={termRef}
                className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-1 min-h-[520px] max-h-[640px]"
              >
                {!hasOutput && !running && (
                  <p className="text-slate-600 italic">Enter a ticker and date above, then click Run Agent Analysis.</p>
                )}

                {/* Status lines */}
                {statusLines.map((line, i) => (
                  <div key={i} className={`text-xs ${
                    line.type === 'error'   ? 'text-red-400' :
                    line.type === 'warning' ? 'text-amber-400' :
                    'text-slate-500'
                  }`}>
                    {line.type === 'error' ? '✗ ' : line.type === 'warning' ? '⚠ ' : '→ '}{line.content}
                  </div>
                ))}

                {/* Market data pill */}
                {marketInfo && (
                  <div className="mt-2 mb-3 inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <span className="text-slate-300 font-bold">{ticker}</span>
                    {marketInfo.price && <span className="text-slate-200">${marketInfo.price}</span>}
                    {marketInfo.changePct && (
                      <span className={parseFloat(marketInfo.change ?? '0') >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {parseFloat(marketInfo.change ?? '0') >= 0 ? '+' : ''}{marketInfo.changePct}
                      </span>
                    )}
                  </div>
                )}

                {/* Per-agent output blocks */}
                {AGENTS.map(agent => {
                  const status  = agentStatuses[agent.id]
                  const content = agentContent[agent.id]
                  if (!status) return null
                  return (
                    <div key={agent.id} className="mt-3">
                      <div className={`flex items-center gap-2 mb-1 ${agent.textColor}`}>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                          [{agent.label}]
                        </span>
                        {status === 'running' && (
                          <span className="text-[10px] animate-pulse">streaming…</span>
                        )}
                      </div>
                      <div className={`text-slate-300 text-xs leading-relaxed whitespace-pre-wrap pl-2 border-l border-white/5 ${
                        status === 'running' ? 'streaming-cursor' : ''
                      }`}>
                        {content || (status === 'running' ? '' : '—')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Final result card */}
            {finalResult && (
              <div className={`rounded-xl border p-6 ${DECISION_STYLE[finalResult.decision] ?? DECISION_STYLE.HOLD}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">
                      {finalResult.ticker} — {finalResult.date}
                    </div>
                    <div className="text-4xl font-black tracking-tight mb-1">{finalResult.decision}</div>
                    <div className="text-sm opacity-70">Confidence: {finalResult.confidence}</div>
                  </div>
                  <div className="text-xs opacity-40 text-right">
                    <div>{finalResult.model}</div>
                    <div className="mt-1">via Claude API</div>
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
