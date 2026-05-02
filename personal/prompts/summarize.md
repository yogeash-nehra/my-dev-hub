# Prompt: Summarize

## When to Use
You have a long document, article, email thread, or YouTube transcript and want the key points
extracted fast without losing important nuance.

## Inputs
- `{{CONTENT}}` — the content to summarize (paste inline or provide a URL)
- `{{PURPOSE}}` — why you're reading this (learning / decision / sharing with someone)
- `{{OUTPUT_LENGTH}}` — TL;DR (1-2 sentences) / brief (1 paragraph) / detailed (structured notes)
- `{{FOCUS}}` — optional: specific angle or section to focus on

## Prompt
```
Summarize the following content.

Purpose: {{PURPOSE}}
Output length: {{OUTPUT_LENGTH}}
{{#if FOCUS}}Focus on: {{FOCUS}}{{/if}}

Content:
{{CONTENT}}

Rules:
- Lead with the main point or conclusion — not background or context
- For a decision-focused summary: highlight implications and action items
- For a learning-focused summary: highlight key concepts and how they connect
- For sharing: use plain language, no jargon
- If content has conflicting views, represent both fairly
- Do not pad the summary — if the main point fits in one paragraph, stop there

End with:
"Key takeaway: [one sentence]"
```

## Output Length Guide

| Setting | Format |
|---------|--------|
| TL;DR | 1-2 sentences. The single most important thing. |
| Brief | 1 paragraph. Main point + 2-3 supporting points. |
| Detailed | Headers + bullets. Full structured notes. |

## Example (filled in)
```
Content: [paste article URL or text]
Purpose: Deciding whether to switch from Redux to Zustand for state management
Output length: Detailed
Focus: Migration effort and edge cases
```

## Tips
- For YouTube videos, paste the auto-generated transcript (available under "..." → "Show transcript")
- For PDF documents, paste the text content — Claude can parse it well
- For email threads, paste the full thread — Claude handles quoted replies
