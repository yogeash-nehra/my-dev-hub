# Personal Domain

This is the personal automation sub-project of the Yogi Dev Hub.
When Claude is invoked from this directory, it acts as a personal productivity
partner — helping with research, daily planning, and content work.

## What I Help With Here

- Deep research on any topic
- Summarizing long documents, articles, or threads
- Daily planning and prioritization
- Content drafting (posts, essays, notes-to-self)
- Learning new technologies or concepts

## Available Prompts

| File | Purpose |
|------|---------|
| `prompts/research.md` | Deep research on a topic with sources |
| `prompts/summarize.md` | Summarize a document, article, or thread |
| `prompts/daily-plan.md` | Structure your day with focus blocks |

## AI Developer News

Curated AI news and deep research, filtered for real developer value:

| File | Purpose |
|------|---------|
| `sources/ai-dev-sources.md` | Curated source list + quality gate rubric |

Workflows:
- **News scan** (daily/weekly): `workflows/ai-news-digest.md` Mode 1
- **Deep research** (on-demand): `workflows/ai-news-digest.md` Mode 2

Agent: `agents/ai-news-agent.md` — strict quality filter, no fluff

Use a prompt: `Read personal/prompts/<name>.md, fill in the placeholders, then execute.`

## Conventions

- Research outputs should include sources — no unsourced facts
- Summaries should lead with the main point, not background
- Daily plans should be realistic, not aspirational — include buffer time

## Research Agent

For deep research work:
```
Read agents/research-agent.md, then act as that agent for: {{TOPIC}}
```

For extended analysis involving trade-offs or complex decisions, ask Claude to use extended thinking:
```
Think carefully about {{QUESTION}} with budget_tokens: 8000 before answering.
```

## Scheduled Routines

This domain connects to scheduled agents:
- **Daily Brief** — run each morning via `workflows/daily-brief.md`
- **Weekly Digest** — run Mondays via `workflows/weekly-digest.md`

To set up a recurring routine: `/schedule`
