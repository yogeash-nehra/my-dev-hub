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
Read personal/sources/ai-dev-sources.md — source list, quality gate, and impact tier criteria.
Read agents/ai-news-agent.md — research agent instructions and output format.
Read the most recent digest in personal/digests/ — to avoid duplicating items already covered.
```

#### Step 2: Parallel source scan (spawn all 5 agents at once)

**Agent A — Official lab sources:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan tier 1 official lab sources for developer-relevant news from {{SCAN_PERIOD}}.
{{#if FOCUS}}Focus on: {{FOCUS}}{{/if}}

Sources to scan:
- Anthropic: anthropic.com/news AND platform.claude.com/docs/en/release-notes/overview
- OpenAI: openai.com/blog AND platform.openai.com/docs/changelog
- Google: ai.google.dev AND deepmind.google/research
- Meta: ai.meta.com/blog
- Mistral: mistral.ai/news
- xAI: x.ai/blog
- Cohere: cohere.com/blog
- Hugging Face: huggingface.co/blog

For each: use WebSearch with site: operators and date filters. Fetch and quality-gate every candidate.
Return: entries that scored ≥3 on the quality gate, with score shown and impact tier assigned.
Include any strong Trends items scored ≥2.
```

**Agent B — GitHub releases scan:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan GitHub releases for repos listed in personal/sources/ai-dev-sources.md.

Priority repos (check every scan):
- vllm-project/vllm
- ggml-org/llama.cpp
- ollama/ollama
- huggingface/transformers
- unsloth/unsloth
- BerriAI/litellm
- langchain-ai/langchain
- NVIDIA/TensorRT-LLM
- anthropics/anthropic-sdk-python
- openai/openai-python
- run-llama/llama_index
- microsoft/autogen
- crewai-inc/crewAI
- huggingface/smolagents
- agno-agi/agno

For each repo: check the releases page, fetch release notes for anything in {{SCAN_PERIOD}}.
Skip pure patch versions (x.y.Z) unless they fix a meaningful bug or add minor functionality.
Include minor versions (x.Y.z) and major versions (X.y.z) that have real technical changes.
Return: release entries with actual technical changes, formatted per agent output format.
```

**Agent C — Research and arXiv scan:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan for new research from {{SCAN_PERIOD}}:

1. arXiv new submissions (cs.AI, cs.CL, cs.LG, cs.CV) — filter strictly:
   - Must have code repo linked OR be from a recognized lab
   - Must show measurable benchmark numbers
   - Must be relevant to building with or evaluating LLMs/AI systems

2. Hugging Face Papers Daily (huggingface.co/papers) — new papers with community traction

3. Simon Willison (simonwillison.net) — recent posts (his analysis often surfaces important items others miss)

4. Papers With Code (paperswithcode.com) — new SOTA entries with linked implementations

5. Hacker News — Show HN and Ask HN threads with score >200 and technical depth

For community sources: apply the exclusion list from personal/sources/ai-dev-sources.md.
Quality gate: ≥3 for Research/Discussions, ≥2 acceptable for Trends items.
Return: all items that passed, clearly labeled by section.
```

**Agent D — Benchmarks, leaderboards, and community scan:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan for benchmark and leaderboard changes from {{SCAN_PERIOD}}:

1. LMSYS Chatbot Arena (lmarena.ai) — ELO ranking changes, new model entries, significant upsets
2. Open LLM Leaderboard (huggingface.co/spaces/open-llm-leaderboard) — new top performers
3. SWE-bench Verified (swebench.com) — new models cracking >50% or significant score movement
4. LiveCodeBench / BigCodeBench — coding leaderboard changes

Also scan tier 2 high-quality writers for items in {{SCAN_PERIOD}}:
- Nathan Lambert (interconnects.ai) — RL/alignment research
- Eugene Yan (eugeneyan.com) — applied LLM engineering
- Sebastian Raschka (magazine.sebastianraschka.com) — deep ML posts

Quality gate applies. Leaderboard items score +2 for "concrete benchmark data" automatically.
Return: entries with score ≥3 and impact tier.
```

**Agent E — Cloud platform and infrastructure scan:**
```
Act as the AI news agent (agents/ai-news-agent.md already loaded).
Scan for AI infrastructure and platform updates from {{SCAN_PERIOD}}:

1. AWS AI/ML Blog (aws.amazon.com/blogs/machine-learning) — Bedrock, SageMaker updates
2. Azure AI Blog — Azure OpenAI, Copilot Stack changes
3. Groq Blog (groq.com/blog) — inference speed records, new model support
4. Together AI Blog (together.ai/blog) — open model hosting, fine-tuning updates
5. NVIDIA Developer Blog — TensorRT-LLM, CUDA, inference optimization
6. Modal Blog (modal.com/blog) — GPU cloud, deployment updates
7. Fireworks AI Blog (fireworks.ai/blog) — inference optimization, model serving updates

Filter aggressively: only changes that affect how you run, deploy, or cost-optimize AI workloads.
Skip anything that's a restatement of a model announcement already covered by Agent A.
Return: entries with score ≥3 and impact tier.
```

#### Step 3: Consolidate, rank, and write (sequential — after all 5 agents complete)

```
You have outputs from 5 parallel scan agents covering labs, GitHub, research,
benchmarks/community, and infrastructure from {{SCAN_PERIOD}}.

Do the following in order:

1. Deduplicate: same story from multiple agents → keep the primary source entry, note other sources seen.

2. Assign final impact tiers based on criteria in personal/sources/ai-dev-sources.md:
   [BREAKING] → requires code changes
   [HIGH] → major release or significant capability change
   [MEDIUM] → notable update, useful new feature
   [NOTABLE] → minor release, incremental, worth knowing but not urgent

3. Sort within each category: [BREAKING] first, then [HIGH], then [MEDIUM], then [NOTABLE].

4. Identify cross-item themes: are multiple items about the same trend?
   Examples: "three labs shipped MoE models", "inference tooling had a big week",
   "breaking changes across two major APIs". Write 2-4 sentences on this for "This Week's Signal."

5. Select must-reads: which 1-3 items are most important? List them at the top.

6. Separate items into sections per the output format in agents/ai-news-agent.md.
   Put [NOTABLE] items in "Quick Hits" — no full entry, just title + one-line + link.
   Put anything announced-but-not-released in "Worth Watching."

7. Write the full digest using the output format from agents/ai-news-agent.md exactly.
   Every entry must have all fields: What changed, TL;DR, Developer signal, Affects you if,
   Adoption effort, Primary source, Quality gate score.

8. Write the Horizon section (the collapsible <details> block at the end).
   This is separate from the main digest and operates under different rules — grounded
   speculation is allowed here. Synthesize across the full set of items (not just top ones):
   - What patterns are visible across 2+ items?
   - What open questions do the items raise but not answer?
   - Are any items in tension with each other?
   - What does the current trajectory suggest, if it continues?
   - What new builder capabilities does this week's news unlock speculatively?
   Write 2-5 Horizon entries. Every entry must cite a specific item, paper, or number
   from the digest. Label each entry by type: [PATTERN], [OPEN QUESTION], [RESEARCH THREAD],
   [TENSION], [IF THIS CONTINUES], or [BUILDER'S ANGLE].

Report total: items found / quality gate passed / excluded. List notable near-misses by name.
```

### Outputs
Formatted digest in conversation.
Save to: `personal/digests/ai-{{DATE}}.md`

The digest is automatically readable on the website at `/digest/{{DATE}}`.
No extra steps needed — the website reads directly from `personal/digests/`.

### Example Invocation
```
Read workflows/ai-news-digest.md, then run Mode 1 News Scan.
Period: last 24 hours
Depth: standard digest
```

---

## Mode 2: Deep Research

### Trigger
You heard about something specific and want to understand it fully:
a new model, a framework release, a paper, a technique, a product decision.

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
- "{{TOPIC}}" site:huggingface.co/blog
- "{{TOPIC}} benchmark" — find any third-party evaluations
- "{{TOPIC}}" site:paperswithcode.com

List every candidate source before fetching. Prioritize tier 1 sources.
Do not start fetching until the full candidate list is assembled.
```

#### Step 2: Deep read (parallel — fetch all sources at once)
```
Use WebFetch to read EVERY primary source found in Step 1 in full.

For papers: read abstract, introduction, methodology, results, and conclusion.
  Note: specific numbers claimed, benchmark methodology, comparison baselines,
  limitations acknowledged.

For GitHub repos: read README, recent commits, open issues with >10 comments.
  Note: what's broken/known-issue, what's on the roadmap.

For changelogs: read every entry completely.
  Note: what was removed vs. added vs. changed.

For blog posts: read the full article, not a skim.
  Note: what claims have numbers behind them vs. what is asserted without data.

For benchmark results: find the raw numbers, not the author's interpretation.
  Note: what tasks, what baselines, who ran the eval (self-reported vs. third-party).

Collect notes on: specific claims, numbers cited, code examples, acknowledged limitations,
gaps not addressed, contradictions between sources.
```

#### Step 3: Synthesize (sequential — after all fetches complete)
```
You have read all primary sources on: {{TOPIC}}
Angle: {{ANGLE}}
Output use: {{OUTPUT_USE}}

Think carefully before writing (use extended thinking if available, budget: 10000 tokens).
Consider:
- What is definitively established vs. what is implied?
- What contradictions exist across sources?
- What does the benchmark methodology actually measure? What doesn't it measure?
- What would a skeptical senior developer want to know before adopting this?
- How does this compare to the closest alternatives?
- What's missing from what you read — what questions can't you answer from primary sources?

Write the deep research report using the deep research format in agents/ai-news-agent.md.
Include a "Benchmark Reality Check" section — don't just quote the numbers, assess what they mean.
Include every primary source in the sources section with a note on what it covers.
Be honest about gaps and unknowns — do not fill them with speculation.
If you can't find the answer from primary sources, say so.
```

### Outputs
Deep research report in conversation.
Save to: `personal/research/{{TOPIC-SLUG}}-{{DATE}}.md`

### Example Invocation
```
Read workflows/ai-news-digest.md, then run Mode 2 Deep Research.
Topic: vLLM 0.8 prefix caching
Angle: what the real-world throughput improvement looks like and when it applies
Output use: decide whether to enable it in our production inference setup
```

---

## Scheduling This Workflow

To run the news scan automatically on a schedule, use `/schedule`:

**Daily lightweight scan:**
```
/schedule
Run workflows/ai-news-digest.md Mode 1 every weekday morning at 8am.
Period: last 24 hours. Depth: standard digest.
Save output to personal/digests/ai-{{DATE}}.md.
```

**Weekly full digest:**
```
/schedule
Run workflows/ai-news-digest.md Mode 1 every Monday at 9am.
Period: last 7 days. Depth: standard digest.
Save output to personal/digests/ai-weekly-{{DATE}}.md.
```

---

## Reading Digests on the Website

All saved digests appear automatically at `/digest` on the Dev Hub website.
Each digest at `personal/digests/ai-{{DATE}}.md` is readable at `/digest/{{DATE}}`.

The website renders full markdown with syntax highlighting, section headers,
and styled TL;DR / Developer signal blocks.
