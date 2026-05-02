# Prompt: Research

## When to Use
You need to understand a topic deeply — not just a quick lookup, but a structured analysis
with sources you can reference later.

## Inputs
- `{{TOPIC}}` — what you want to research
- `{{GOAL}}` — what you'll use this research for (decision, learning, writing)
- `{{DEPTH}}` — brief overview / detailed analysis / exhaustive deep-dive
- `{{SPECIFIC_QUESTIONS}}` — optional: specific questions to answer
- `{{TIME_SENSITIVITY}}` — optional: if "current" info matters (default: include date of sources)

## Prompt
```
Research: {{TOPIC}}

Goal: {{GOAL}}
Depth: {{DEPTH}}
{{#if SPECIFIC_QUESTIONS}}
Specific questions to answer:
{{SPECIFIC_QUESTIONS}}
{{/if}}

Instructions:
1. Use WebSearch to find current, authoritative sources
2. Use WebFetch to read the most relevant sources in depth
3. Cross-reference at least 2-3 sources before asserting any fact
4. Structure your findings clearly (use headers for topics/subtopics)
5. Include a Sources section at the end with URLs and what each covers
6. If you find conflicting information, note the disagreement and your assessment

Output format depends on depth:
- Brief: 1 page, key findings + 3-5 sources
- Detailed: 3-5 pages, structured analysis + comprehensive sources
- Exhaustive: Full deep-dive, multiple sections, all relevant sources

Flag anything you could not verify or where information may be outdated.
```

## Example (filled in)
```
Topic: Stripe Connect for marketplace payments
Goal: Deciding whether to use Connect vs a manual payout system for a new app
Depth: Detailed analysis
Specific questions:
- What are the fees for Connect vs manual payouts?
- What KYC requirements does Connect impose on my users?
- What are the main developer pain points?
```

## Tips
- For technical topics, ask Claude to also research GitHub issues and community forums
- For market/business topics, specify geography if relevant
- If you want a comparison, list the specific options: "Compare X vs Y vs Z"
