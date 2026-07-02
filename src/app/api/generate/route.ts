import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

// In-memory rate limiter: 20 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= LIMIT) return false
  entry.count++
  return true
}

const systemPrompts: Record<string, string> = {
  developer: `You are an expert software engineer producing concrete, actionable outputs.
- Code review: cite specific issues as \`file:line — description\`, grouped Critical → Warning → Style
- Debugging: identify root cause first, then provide the minimal exact fix
- Test generation: write executable tests with specific assertions and test data
- Refactoring: show clear before/after with rationale
Use proper code blocks with language tags. Be terse, specific, and technical. No fluff.`,
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit reached. Try again in an hour.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { prompt?: string; role?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 })
  }

  const { prompt, role, systemPrompt: customSystemPrompt } = body as {
    prompt?: string; role?: string; systemPrompt?: string
  }
  if (!prompt?.trim()) {
    return new Response(JSON.stringify({ error: 'prompt is required.' }), { status: 400 })
  }

  const systemPrompt = customSystemPrompt ?? (role ? systemPrompts[role] : undefined)
  if (!systemPrompt) {
    return new Response(JSON.stringify({ error: 'Unknown role and no systemPrompt provided.' }), { status: 400 })
  }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt.trim() }],
        })

        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Generation failed.'
        controller.enqueue(encoder.encode(`\n\n_Error: ${msg}_`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
