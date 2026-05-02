import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

const SYSTEM = `You are a skill definition generator for an AI workflow builder.
Given a description of what a skill should do, return ONLY a valid JSON object with NO markdown, NO explanation, NO code blocks.

JSON schema (all fields required):
{
  "name": "Short skill name, 2-4 words",
  "description": "One sentence describing what this skill does",
  "emoji": "A single relevant emoji character",
  "color": "A hex color code that fits the skill's domain (e.g. #10B981 for data, #F59E0B for content)",
  "systemPrompt": "A detailed system prompt that makes this skill work well. Include output format instructions.",
  "inputLabel": "Short label for the input field, e.g. 'Paste text here'",
  "outputLabel": "Short label for output, e.g. 'Processed result'"
}`

export async function POST(req: NextRequest) {
  let body: { description?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid body.' }, { status: 400 })
  }

  const { description } = body
  if (!description?.trim()) {
    return Response.json({ error: 'description is required.' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Generate a skill for: ${description.trim()}` }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = raw
      .replace(/^```json\s*/m, '')
      .replace(/^```\s*/m, '')
      .replace(/\s*```$/m, '')
      .trim()

    const skill = JSON.parse(cleaned)
    return Response.json({ skill })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Generation failed.'
    return Response.json({ error: msg }, { status: 500 })
  }
}
