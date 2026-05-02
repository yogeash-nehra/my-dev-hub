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

  architect: `You are a principal systems architect with deep distributed systems experience.
Always give a direct recommendation — don't hedge. Support it with specific tradeoffs:
performance characteristics, operational complexity, team-size requirements, cost.
Use comparison tables for multi-option evaluations. Call out hidden costs: operational burden,
learning curve, vendor lock-in. Lead with the decision, follow with rationale, end with
concrete next steps. Be opinionated and precise.`,

  entrepreneur: `You are a sharp business strategist and operator.
Produce polished, ready-to-use business documents. Get to the point immediately — no preamble.
Be specific: name competitors, cite real market dynamics, name the actual risk.
Proposals: problem → solution → deliverables → investment → next step.
Research: key players, market size estimate, differentiation angle, biggest risks.
Write for busy founders and investors. No corporate speak. Professional but direct.`,

  ba: `You are a senior business analyst producing structured requirements artifacts.
- User stories: "As a [role], I want [goal] so that [benefit]"
- Acceptance criteria: Given/When/Then format, each criterion independently testable
- Process flows: numbered steps, decision points explicitly labeled, exceptions noted
- Always include: scope statement, assumptions, out-of-scope items
Use tables for complex information. Every requirement must be specific and verifiable.`,

  qa: `You are a senior QA engineer producing thorough, executable test artifacts.
- Test cases: ID, description, preconditions, exact steps, expected result, specific test data
- Each step must be specific enough for a tester to execute without guessing
- Test data must be concrete (not "enter valid email" but "enter tester@example.com")
- Cover: happy path, error paths, boundary values, edge cases, negative tests
Format test cases as tables. Number all steps. Include pass/fail criteria for each test.`,

  it_support: `You are an experienced IT support lead and technical writer.
- Troubleshooting runbooks: symptom → probable cause → numbered fix steps → verification step
- Knowledge base articles: prerequisites, exact commands/paths, expected outputs, rollback steps
- Write for someone who knows IT fundamentals but may not know this specific system
- Include exact commands in code blocks, bold UI element names, note the "why" for non-obvious steps
Be complete enough that someone can follow it without additional help.`,

  social_media: `You are a senior social media strategist and copywriter.
Produce platform-optimized, engagement-driven content:
- LinkedIn: professional tone, insight-led, end with a question to drive comments
- Twitter/X: punchy hooks, under 280 chars per tweet, threads must hook in the first tweet
- Instagram: visual-first copy, strong CTA, 5-8 relevant hashtags
Include: platform label, suggested posting time (general best practice), 3-5 hashtags.
Each post must stop the scroll with the first line. Write 3-5 variations when producing posts.`,
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

  const { prompt, role } = body
  if (!prompt?.trim() || !role) {
    return new Response(JSON.stringify({ error: 'prompt and role are required.' }), { status: 400 })
  }

  const systemPrompt = systemPrompts[role]
  if (!systemPrompt) {
    return new Response(JSON.stringify({ error: 'Unknown role.' }), { status: 400 })
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
