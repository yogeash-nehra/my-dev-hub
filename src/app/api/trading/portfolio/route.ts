import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 120

// ── Alpha Vantage ──────────────────────────────────────────────────────────────

async function fetchAV(fn: string, params: Record<string, string>) {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) throw new Error('ALPHA_VANTAGE_API_KEY not configured')
  const url = new URL('https://www.alphavantage.co/query')
  url.searchParams.set('function', fn)
  url.searchParams.set('apikey', key)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Alpha Vantage error: ${res.status}`)
  const data = await res.json()
  if (data['Note'] || data['Information']) throw new Error('Alpha Vantage rate limit hit — try again in a minute')
  return data
}

// ── GET: batch quotes for a list of tickers ────────────────────────────────────
// Usage: GET /api/trading/portfolio?tickers=NVDA,AAPL,MSFT

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('tickers') ?? ''
  const tickers = raw.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
  if (!tickers.length) return Response.json({ quotes: [] })

  const quotes: {
    ticker: string; price: number | null; change: number | null
    changePct: string | null; prevClose: number | null; ok: boolean; error?: string
  }[] = []

  for (let i = 0; i < tickers.length; i++) {
    const ticker = tickers[i]
    try {
      const data = await fetchAV('GLOBAL_QUOTE', { symbol: ticker })
      const q = data['Global Quote'] ?? {}
      if (!q['05. price']) {
        quotes.push({ ticker, price: null, change: null, changePct: null, prevClose: null, ok: false, error: 'No data — check ticker' })
      } else {
        quotes.push({
          ticker,
          price:     parseFloat(q['05. price']),
          change:    parseFloat(q['09. change']),
          changePct: q['10. change percent'],
          prevClose: parseFloat(q['08. previous close']),
          ok: true,
        })
      }
    } catch (err) {
      quotes.push({ ticker, price: null, change: null, changePct: null, prevClose: null, ok: false, error: String(err) })
    }
    // Stay within Alpha Vantage free-tier rate limit (5 req/min)
    if (i < tickers.length - 1) await new Promise(r => setTimeout(r, 300))
  }

  return Response.json({ quotes })
}

// ── POST: streaming portfolio analysis ────────────────────────────────────────

interface Position {
  ticker: string
  shares: number
  avgCost: number
  currentPrice?: number | null
}

function buildPortfolioSummary(positions: Position[], date: string): string {
  const totalValue = positions.reduce((s, p) => s + p.shares * (p.currentPrice ?? p.avgCost), 0)
  const totalCost  = positions.reduce((s, p) => s + p.shares * p.avgCost, 0)
  const totalPnl   = totalValue - totalCost

  const rows = positions.map(p => {
    const price  = p.currentPrice ?? p.avgCost
    const value  = p.shares * price
    const cost   = p.shares * p.avgCost
    const pnl    = value - cost
    const pnlPct = ((pnl / cost) * 100).toFixed(1)
    const weight = ((value / totalValue) * 100).toFixed(1)
    return `${p.ticker.padEnd(6)} | ${p.shares} shares | avg $${p.avgCost.toFixed(2)} | now $${price.toFixed(2)} | value $${value.toFixed(0)} | P&L ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(0)} (${pnl >= 0 ? '+' : ''}${pnlPct}%) | weight ${weight}%`
  })

  return [
    `Portfolio as of ${date}:`,
    ...rows,
    '',
    `Total Value:  $${totalValue.toFixed(0)}`,
    `Total Cost:   $${totalCost.toFixed(0)}`,
    `Total P&L:    ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)} (${((totalPnl / totalCost) * 100).toFixed(1)}%)`,
  ].join('\n')
}

const AGENTS = [
  {
    id: 'analyst',
    label: 'Position Analyst',
    maxTokens: 900,
    system: `You are a Portfolio Position Analyst. For each position, provide one sentence on current outlook then a signal.

Format EACH position as exactly one line:
[TICKER]: [ADD|HOLD|REDUCE|EXIT] — [reason, max 15 words]

Consider P&L, position weight, and current market conditions. Be direct.`,
    user: (summary: string, _outputs: Record<string, string>) =>
      `Analyze each position:\n\n${summary}`,
  },
  {
    id: 'risk',
    label: 'Risk Assessor',
    maxTokens: 600,
    system: `You are a Portfolio Risk Manager. Identify:
1. Concentration risk (any position > 30% weight)
2. Sector/correlation risk
3. Underwater positions that need attention

End with: RISK LEVEL: [LOW | MEDIUM | HIGH | CRITICAL]`,
    user: (summary: string, _outputs: Record<string, string>) =>
      `Assess portfolio risk:\n\n${summary}`,
  },
  {
    id: 'manager',
    label: 'Portfolio Manager',
    maxTokens: 500,
    system: `You are the Portfolio Manager. Output EXACTLY this format — no deviations:

PORTFOLIO STANCE: [AGGRESSIVE or BALANCED or DEFENSIVE]
RISK LEVEL: [LOW or MEDIUM or HIGH or CRITICAL]
PRIORITY ACTION: [one specific action, max 20 words]

POSITION SIGNALS:
[TICKER]: [ADD or HOLD or REDUCE or EXIT]
(one line per position — ticker in caps, colon, then signal)`,
    user: (_summary: string, outputs: Record<string, string>) =>
      `Make final portfolio decisions based on:\n\nAnalyst:\n${outputs.analyst}\n\nRisk:\n${outputs.risk}`,
  },
]

function resolveModel(raw?: string) {
  const aliases: Record<string, string> = {
    sonnet: 'claude-sonnet-4-6',
    opus:   'claude-opus-4-7',
    haiku:  'claude-haiku-4-5-20251001',
  }
  return aliases[raw ?? ''] ?? raw ?? process.env.TRADING_MODEL ?? 'claude-sonnet-4-6'
}

export async function POST(req: NextRequest) {
  const { positions, model: rawModel, date } = await req.json()
  if (!Array.isArray(positions) || positions.length === 0) {
    return new Response(JSON.stringify({ error: 'positions array required' }), { status: 400 })
  }

  const model   = resolveModel(rawModel)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          emit({ type: 'error', content: 'ANTHROPIC_API_KEY not configured' }); return
        }

        const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const summary = buildPortfolioSummary(positions, date ?? new Date().toISOString().slice(0, 10))
        const outputs: Record<string, string> = {}

        for (let i = 0; i < AGENTS.length; i++) {
          const agent = AGENTS[i]
          emit({ type: 'progress', step: i + 1, total: AGENTS.length, label: agent.label })
          emit({ type: 'agent_start', agentId: agent.id, label: agent.label })

          let full = ''
          const msgStream = client.messages.stream({
            model,
            max_tokens: agent.maxTokens,
            system: agent.system,
            messages: [{ role: 'user', content: agent.user(summary, outputs) }],
          })

          for await (const chunk of msgStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              full += chunk.delta.text
              emit({ type: 'agent_chunk', agentId: agent.id, content: chunk.delta.text })
            }
          }

          outputs[agent.id] = full
          emit({ type: 'agent_done', agentId: agent.id })
        }

        // Parse manager output
        const mgr     = outputs.manager ?? ''
        const stance  = mgr.match(/PORTFOLIO STANCE:\s*(AGGRESSIVE|BALANCED|DEFENSIVE)/i)?.[1]?.toUpperCase() ?? 'BALANCED'
        const riskLvl = mgr.match(/RISK LEVEL:\s*(LOW|MEDIUM|HIGH|CRITICAL)/i)?.[1]?.toUpperCase() ?? 'MEDIUM'
        const priority = mgr.match(/PRIORITY ACTION:\s*(.+?)(?:\n|$)/i)?.[1]?.trim() ?? ''

        const signals: Record<string, string> = {}
        for (const m of mgr.matchAll(/\b([A-Z]{1,5}):\s*(ADD|HOLD|REDUCE|EXIT)\b/g)) {
          if (!['PORTFOLIO', 'STANCE', 'RISK', 'LEVEL', 'PRIORITY', 'ACTION'].includes(m[1])) {
            signals[m[1]] = m[2]
          }
        }

        emit({ type: 'result', stance, riskLevel: riskLvl, priority, signals })

      } catch (error) {
        emit({ type: 'error', content: String(error) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
