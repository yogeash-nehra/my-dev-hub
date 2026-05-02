# Workflow: AI Developer News Digest

Two modes:
- **News Scan** — breadth scan of what's happened in AI for devs (daily or weekly)
- **Deep Research** — full deep-dive on a specific tool, release, or topic

---

## Mode 1: News Scan

### Trigger
Daily (light scan) or weekly (full digest). Run when you want to know what shipped.

### Inputs
- `{{SCAN_PERIOD}}` — "last 24 hours" / "last 7 days" / "since {{DATE}}"
- `{{FOCUS}}` — optional: narrow to a specific area (e.g., "inference tooling", "Claude API", "open-source models")
- `{{DEPTH}}` — headlines only / standard digest / deep on each item

### Steps

#### Step 1: Load sources and context (sequential)
```
Read personal/sources/ai-dev-sources.md to load the curated source list and quality gate.
Read agents/ai-news-agent.md to load the research agent instructions.
```

#### Step 2: Parallel source scan (spawn all at once for speed)

**Agent A — Official lab sources:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan tier 1 official sources for developer-relevant news from {{SCAN_PERIOD}}.
{{#if FOCUS}}Focus on: {{FOCUS}}{{/if}}

Sources to check: Anthropic, OpenAI, Google DeepMind/AI, Meta AI, Mistral, Cohere.
For each, use WebSearch with site: operators and date filters.
Fetch and quality-gate every candidate.
Return: entries that scored ≥3 on the quality gate, with score shown.
```

**Agent B — GitHub releases scan:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan GitHub releases for the repos listed in personal/sources/ai-dev-sources.md
(vllm, ollama, langchain, llama_index, litellm, llama.cpp, transformers, anthropic-sdk).

For each repo: check releases page, fetch release notes for anything in {{SCAN_PERIOD}}.
Return: release entries that include actual technical changes (not just patch bumps).
Format each as a digest entry per the agent's output format.
```

**Agent C — Research + community scan:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan for:
1. arXiv new submissions (cs.AI, cs.CL, cs.LG) from {{SCAN_PERIOD}} — filter to papers with code or strong benchmarks
2. Simon Willison (simonwillison.net) recent posts
3. Hacker News: search for AI-related Show HN / technical threads with score >200

For community sources: apply the exclusion list from personal/sources/ai-dev-sources.md strictly.
Return: only items that scored ≥3.
```

#### Step 3: Consolidate and rank (sequential, after all agents)
```
Merge the outputs from all three scan agents.
Remove any duplicates (same story from multiple sources — keep the primary source entry).
Sort each category by: developer impact (highest first), then recency.
Produce the final digest using the format from agents/ai-news-agent.md.
Include total items found vs. excluded at the top.
```

### Outputs
Formatted digest in conversation.
Optionally save: `personal/digests/ai-{{DATE}}.md`

### Example Invocation
```
Read workflows/ai-news-digest.md, then run Mode 1 News Scan.
Period: last 7 days
Depth: standard digest
```

---

## Mode 2: Deep Research

### Trigger
You heard about something specific and want to understand it fully:
a new model, a framework release, a paper, a technique.

### Inputs
- `{{TOPIC}}` — what to research (be specific: "Claude 3.7 extended thinking" not "Claude")
- `{{ANGLE}}` — what you want to know: "how to use it" / "what changed from previous" / "benchmark analysis" / "comparison with alternatives"
- `{{OUTPUT_USE}}` — what you'll do with this: "decide whether to adopt" / "write technical post" / "teach to my team" / "build with it"

### Steps

#### Step 1: Source discovery (sequential)
```
Read agents/ai-news-agent.md and personal/sources/ai-dev-sources.md.

Search for ALL primary sources on: {{TOPIC}}
Use WebSearch with multiple query angles:
- "{{TOPIC}} release" site:github.com
- "{{TOPIC}} paper" site:arxiv.org
- "{{TOPIC}}" site:anthropic.com OR site:openai.com OR [relevant lab]
- "{{TOPIC}}" site:simonwillison.net

List every candidate source before fetching. Prioritize tier 1 sources.
```

#### Step 2: Deep read (parallel — fetch all sources at once)
```
Use WebFetch to read EVERY primary source found in Step 1 in full.
For papers: read abstract, introduction, methodology, results, and conclusion.
For GitHub repos: read README, recent commits, and open issues.
For changelogs: read every entry completely.
For blog posts: read the full article, not a skim.

Take notes on: specific claims made, numbers cited, code examples shown,
limitations acknowledged, and gaps not addressed.
```

#### Step 3: Synthesize with extended thinking (sequential)
```
You have read all primary sources on: {{TOPIC}}
Angle: {{ANGLE}}
Output use: {{OUTPUT_USE}}

Think carefully (use extended thinking, budget: 10000 tokens) before writing.
Consider: what is definitively true vs. what is implied, what is missing,
what contradictions exist across sources, what a developer should actually do.

Write a deep research report using the format in agents/ai-news-agent.md (deep research format).
Include every primary source in the sources section.
Be honest about gaps and unknowns — don't fill them with speculation.
```

### Outputs
Deep research report in conversation.
Save: `personal/research/{{TOPIC-SLUG}}-{{DATE}}.md`

### Example Invocation
```
Read workflows/ai-news-digest.md, then run Mode 2 Deep Research.
Topic: vLLM 0.4 speculative decoding
Angle: how to use it and what the real-world speedup looks like
Output use: decide whether to replace my current inference setup
```

---

## Scheduling This Workflow

To run the news scan automatically on a schedule, use `/schedule`:

**Daily lightweight scan:**
```
/schedule
Run workflows/ai-news-digest.md Mode 1 every weekday morning.
Period: last 24 hours. Depth: headlines only.
Save output to personal/digests/ai-{{DATE}}.md.
```

**Weekly full digest:**
```
/schedule
Run workflows/ai-news-digest.md Mode 1 every Monday.
Period: last 7 days. Depth: standard digest.
Save output to personal/digests/ai-weekly-{{DATE}}.md.
```
