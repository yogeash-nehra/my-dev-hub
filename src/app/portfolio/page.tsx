'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Position {
  id: string
  ticker: string
  shares: number
  avgCost: number
  addedDate: string
  lastAnalyzed?: string
  lastDecision?: string
  lastConfidence?: string
  lastReasoning?: string
}

interface QuoteData {
  price: number | null
  change: number | null
  changePct: string | null
  ok: boolean
  error?: string
  loading?: boolean
}

type AgentStatus = 'pending' | 'running' | 'done'

interface AnalysisResult {
  stance: string
  riskLevel: string
  priority: string
  signals: Record<string, string>
}

interface RecheckResult {
  decision: string
  confidence: string
  reasoning: string
}

// ── Config ─────────────────────────────────────────────────────────────────────

const PORTFOLIO_AGENTS: { id: string; label: string; textColor: string; borderColor: string; bgColor: string }[] = [
  { id: 'analyst',  label: 'Position Analyst', textColor: 'text-blue-400',   borderColor: 'border-blue-500/30',   bgColor: 'bg-blue-500/10' },
  { id: 'risk',     label: 'Risk Assessor',    textColor: 'text-amber-400',  borderColor: 'border-amber-500/30',  bgColor: 'bg-amber-500/10' },
  { id: 'manager',  label: 'Portfolio Manager',textColor: 'text-violet-400', borderColor: 'border-violet-500/30', bgColor: 'bg-violet-500/10' },
]

const RECHECK_AGENTS: { id: string; label: string; textColor: string; borderColor: string; bgColor: string }[] = [
  { id: 'fundamentals', label: 'Fundamentals', textColor: 'text-blue-400',    borderColor: 'border-blue-500/30',    bgColor: 'bg-blue-500/10' },
  { id: 'technical',    label: 'Technical',    textColor: 'text-purple-400',  borderColor: 'border-purple-500/30',  bgColor: 'bg-purple-500/10' },
  { id: 'sentiment',    label: 'Sentiment',    textColor: 'text-amber-400',   borderColor: 'border-amber-500/30',   bgColor: 'bg-amber-500/10' },
  { id: 'bull',         label: 'Bull Case',    textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/10' },
  { id: 'bear',         label: 'Bear Case',    textColor: 'text-red-400',     borderColor: 'border-red-500/30',     bgColor: 'bg-red-500/10' },
  { id: 'risk',         label: 'Risk Manager', textColor: 'text-violet-400',  borderColor: 'border-violet-500/30',  bgColor: 'bg-violet-500/10' },
]

const MODELS = [
  { value: 'claude-sonnet-4-6',         label: 'Sonnet 4.6' },
  { value: 'claude-opus-4-7',           label: 'Opus 4.7' },
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5' },
]

const SIGNAL_STYLE: Record<string, string> = {
  ADD:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  HOLD:   'text-blue-400   bg-blue-500/10    border-blue-500/30',
  REDUCE: 'text-amber-400  bg-amber-500/10   border-amber-500/30',
  EXIT:   'text-red-400    bg-red-500/10     border-red-500/30',
  BUY:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  SELL:   'text-red-400    bg-red-500/10     border-red-500/30',
}

const DECISION_COLOR: Record<string, string> = {
  BUY:  'text-emerald-400',
  SELL: 'text-red-400',
  HOLD: 'text-amber-400',
}

const STANCE_STYLE: Record<string, { border: string; text: string; bg: string }> = {
  AGGRESSIVE: { border: 'border-red-500/40',   text: 'text-red-400',   bg: 'bg-red-500/10' },
  BALANCED:   { border: 'border-blue-500/40',  text: 'text-blue-400',  bg: 'bg-blue-500/10' },
  DEFENSIVE:  { border: 'border-amber-500/40', text: 'text-amber-400', bg: 'bg-amber-500/10' },
}

const RISK_COLOR: Record<string, string> = {
  LOW:      'text-emerald-400',
  MEDIUM:   'text-amber-400',
  HIGH:     'text-orange-400',
  CRITICAL: 'text-red-400',
}

const LS_KEY = 'portfolio_positions_v1'

// ── Storage helpers ───────────────────────────────────────────────────────────

function lsLoad(): Position[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}
function lsSave(p: Position[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(p)) } catch {}
}

async function kvLoad(): Promise<Position[] | null> {
  try {
    const res  = await fetch('/api/portfolio/positions')
    const data = await res.json()
    if (data.positions === null) return null
    return data.positions as Position[]
  } catch {
    return null
  }
}

async function kvSave(positions: Position[]): Promise<void> {
  try {
    await fetch('/api/portfolio/positions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positions }),
    })
  } catch {}
}

async function loadPositions(): Promise<Position[]> {
  const remote = await kvLoad()
  if (remote !== null) { lsSave(remote); return remote }
  return lsLoad()
}

async function savePositions(positions: Position[]): Promise<void> {
  lsSave(positions)
  await kvSave(positions)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return n >= 0
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `-$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}
function fmtElapsed(s: number): string {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

function stalenessInfo(lastAnalyzed?: string): { label: string; color: string } {
  if (!lastAnalyzed) return { label: 'Never', color: 'text-slate-600' }
  const days = Math.floor((Date.now() - new Date(lastAnalyzed).getTime()) / 86400000)
  if (days === 0) return { label: 'Today',      color: 'text-emerald-400' }
  if (days === 1) return { label: '1d ago',      color: 'text-emerald-400' }
  if (days <= 3)  return { label: `${days}d ago`, color: 'text-amber-400' }
  if (days <= 7)  return { label: `${days}d ago`, color: 'text-orange-400' }
  return             { label: `${days}d ago`, color: 'text-red-400' }
}

function parseErrorMessage(raw: string): { title: string; hint: string } {
  if (raw.includes('ANTHROPIC_API_KEY'))
    return { title: 'Anthropic key not configured', hint: 'Add ANTHROPIC_API_KEY to Vercel environment variables.' }
  if (raw.includes('ALPHA_VANTAGE_API_KEY'))
    return { title: 'Alpha Vantage key not configured', hint: 'Add ALPHA_VANTAGE_API_KEY to Vercel env vars. See .env.example.' }
  if (raw.toLowerCase().includes('rate limit'))
    return { title: 'Alpha Vantage rate limit', hint: 'Free tier: 5 req/min, 25/day. Wait 60s and try again.' }
  return { title: 'Error', hint: raw.slice(0, 200) }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [positions,  setPositions]  = useState<Position[]>([])
  const [quotes,     setQuotes]     = useState<Record<string, QuoteData>>({})
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [model,      setModel]      = useState('claude-sonnet-4-6')

  // Add form
  const [addTicker,  setAddTicker]  = useState('')
  const [addShares,  setAddShares]  = useState('')
  const [addCost,    setAddCost]    = useState('')
  const [addError,   setAddError]   = useState('')

  // Portfolio analysis (3-agent)
  const [running,       setRunning]       = useState(false)
  const [elapsed,       setElapsed]       = useState(0)
  const [currentStep,   setCurrentStep]   = useState(0)
  const [stepLabel,     setStepLabel]     = useState('')
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({})
  const [agentContent,  setAgentContent]  = useState<Record<string, string>>({})
  const [collapsed,     setCollapsed]     = useState<Set<string>>(new Set())
  const [statusLines,   setStatusLines]   = useState<{ type: string; content: string }[]>([])
  const [errors,        setErrors]        = useState<{ title: string; hint: string }[]>([])
  const [result,        setResult]        = useState<AnalysisResult | null>(null)
  const [showAnalysis,  setShowAnalysis]  = useState(false)

  // Recheck (6-agent single ticker)
  const [recheckTicker,        setRecheckTicker]        = useState('')
  const [recheckRunning,       setRecheckRunning]        = useState(false)
  const [recheckElapsed,       setRecheckElapsed]        = useState(0)
  const [recheckStep,          setRecheckStep]           = useState(0)
  const [recheckStepLabel,     setRecheckStepLabel]      = useState('')
  const [recheckAgentStatuses, setRecheckAgentStatuses]  = useState<Record<string, AgentStatus>>({})
  const [recheckAgentContent,  setRecheckAgentContent]   = useState<Record<string, string>>({})
  const [recheckCollapsed,     setRecheckCollapsed]      = useState<Set<string>>(new Set())
  const [recheckStatusLines,   setRecheckStatusLines]    = useState<{ type: string; content: string }[]>([])
  const [recheckErrors,        setRecheckErrors]         = useState<{ title: string; hint: string }[]>([])
  const [recheckResult,        setRecheckResult]         = useState<RecheckResult | null>(null)
  const [showRecheck,          setShowRecheck]           = useState(false)
  const [recheckAllProgress,   setRecheckAllProgress]    = useState<{ current: number; total: number } | null>(null)

  const termRef         = useRef<HTMLDivElement>(null)
  const recheckTermRef  = useRef<HTMLDivElement>(null)
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef        = useRef<number | null>(null)
  const recheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recheckStartRef = useRef<number | null>(null)

  // Load positions on mount
  useEffect(() => { loadPositions().then(setPositions) }, [])

  // Portfolio analysis timer
  useEffect(() => {
    if (running) {
      startRef.current = Date.now(); setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running])

  // Recheck timer
  useEffect(() => {
    if (recheckRunning) {
      recheckStartRef.current = Date.now(); setRecheckElapsed(0)
      recheckTimerRef.current = setInterval(() => {
        setRecheckElapsed(Math.floor((Date.now() - (recheckStartRef.current ?? Date.now())) / 1000))
      }, 1000)
    } else {
      if (recheckTimerRef.current) clearInterval(recheckTimerRef.current)
    }
    return () => { if (recheckTimerRef.current) clearInterval(recheckTimerRef.current) }
  }, [recheckRunning])

  // Auto-scroll terminals
  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' })
  }, [agentContent, statusLines])

  useEffect(() => {
    recheckTermRef.current?.scrollTo({ top: recheckTermRef.current.scrollHeight, behavior: 'smooth' })
  }, [recheckAgentContent, recheckStatusLines])

  // Live quotes whenever positions change
  const refreshQuotes = useCallback(async (pos: Position[]) => {
    if (!pos.length) return
    setQuotesLoading(true)
    const tickers = [...new Set(pos.map(p => p.ticker))].join(',')
    try {
      const res  = await fetch(`/api/trading/portfolio?tickers=${encodeURIComponent(tickers)}`)
      const data = await res.json()
      const map: Record<string, QuoteData> = {}
      for (const q of data.quotes ?? []) map[q.ticker] = q
      setQuotes(map)
    } catch {
      // silent
    } finally {
      setQuotesLoading(false)
    }
  }, [])

  useEffect(() => { refreshQuotes(positions) }, [positions, refreshQuotes])

  // ── Add position ────────────────────────────────────────────────────────────

  const addPosition = () => {
    const t = addTicker.trim().toUpperCase()
    const s = parseFloat(addShares)
    const c = parseFloat(addCost)
    if (!t)               { setAddError('Enter a ticker'); return }
    if (isNaN(s) || s <= 0) { setAddError('Shares must be > 0'); return }
    if (isNaN(c) || c <= 0) { setAddError('Avg cost must be > 0'); return }
    if (positions.some(p => p.ticker === t)) { setAddError(`${t} already in portfolio`); return }

    setAddError('')
    const pos: Position = {
      id: `${t}-${Date.now()}`,
      ticker: t, shares: s, avgCost: c,
      addedDate: new Date().toISOString().slice(0, 10),
    }
    const next = [...positions, pos]
    setPositions(next)
    void savePositions(next)
    setAddTicker(''); setAddShares(''); setAddCost('')
  }

  const removePosition = (id: string) => {
    const next = positions.filter(p => p.id !== id)
    setPositions(next); void savePositions(next)
  }

  const updateShares = (id: string, shares: number) => {
    const next = positions.map(p => p.id === id ? { ...p, shares } : p)
    setPositions(next); void savePositions(next)
  }

  const updateCost = (id: string, avgCost: number) => {
    const next = positions.map(p => p.id === id ? { ...p, avgCost } : p)
    setPositions(next); void savePositions(next)
  }

  // ── Portfolio stats ─────────────────────────────────────────────────────────

  const positionsWithPrices = positions.map(p => {
    const q = quotes[p.ticker]
    const price = q?.ok && q.price != null ? q.price : null
    const effectivePrice = price ?? p.avgCost
    const value  = p.shares * effectivePrice
    const cost   = p.shares * p.avgCost
    const pnl    = value - cost
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
    const dayPnl = q?.ok && q.change != null ? p.shares * q.change : null
    return { ...p, effectivePrice, value, cost, pnl, pnlPct, dayPnl, livePrice: price }
  })

  const totalValue  = positionsWithPrices.reduce((s, p) => s + p.value, 0)
  const totalCost   = positionsWithPrices.reduce((s, p) => s + p.cost,  0)
  const totalPnl    = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const dayPnl      = positionsWithPrices.reduce((s, p) => s + (p.dayPnl ?? 0), 0)

  // ── Portfolio analysis ──────────────────────────────────────────────────────

  const resetAnalysis = () => {
    setAgentStatuses({}); setAgentContent({}); setCollapsed(new Set())
    setStatusLines([]); setErrors([]); setResult(null)
    setCurrentStep(0); setStepLabel('')
  }

  const runAnalysis = useCallback(async () => {
    resetAnalysis()
    setShowAnalysis(true)
    setRunning(true)

    try {
      const res = await fetch('/api/trading/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: positionsWithPrices.map(p => ({
            ticker: p.ticker, shares: p.shares, avgCost: p.avgCost, currentPrice: p.livePrice,
          })),
          model,
          date: new Date().toISOString().slice(0, 10),
        }),
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setErrors([parseErrorMessage(err.error ?? String(err))])
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          let ev: Record<string, unknown>
          try { ev = JSON.parse(line) } catch { continue }

          if (ev.type === 'progress') {
            setCurrentStep(ev.step as number); setStepLabel(ev.label as string)
          } else if (ev.type === 'status') {
            setStatusLines(p => [...p, { type: 'status', content: ev.content as string }])
          } else if (ev.type === 'agent_start') {
            const aid = ev.agentId as string
            setAgentStatuses(p => ({ ...p, [aid]: 'running' as AgentStatus }))
            setAgentContent(p => ({ ...p, [aid]: '' }))
            setCollapsed(p => { const n = new Set(p); n.delete(aid); return n })
          } else if (ev.type === 'agent_chunk') {
            const aid = ev.agentId as string
            setAgentContent(p => ({ ...p, [aid]: (p[aid] ?? '') + (ev.content as string) }))
          } else if (ev.type === 'agent_done') {
            const aid = ev.agentId as string
            setAgentStatuses(p => ({ ...p, [aid]: 'done' as AgentStatus }))
            if (aid !== 'manager') setCollapsed(p => new Set([...p, aid]))
          } else if (ev.type === 'result') {
            setResult(ev as unknown as AnalysisResult)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionsWithPrices, model])

  // ── Recheck single position ─────────────────────────────────────────────────

  const doRecheck = useCallback(async (positionId: string, ticker: string) => {
    setRecheckAgentStatuses({}); setRecheckAgentContent({}); setRecheckCollapsed(new Set())
    setRecheckStatusLines([]); setRecheckErrors([]); setRecheckResult(null)
    setRecheckStep(0); setRecheckStepLabel('')
    setRecheckTicker(ticker)
    setShowRecheck(true)
    setRecheckRunning(true)

    try {
      const res = await fetch('/api/trading/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, date: new Date().toISOString().slice(0, 10), model }),
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        setRecheckErrors([parseErrorMessage(err.error ?? String(err))])
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let finalDecision = '', finalConfidence = '', finalReasoning = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          let ev: Record<string, unknown>
          try { ev = JSON.parse(line) } catch { continue }

          if (ev.type === 'progress') {
            setRecheckStep(ev.step as number); setRecheckStepLabel(ev.label as string)
          } else if (ev.type === 'status' || ev.type === 'warning') {
            setRecheckStatusLines(p => [...p, { type: ev.type as string, content: ev.content as string }])
          } else if (ev.type === 'agent_start') {
            const aid = ev.agentId as string
            setRecheckAgentStatuses(p => ({ ...p, [aid]: 'running' as AgentStatus }))
            setRecheckAgentContent(p => ({ ...p, [aid]: '' }))
            setRecheckCollapsed(p => { const n = new Set(p); n.delete(aid); return n })
          } else if (ev.type === 'agent_chunk') {
            const aid = ev.agentId as string
            setRecheckAgentContent(p => ({ ...p, [aid]: (p[aid] ?? '') + (ev.content as string) }))
          } else if (ev.type === 'agent_done') {
            const aid = ev.agentId as string
            setRecheckAgentStatuses(p => ({ ...p, [aid]: 'done' as AgentStatus }))
            if (aid !== 'risk') setRecheckCollapsed(p => new Set([...p, aid]))
          } else if (ev.type === 'result') {
            finalDecision   = ev.decision   as string
            finalConfidence = ev.confidence as string
            finalReasoning  = ev.reasoning  as string
            setRecheckResult({ decision: finalDecision, confidence: finalConfidence, reasoning: finalReasoning })
          } else if (ev.type === 'error') {
            setRecheckErrors(p => [...p, parseErrorMessage(ev.content as string)])
          }
        }
      }

      // Persist result back to position
      if (finalDecision) {
        setPositions(prev => {
          const next = prev.map(p => p.id === positionId ? {
            ...p,
            lastAnalyzed:   new Date().toISOString(),
            lastDecision:   finalDecision,
            lastConfidence: finalConfidence,
            lastReasoning:  finalReasoning,
          } : p)
          void savePositions(next)
          return next
        })
      }
    } catch (err) {
      setRecheckErrors([parseErrorMessage(String(err))])
    } finally {
      setRecheckRunning(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model])

  // ── Recheck all ─────────────────────────────────────────────────────────────

  const recheckAll = useCallback(async () => {
    const snapshot = [...positions]
    if (!snapshot.length) return
    setRecheckAllProgress({ current: 0, total: snapshot.length })

    for (let i = 0; i < snapshot.length; i++) {
      setRecheckAllProgress({ current: i + 1, total: snapshot.length })
      await doRecheck(snapshot[i].id, snapshot[i].ticker)
      if (i < snapshot.length - 1) {
        await new Promise(r => setTimeout(r, 3000))
      }
    }
    setRecheckAllProgress(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions, doRecheck])

  // ── Render ────────────────────────────────────────────────────────────────────

  const stanceStyle = result ? (STANCE_STYLE[result.stance] ?? STANCE_STYLE.BALANCED) : STANCE_STYLE.BALANCED

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">

      {/* Header */}
      <div className="border-b border-white/5 bg-[#080D14]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-1">Portfolio</h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Track positions with live prices. Run portfolio-level AI analysis or recheck individual
                holdings with the full 6-agent trading firm.
              </p>
            </div>

            {positions.length > 0 && (
              <div className="flex flex-wrap gap-6 text-right shrink-0">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Total Value</div>
                  <div className="text-xl font-bold text-slate-100">{fmtCurrency(totalValue)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Today</div>
                  <div className={`text-xl font-bold ${dayPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {dayPnl >= 0 ? '+' : ''}{fmtCurrency(dayPnl)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">Total P&amp;L</div>
                  <div className={`text-xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmtPct(totalPnlPct)}
                  </div>
                </div>
                <button
                  onClick={() => refreshQuotes(positions)}
                  disabled={quotesLoading}
                  className="self-end text-xs text-slate-500 hover:text-slate-300 transition border border-white/10 rounded-lg px-3 py-1.5"
                >
                  {quotesLoading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin" />
                      Refreshing
                    </span>
                  ) : 'Refresh Prices'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Add position */}
        <div className="bg-[#080D14] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Add Position</h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Ticker</label>
              <input
                type="text"
                value={addTicker}
                onChange={e => { setAddTicker(e.target.value.toUpperCase()); setAddError('') }}
                onKeyDown={e => e.key === 'Enter' && addPosition()}
                placeholder="NVDA"
                className="w-24 bg-[#030712] border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500/50 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Shares</label>
              <input
                type="number"
                value={addShares}
                onChange={e => { setAddShares(e.target.value); setAddError('') }}
                onKeyDown={e => e.key === 'Enter' && addPosition()}
                placeholder="10"
                min="0.001"
                step="any"
                className="w-28 bg-[#030712] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Avg Cost ($)</label>
              <input
                type="number"
                value={addCost}
                onChange={e => { setAddCost(e.target.value); setAddError('') }}
                onKeyDown={e => e.key === 'Enter' && addPosition()}
                placeholder="580.00"
                min="0.01"
                step="any"
                className="w-32 bg-[#030712] border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500/50 outline-none transition"
              />
            </div>
            <button
              onClick={addPosition}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              + Add
            </button>
            {addError && <span className="text-xs text-red-400 self-center">{addError}</span>}
          </div>
        </div>

        {/* Positions table */}
        {positions.length === 0 ? (
          <div className="bg-[#080D14] border border-white/5 rounded-xl p-12 text-center">
            <div className="text-slate-600 text-4xl mb-3">◫</div>
            <p className="text-slate-400 text-sm">No positions yet. Add your first holding above or analyse a stock on the <a href="/trading" className="underline hover:text-slate-200 transition">Trading page</a>.</p>
          </div>
        ) : (
          <div className="bg-[#080D14] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
                Positions
                {quotesLoading && (
                  <span className="ml-2 text-xs font-normal text-slate-500 normal-case tracking-normal">
                    <span className="inline-block w-3 h-3 border border-slate-600 border-t-transparent rounded-full animate-spin align-middle" />
                    {' '}fetching prices…
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  disabled={running || recheckRunning}
                  className="bg-[#030712] border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500/50 outline-none transition"
                >
                  {MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>

                {/* Recheck All */}
                <button
                  onClick={recheckAll}
                  disabled={recheckRunning || running}
                  title="Re-run full 6-agent analysis on every position sequentially (3s delay between each)"
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    recheckRunning || running
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {recheckAllProgress
                    ? `${recheckAllProgress.current}/${recheckAllProgress.total} Rechecking…`
                    : 'Recheck All'}
                </button>

                {/* Portfolio analysis */}
                <button
                  onClick={result ? resetAnalysis : runAnalysis}
                  disabled={running || positions.length === 0}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    running
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : result
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-violet-600 hover:bg-violet-500 text-white'
                  }`}
                >
                  {running ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Analyzing…
                    </span>
                  ) : result ? 'Re-analyze' : 'Analyze Portfolio'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <th className="text-left px-5 py-3">Ticker</th>
                    <th className="text-right px-4 py-3">Shares</th>
                    <th className="text-right px-4 py-3">Avg Cost</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-right px-4 py-3">Value</th>
                    <th className="text-right px-4 py-3">P&amp;L</th>
                    <th className="text-right px-4 py-3">P&amp;L %</th>
                    <th className="text-right px-4 py-3">Weight</th>
                    <th className="text-center px-4 py-3">Signal</th>
                    <th className="text-center px-4 py-3">Last Check</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {positionsWithPrices.map(pos => {
                    const weight      = totalValue > 0 ? (pos.value / totalValue) * 100 : 0
                    const signal      = result?.signals[pos.ticker] ?? pos.lastDecision
                    const stale       = stalenessInfo(pos.lastAnalyzed)
                    const q           = quotes[pos.ticker]
                    const isRechecking = recheckRunning && recheckTicker === pos.ticker
                    return (
                      <tr
                        key={pos.id}
                        className={`border-b border-white/3 hover:bg-white/2 transition-colors ${isRechecking ? 'bg-amber-500/5' : ''}`}
                      >
                        <td className="px-5 py-3">
                          <div className="font-mono font-bold text-slate-100">{pos.ticker}</div>
                          <div className="text-[10px] text-slate-600">{pos.addedDate}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <EditableNumber value={pos.shares}  onSave={v => updateShares(pos.id, v)} format={v => v.toLocaleString()} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <EditableNumber value={pos.avgCost} onSave={v => updateCost(pos.id, v)}   format={v => `$${v.toFixed(2)}`} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {q?.loading ? (
                            <span className="text-slate-600">…</span>
                          ) : pos.livePrice != null ? (
                            <div>
                              <div className="text-slate-200">${pos.livePrice.toFixed(2)}</div>
                              {q?.change != null && (
                                <div className={`text-[10px] ${q.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600">${pos.avgCost.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-200">{fmtCurrency(pos.value)}</td>
                        <td className={`px-4 py-3 text-right font-mono ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}{fmtCurrency(pos.pnl)}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${pos.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {fmtPct(pos.pnlPct)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${Math.min(weight, 100)}%` }} />
                            </div>
                            <span className="text-xs text-slate-400 w-8 text-right">{weight.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {signal ? (
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${SIGNAL_STYLE[signal] ?? SIGNAL_STYLE.HOLD}`}>
                              {signal}
                            </span>
                          ) : (
                            <span className="text-slate-700 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-[10px] ${stale.color}`}>{stale.label}</span>
                            {isRechecking ? (
                              <span className="text-[10px] text-amber-400 animate-pulse">running…</span>
                            ) : (
                              <button
                                onClick={() => doRecheck(pos.id, pos.ticker)}
                                disabled={recheckRunning || running}
                                className={`text-[10px] px-2 py-0.5 rounded border transition ${
                                  recheckRunning || running
                                    ? 'text-slate-700 border-slate-700 cursor-not-allowed'
                                    : 'text-slate-500 border-slate-600 hover:text-slate-200 hover:border-slate-400'
                                }`}
                              >
                                Recheck
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removePosition(pos.id)}
                            className="text-slate-600 hover:text-red-400 transition text-xs"
                            title="Remove position"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {positions.length > 1 && (
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/2">
                      <td colSpan={4} className="px-5 py-3 text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">{fmtCurrency(totalValue)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {totalPnl >= 0 ? '+' : ''}{fmtCurrency(totalPnl)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-bold ${totalPnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmtPct(totalPnlPct)}
                      </td>
                      <td colSpan={4} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Recheck terminal (6-agent) */}
        {showRecheck && (
          <div className="space-y-5">
            <div className="bg-black border border-white/10 rounded-xl flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F18] border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {recheckRunning
                      ? `${recheckTicker} — Step ${recheckStep}/7 — ${recheckStepLabel}`
                      : recheckResult
                      ? `${recheckTicker} — recheck complete`
                      : `${recheckTicker} — recheck`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {recheckRunning ? (
                    <>
                      <span className="font-mono text-xs text-slate-500">{fmtElapsed(recheckElapsed)}</span>
                      <div className="flex gap-1">
                        {[0, 150, 300].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowRecheck(false)}
                      className="text-xs text-slate-600 hover:text-slate-400 transition"
                    >
                      ✕ close
                    </button>
                  )}
                </div>
              </div>

              <div ref={recheckTermRef} className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-1 min-h-[400px] max-h-[560px]">
                {recheckStatusLines.map((line, i) => (
                  <div key={i} className={`text-xs ${line.type === 'warning' ? 'text-amber-400' : 'text-slate-500'}`}>
                    {line.type === 'warning' ? '⚠ ' : '→ '}{line.content}
                  </div>
                ))}

                {RECHECK_AGENTS.map(agent => {
                  const status     = recheckAgentStatuses[agent.id]
                  const content    = recheckAgentContent[agent.id] ?? ''
                  const isCollapsed = recheckCollapsed.has(agent.id)
                  if (!status) return null
                  return (
                    <div key={agent.id} className="mt-3">
                      <div
                        className={`flex items-center gap-2 mb-1 ${status === 'done' ? 'cursor-pointer select-none' : ''}`}
                        onClick={() => status === 'done' && setRecheckCollapsed(p => {
                          const n = new Set(p); n.has(agent.id) ? n.delete(agent.id) : n.add(agent.id); return n
                        })}
                      >
                        <span className={`text-xs font-bold uppercase tracking-widest ${agent.textColor}`}>[{agent.label}]</span>
                        {status === 'running' && <span className={`text-[10px] animate-pulse ${agent.textColor}`}>streaming…</span>}
                        {status === 'done' && (
                          <span className="ml-auto text-[10px] text-slate-600">{isCollapsed ? '▸ expand' : '▾ collapse'}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className={`text-slate-300 text-xs leading-relaxed whitespace-pre-wrap pl-2 border-l border-white/5 ${status === 'running' ? 'streaming-cursor' : ''}`}>
                          {content || (status === 'running' ? '' : '—')}
                        </div>
                      )}
                      {isCollapsed && content && (
                        <div className="text-slate-600 text-xs pl-2 border-l border-white/5 truncate">
                          {content.split('\n').find(l => l.trim()) ?? '…'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {recheckErrors.map((err, i) => (
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

            {recheckResult && (
              <div className={`rounded-xl border p-6 ${
                recheckResult.decision === 'BUY'  ? 'border-emerald-500/40 bg-emerald-500/10' :
                recheckResult.decision === 'SELL' ? 'border-red-500/40     bg-red-500/10'     :
                                                    'border-amber-500/40  bg-amber-500/10'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">
                      {recheckTicker} — recheck
                    </div>
                    <div className={`text-4xl font-black tracking-tight mb-1 ${DECISION_COLOR[recheckResult.decision] ?? 'text-amber-400'}`}>
                      {recheckResult.decision}
                    </div>
                    <div className="text-sm opacity-70">Confidence: {recheckResult.confidence}</div>
                  </div>
                  <div className="text-xs opacity-40 text-right shrink-0">
                    <div>{fmtElapsed(recheckElapsed)} elapsed</div>
                    <div className="mt-1 text-emerald-400 text-[10px]">saved to position</div>
                  </div>
                </div>
                {recheckResult.reasoning && (
                  <p className="mt-4 text-sm leading-relaxed opacity-80 border-t border-current/20 pt-4">
                    {recheckResult.reasoning}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Portfolio analysis terminal (3-agent) */}
        {showAnalysis && (
          <div className="space-y-5">
            <div className="bg-black border border-white/10 rounded-xl flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0F18] border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {running ? `Step ${currentStep}/3 — ${stepLabel}` : result ? 'portfolio analysis complete' : 'agent terminal'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {running && (
                    <>
                      <span className="font-mono text-xs text-slate-500">{fmtElapsed(elapsed)}</span>
                      <div className="flex gap-1">
                        {[0, 150, 300].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((currentStep / 3) * 100)}%` }} />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div ref={termRef} className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-1 min-h-[360px] max-h-[520px]">
                {statusLines.map((line, i) => (
                  <div key={i} className="text-xs text-slate-500">→ {line.content}</div>
                ))}

                {PORTFOLIO_AGENTS.map(agent => {
                  const status     = agentStatuses[agent.id]
                  const content    = agentContent[agent.id] ?? ''
                  const isCollapsed = collapsed.has(agent.id)
                  if (!status) return null
                  return (
                    <div key={agent.id} className="mt-3">
                      <div
                        className={`flex items-center gap-2 mb-1 ${status === 'done' ? 'cursor-pointer select-none' : ''}`}
                        onClick={() => status === 'done' && setCollapsed(p => {
                          const n = new Set(p); n.has(agent.id) ? n.delete(agent.id) : n.add(agent.id); return n
                        })}
                      >
                        <span className={`text-xs font-bold uppercase tracking-widest ${agent.textColor}`}>[{agent.label}]</span>
                        {status === 'running' && <span className={`text-[10px] animate-pulse ${agent.textColor}`}>streaming…</span>}
                        {status === 'done' && (
                          <span className="ml-auto text-[10px] text-slate-600">{isCollapsed ? '▸ expand' : '▾ collapse'}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className={`text-slate-300 text-xs leading-relaxed whitespace-pre-wrap pl-2 border-l border-white/5 ${status === 'running' ? 'streaming-cursor' : ''}`}>
                          {content || (status === 'running' ? '' : '—')}
                        </div>
                      )}
                      {isCollapsed && content && (
                        <div className="text-slate-600 text-xs pl-2 border-l border-white/5 truncate">
                          {content.split('\n').find(l => l.trim()) ?? '…'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

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

            {result && (
              <div className={`rounded-xl border p-6 ${stanceStyle.bg} ${stanceStyle.border}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                  <div>
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Portfolio Stance</div>
                    <div className={`text-2xl font-black ${stanceStyle.text}`}>{result.stance}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Risk Level</div>
                    <div className={`text-2xl font-black ${RISK_COLOR[result.riskLevel] ?? 'text-slate-300'}`}>{result.riskLevel}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Priority Action</div>
                    <div className="text-sm text-slate-200 leading-relaxed">{result.priority}</div>
                  </div>
                </div>

                {Object.keys(result.signals).length > 0 && (
                  <div className={`border-t pt-4 ${stanceStyle.border}`}>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Position Signals</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.signals).map(([ticker, signal]) => (
                        <div key={ticker} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                          <span className="font-mono font-bold text-sm text-slate-200">{ticker}</span>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${SIGNAL_STYLE[signal] ?? SIGNAL_STYLE.HOLD}`}>
                            {signal}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── EditableNumber ─────────────────────────────────────────────────────────────

function EditableNumber({
  value, onSave, format,
}: {
  value: number
  onSave: (v: number) => void
  format: (v: number) => string
}) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const start  = () => { setDraft(String(value)); setEditing(true) }
  const commit = () => {
    const v = parseFloat(draft)
    if (!isNaN(v) && v > 0) onSave(v)
    setEditing(false)
  }

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        className="w-20 bg-[#030712] border border-blue-500/50 rounded px-2 py-0.5 text-xs text-right font-mono outline-none"
        step="any"
      />
    )
  }

  return (
    <span
      onClick={start}
      className="text-slate-300 font-mono cursor-pointer hover:text-slate-100 border-b border-dashed border-slate-700 hover:border-slate-500 transition"
      title="Click to edit"
    >
      {format(value)}
    </span>
  )
}
