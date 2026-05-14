import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

const SYSTEM = `You are an expert at writing Claude Code skill files.

Claude Code skills are markdown files placed in .claude/commands/. When a user types /skill-name, the file's content becomes Claude's instructions for that session.

Generate a practical, specific, high-quality skill file.

Rules:
- Start with # SkillName as the heading
- Include clear step-by-step instructions Claude should follow
- Specify exact output format with a concrete example
- Use code blocks with language tags where relevant
- Be specific and actionable — not "analyze the code" but "check for X, Y, Z"
- 200-400 words is the sweet spot
- No frontmatter, no metadata, no YAML
- Do not explain what Claude Code is — just write the instructions directly`

export async function POST(req: NextRequest) {
  let body: { description?: string; category?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid body.' }, { status: 400 })
  }

  const { description, category } = body
  if (!description?.trim()) {
    return Response.json({ error: 'description is required.' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM,
          messages: [{
            role: 'user',
            content: `Generate a Claude Code skill file for: ${description.trim()}${category ? ` (category: ${category})` : ''}`,
          }],
        })

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
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
