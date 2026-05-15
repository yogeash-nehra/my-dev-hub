import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 300

// Preflight — checks keys without exposing values
export async function GET() {
  return Response.json({
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
  })
}

// ── Alpha Vantage helpers ──────────────────────────────────────────────────────

async function fetchAV(fn: string, params: Record<string, string>) {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) throw new Error('ALPHA_VANTAGE_API_KEY not configured')
  const url = new URL('https://www.alphavantage.co/query')
  url.searchParams.set('function', fn)
  url.searchParams.set('apikey', key)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Alpha Vantage ${fn} failed: ${res.status}`)
  const data = await res.json()
  if (data['Note'] || data['Information']) {
    throw new Error(`Alpha Vantage rate limit hit — try again in a minute`)
  }
  return data
}

function fmtQuote(data: any, ticker: string): string {
  const q = data['Global Quote'] || {}
  return [
    `${ticker} — Price: $${q['05. price'] ?? 'N/A'}`,
    `Change: ${q['09. change'] ?? 'N/A'} (${q['10. change percent'] ?? 'N/A'})`,
    `Volume: ${Number(q['06. volume'] ?? 0).toLocaleString()}`,
    `Prev Close: $${q['08. previous close'] ?? 'N/A'}`,
  ].join('\n')
}

function fmtOverview(data: any): string {
  const mcap = data.MarketCapitalization ? `$${(+data.MarketCapitalization / 1e9).toFixed(1)}B` : null
  const rev = data.RevenueTTM ? `$${(+data.RevenueTTM / 1e9).toFixed(1)}B` : null
  const rows: [string, unknown][] = [
    ['Sector / Industry', data.Sector && data.Industry ? `${data.Sector} / ${data.Industry}` : null],
    ['Market Cap', mcap],
    ['P/E Ratio', data.PERatio !== 'None' ? data.PERatio : null],
    ['Forward P/E', data.ForwardPE !== 'None' ? data.ForwardPE : null],
    ['EPS (TTM)', data.EPS !== 'None' ? data.EPS : null],
    ['Revenue (TTM)', rev],
    ['Profit Margin', data.ProfitMargin !== 'None' ? data.ProfitMargin : null],
    ['Operating Margin', data.OperatingMarginTTM !== 'None' ? data.OperatingMarginTTM : null],
    ['52-Week High', data['52WeekHigh'] !== 'None' ? `$${data['52WeekHigh']}` : null],
    ['52-Week Low', data['52WeekLow'] !== 'None' ? `$${data['52WeekLow']}` : null],
    ['Beta', data.Beta !== 'None' ? data.Beta : null],
    ['Analyst Target', data.AnalystTargetPrice !== 'None' ? `$${data.AnalystTargetPrice}` : null],
  ]
  return rows.filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}`).join('\n')
}

function fmtTimeSeries(data: any, date: string): string {
  const ts: Record<string, Record<string, string>> = data['Time Series (Daily)'] ?? {}
  const dates = Object.keys(ts).filter(d => d <= date).sort().reverse().slice(0, 50)
  if (dates.length === 0) return 'No historical price data available'
  const closes = dates.map(d => parseFloat(ts[d]['4. close']))
  const latest = closes[0]
  const ma20 = closes.slice(0, 20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length)
  const ma50 = closes.slice(0, 50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length)

  let gains = 0, losses = 0
  for (let i = 0; i < Math.min(14, closes.length - 1); i++) {
    const d = closes[i] - closes[i + 1]
    if (d > 0) gains += d; else losses -= d
  }
  const rsi = losses === 0 ? 100 : +(100 - 100 / (1 + gains / losses)).toFixed(1)

  const p5 = closes[4] ? ((latest - closes[4]) / closes[4] * 100).toFixed(1) + '%' : 'N/A'
  const p20 = closes[19] ? ((latest - closes[19]) / closes[19] * 100).toFixed(1) + '%' : 'N/A'

  const recent = dates.slice(0, 5).map(d => `  ${d}: $${parseFloat(ts[d]['4. close']).toFixed(2)}`).join('\n')

  return [
    `Price (${dates[0]}): $${latest.toFixed(2)}`,
    `20-Day MA: $${ma20.toFixed(2)} — price is ${latest > ma20 ? 'ABOVE' : 'BELOW'}`,
    `50-Day MA: $${ma50.toFixed(2)} — price is ${latest > ma50 ? 'ABOVE' : 'BELOW'}`,
    `RSI(14): ${rsi}`,
    `5-Day Return: ${p5}`,
    `20-Day Return: ${p20}`,
    `Recent closes:\n${recent}`,
  ].join('\n')
}

function fmtNews(data: any): string {
  const feed: any[] = data['feed']?.slice(0, 8) ?? []
  if (feed.length === 0) return 'No recent news available'
  const overall = data['overall_sentiment_label'] ?? 'N/A'
  const score = data['overall_sentiment_score'] ? (+data['overall_sentiment_score']).toFixed(3) : 'N/A'
  const items = feed.map((item: any) =>
    `  [${item.overall_sentiment_label ?? 'Neutral'}] ${item.title}`
  )
  return [`Overall Sentiment: ${overall} (${score})`, 'Headlines:', ...items].join('\n')
}

// ── Agent pipeline ─────────────────────────────────────────────────────────────

const PIPELINE = [
  {
    id: 'fundamentals',
    label: 'Fundamentals Analyst',
    maxTokens: 800,
    system: `You are a Fundamental Analyst at a quantitative trading firm. Be concise and data-driven.
Analyze valuation (P/E vs historical norms), revenue growth, margins, and balance sheet signals.
List the top 3 bullish fundamental factors and top 3 bearish fundamental factors.
End with exactly this line: FUNDAMENTAL SCORE: [Bullish | Neutral | Bearish]`,
    user: (ticker: string, date: string, ctx: any) =>
      `Analyze ${ticker} fundamentals as of ${date}:\n\n${ctx.overviewText}\n\n${ctx.quoteText}`,
  },
  {
    id: 'technical',
    label: 'Technical Analyst',
    maxTokens: 800,
    system: `You are a Technical Analyst. Be concise and data-driven.
Analyze price action relative to moving averages, RSI momentum, and recent return trends.
Identify key support/resistance levels implied by the data.
End with exactly this line: TECHNICAL SCORE: [Bullish | Neutral | Bearish]`,
    user: (ticker: string, date: string, ctx: any) =>
      `Analyze ${ticker} price technicals as of ${date}:\n\n${ctx.timeSeriesText}`,
  },
  {
    id: 'sentiment',
    label: 'Sentiment Analyst',
    maxTokens: 600,
    system: `You are a News and Sentiment Analyst. Be concise.
Identify key themes from recent news, any catalysts or risks, and whether the sentiment is shifting.
End with exactly this line: SENTIMENT SCORE: [Bullish | Neutral | Bearish]`,
    user: (ticker: string, date: string, ctx: any) =>
      `Analyze ${ticker} news sentiment as of ${date}:\n\n${ctx.newsText}`,
  },
  {
    id: 'bull',
    label: 'Bull Researcher',
    maxTokens: 700,
    system: `You are the Bullish Researcher on the trading desk. Advocate for the long side.
Using the analyst outputs, construct the strongest possible bull case — specific price catalysts,
timing, and upside targets. Challenge the bearish signals directly.`,
    user: (ticker: string, date: string, _ctx: any, outputs: any) =>
      `Build the bull case for ${ticker} as of ${date}.\n\nFundamentals:\n${outputs.fundamentals}\n\nTechnicals:\n${outputs.technical}\n\nSentiment:\n${outputs.sentiment}`,
  },
  {
    id: 'bear',
    label: 'Bear Researcher',
    maxTokens: 700,
    system: `You are the Bearish Researcher on the trading desk. Advocate for the short side.
Using the analyst outputs, construct the strongest possible bear case — specific downside risks,
potential catalysts for a sell-off, and what the bulls are ignoring.`,
    user: (ticker: string, date: string, _ctx: any, outputs: any) =>
      `Build the bear case for ${ticker} as of ${date}.\n\nFundamentals:\n${outputs.fundamentals}\n\nTechnicals:\n${outputs.technical}\n\nSentiment:\n${outputs.sentiment}`,
  },
  {
    id: 'risk',
    label: 'Risk Manager',
    maxTokens: 512,
    system: `You are the Risk Manager making the final trade decision. Be decisive and brief.
Weigh the bull and bear cases. Consider risk-reward. Your output MUST contain these three lines verbatim:
DECISION: [BUY or SELL or HOLD]
CONFIDENCE: [Low or Medium or High]
REASONING: [2-3 sentences]`,
    user: (ticker: string, date: string, _ctx: any, outputs: any) =>
      `Make the final trading decision for ${ticker} as of ${date}.\n\nBull Case:\n${outputs.bull}\n\nBear Case:\n${outputs.bear}`,
  },
]

function parseDecision(text: string) {
  const dec = text.match(/DECISION:\s*(BUY|SELL|HOLD)/i)
  const conf = text.match(/CONFIDENCE:\s*(Low|Medium|High)/i)
  const reason = text.match(/REASONING:\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i)
  return {
    decision: dec?.[1]?.toUpperCase() ?? 'HOLD',
    confidence: conf?.[1] ?? 'Medium',
    reasoning: reason?.[1]?.trim() ?? text.slice(0, 300).trim(),
  }
}

function resolveModel(raw: string): string {
  const aliases: Record<string, string> = {
    sonnet: 'claude-sonnet-4-6',
    opus: 'claude-opus-4-7',
    haiku: 'claude-haiku-4-5-20251001',
  }
  return aliases[raw] ?? raw ?? process.env.TRADING_MODEL ?? 'claude-sonnet-4-6'
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { ticker, date, model: rawModel } = await req.json()
  if (!ticker || !date) {
    return new Response(JSON.stringify({ error: 'ticker and date are required' }), { status: 400 })
  }

  const model = resolveModel(rawModel ?? '')
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          emit({ type: 'error', content: 'ANTHROPIC_API_KEY is not configured on this server.' })
          return
        }

        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

        // ── Fetch market data ────────────────────────────────────────────────
        emit({ type: 'progress', step: 0, total: 7, label: 'Fetching market data' })
        emit({ type: 'status', content: `Fetching market data for ${ticker}…` })

        let quoteText = `${ticker} — market data unavailable`
        let overviewText = 'Company overview unavailable'
        let timeSeriesText = 'Price history unavailable'
        let newsText = 'News sentiment unavailable'

        try {
          const [quoteData, overviewData, tsData, newsData] = await Promise.all([
            fetchAV('GLOBAL_QUOTE', { symbol: ticker }),
            fetchAV('OVERVIEW', { symbol: ticker }),
            fetchAV('TIME_SERIES_DAILY', { symbol: ticker, outputsize: 'compact' }),
            fetchAV('NEWS_SENTIMENT', { tickers: ticker, limit: '20', sort: 'RELEVANCE' }),
          ])

          quoteText = fmtQuote(quoteData, ticker)
          overviewText = fmtOverview(overviewData)
          timeSeriesText = fmtTimeSeries(tsData, date)
          newsText = fmtNews(newsData)

          const q = quoteData['Global Quote'] ?? {}
          emit({
            type: 'market_data',
            ticker,
            price: q['05. price'],
            change: q['09. change'],
            changePct: q['10. change percent'],
          })
        } catch (err) {
          emit({ type: 'warning', content: `Market data error: ${String(err)} — agents will proceed with limited data.` })
        }

        const ctx = { quoteText, overviewText, timeSeriesText, newsText }
        const outputs: Record<string, string> = {}

        // ── Run agent pipeline ───────────────────────────────────────────────
        for (let i = 0; i < PIPELINE.length; i++) {
          const agent = PIPELINE[i]
          emit({ type: 'progress', step: i + 1, total: 7, label: agent.label })
          emit({ type: 'agent_start', agentId: agent.id, label: agent.label })

          const userContent = agent.user(ticker, date, ctx, outputs)
          let full = ''

          const msgStream = client.messages.stream({
            model,
            max_tokens: agent.maxTokens,
            system: agent.system,
            messages: [{ role: 'user', content: userContent }],
          })

          for await (const chunk of msgStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              full += chunk.delta.text
              emit({ type: 'agent_chunk', agentId: agent.id, content: chunk.delta.text })
            }
          }

          outputs[agent.id] = full
          emit({ type: 'agent_done', agentId: agent.id })
        }

        // ── Final result ─────────────────────────────────────────────────────
        const parsed = parseDecision(outputs['risk'] ?? '')
        emit({ type: 'result', ...parsed, ticker, date, model })

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
