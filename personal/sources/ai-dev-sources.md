# AI Developer Sources — Curated Quality List

Sources are tiered by trust level and technical depth. The AI news agent
reads this file before every scan to know where to look and what to skip.

Where a machine-readable feed exists, it is listed in the **Feed** column and
should be fetched **before** the HTML page — see the Fetch Policy below.

---

## Fetch Policy — Feeds First

Scraping HTML blog pages is unreliable: a large share of scans lose real
stories to `HTTP 403`, bot blocks, and paywalls. Prefer structured feeds.

1. **Feeds before HTML.** For any source, try its RSS/Atom feed first. Only
   fall back to scraping the HTML page if the feed is missing, empty, or errors.
2. **Send a real User-Agent.** Many feeds and pages reject default bot/library
   user-agents with 403. Use a normal browser UA string.
3. **Feed discovery order** for a source with no feed listed below — try, in order:
   `/<path>/feed`, `/feed.xml`, `/rss.xml`, `/atom.xml`, `/blog/feed.xml`,
   `/index.xml`. Record any feed you find back into this file.
4. **GitHub repos → Atom is guaranteed.** Any repo exposes
   `https://github.com/<owner>/<repo>/releases.atom` (and `/tags.atom` and
   `/commits/<branch>.atom`). Always prefer these over a project's blog.
5. **arXiv → category RSS.** `http://export.arxiv.org/rss/cs.AI` (also
   `cs.CL`, `cs.LG`, `cs.CV`) — new submissions daily.
6. **On failure, degrade gracefully:** feed → HTML → cached/mirror → a
   corroborating secondary source. If nothing resolves, exclude and log the
   fetch failure in the digest's near-misses rather than guessing.
7. **Track coverage.** A source marked `scrape` has no known feed yet — treat
   it as lower-reliability and double-check with a second source before relying
   on it.
8. **GitHub Trending has no official API.** `github.com/trending` (and
   `/trending/<language>?since=daily|weekly|monthly`) is server-rendered HTML —
   fetch it with a real User-Agent. Community JSON mirrors exist as a fallback
   (e.g. `https://api.gitterapp.com/repositories?language=&since=daily`); treat
   any mirror as unofficial and re-verify a repo's real numbers on GitHub before
   citing it.
9. **star-history.com is a validation tool, not a feed.** Use it to *confirm
   momentum*, never as a discovery source on its own. The star-count time series
   for any repo is fetchable as a chart/JSON at
   `star-history.com/#<owner>/<repo>&Date`. What you're checking: is the star
   curve bending *upward recently* (genuine, sustained growth) versus a one-time
   spike from a single HN/Reddit thread that already flattened. A repo only earns
   a Rising Dev Tools slot if star-history shows the former.

---

## Tier 1 — First-Party Lab Sources (Always Check)

Official sources from the teams building frontier models and APIs.
Treat everything here as high signal. Check every scan cycle.

| Source | URL | What to look for | Feed |
|--------|-----|-----------------|------|
| Anthropic News | anthropic.com/news | Model releases, API changes, safety research, Claude updates | scrape |
| Anthropic Platform Release Notes | platform.claude.com/docs/en/release-notes/overview | Breaking API/SDK changes, feature launches, deprecations | scrape |
| OpenAI Blog | openai.com/news | Model releases, API updates (skip policy/opinion posts) | per policy |
| OpenAI Platform Changelog | platform.openai.com/docs/changelog | API-level changes, model deprecations | scrape |
| Google DeepMind | deepmind.google/research | Research papers, model announcements | per policy |
| Google AI for Developers | ai.google.dev | Gemini API updates, technical posts, SDK changes | per policy |
| Meta AI | ai.meta.com/blog | Llama releases, research papers | per policy |
| Mistral AI | mistral.ai/news | Model releases, API changes | per policy |
| xAI | x.ai/news | Grok releases and updates | per policy |
| Cohere | cohere.com/blog | Enterprise LLM updates, API features | per policy |
| Groq | groq.com/blog | Inference speed records, new model support | per policy |
| Together AI | together.ai/blog | Open model hosting, fine-tuning, inference updates | per policy |
| Fireworks AI | fireworks.ai/blog | Inference optimization, model serving | per policy |
| Hugging Face Blog | huggingface.co/blog | Model releases, research, technical posts, dataset releases | huggingface.co/blog/feed.xml |
| AWS AI/ML Blog | aws.amazon.com/blogs/machine-learning | Bedrock, SageMaker, AWS-hosted model updates | aws.amazon.com/blogs/machine-learning/feed/ |
| Azure AI Blog | techcommunity.microsoft.com/t5/ai-azure-ai-services-blog | Azure OpenAI, Copilot Stack, Azure AI Foundry | TechCommunity board RSS |
| NVIDIA Developer Blog | developer.nvidia.com/blog/category/ai | TensorRT-LLM, CUDA, inference optimization | developer.nvidia.com/blog/feed/ |
| Microsoft Dev Platform Changelog | developer.microsoft.com/en-us/microsoft-365/changelog | Microsoft Graph, M365 Copilot extensibility, Teams/Windows dev APIs | developer.microsoft.com/api/changelog/rss |
| GitHub Changelog | github.blog/changelog | GitHub Copilot, Copilot coding agent, GitHub Models, Actions | github.blog/changelog/feed/ |

### Frontier Labs — Open Weights (check every scan)

These labs drive a large share of open-weight releases and already dominate the
digest's *output* — but today they only reach it via arXiv/HN/secondary coverage,
which is slow and lossy. Watch their official channels and Hugging Face orgs
directly. Prefer the `releases.atom` of each flagship GitHub repo.

| Lab | Hugging Face org | GitHub org | What to look for |
|-----|------------------|-----------|------------------|
| DeepSeek | huggingface.co/deepseek-ai | github.com/deepseek-ai | V-series / R-series model + paper drops, MoE/efficiency work |
| Alibaba Qwen | huggingface.co/Qwen | github.com/QwenLM | Qwen model family releases, coding/agent variants |
| Zhipu / Z.ai (GLM, formerly THUDM) | huggingface.co/zai-org | github.com/zai-org | GLM model releases, agentic/coding models |
| Moonshot AI (Kimi) | huggingface.co/moonshotai | github.com/MoonshotAI | Kimi releases, long-context + agentic work |

### GitHub Releases (check every scan)
These repos ship fast — releases often contain real news before blog posts appear.
**Feed for any repo below:** `https://github.com/<owner>/<repo>/releases.atom`
(also `/tags.atom`). Prefer these Atom feeds over scraping.

| Repo | What changes matter |
|------|-------------------|
| huggingface/transformers | New model architectures, tokenizer updates, pipeline changes |
| vllm-project/vllm | Inference performance, new model support, quantization |
| ollama/ollama | Local model support, performance, new model pull support |
| ggml-org/llama.cpp | Quantization, hardware support (Snapdragon, Apple Silicon, CUDA), speed |
| langchain-ai/langchain | New integrations, breaking changes, new chain types |
| run-llama/llama_index | Retrieval improvements, new connectors, agentic features |
| BerriAI/litellm | New model support, routing, proxy features |
| openai/openai-python | API client changes, new endpoints |
| anthropics/anthropic-sdk-python | Claude SDK changes, new features |
| microsoft/DeepSpeed | Training optimization, ZeRO stages, inference speed |
| unsloth/unsloth | Fine-tuning efficiency improvements, new model support |
| NVIDIA/TensorRT-LLM | Enterprise inference, new GPU support, quantization |
| mlc-ai/mlc-llm | On-device inference, WebLLM, mobile support |
| guidance-ai/guidance | Structured generation, constrained decoding |
| microsoft/vscode-copilot | IDE AI features |
| huggingface/diffusers | Image/video generation models, LoRA updates |
| pytorch/pytorch | Core ML framework releases |
| modal-labs/modal | GPU cloud deployment, serverless AI |
| microsoft/autogen | Multi-agent framework releases, new agent patterns |
| crewai-inc/crewAI | Agentic workflow releases, new tool integrations |
| huggingface/smolagents | Lightweight agent framework releases, new model support |
| agno-agi/agno | Agentic framework releases, memory/tooling additions |

### arXiv (cs.AI, cs.CL, cs.LG, cs.CV — new submissions daily)
Feeds: `http://export.arxiv.org/rss/cs.AI`, `/cs.CL`, `/cs.LG`, `/cs.CV`.
Filter for papers that:
- Introduce a new model, benchmark, or training technique
- Show measurable performance improvements with numbers
- Are from recognized labs (DeepMind, Meta FAIR, CMU, Stanford, MIT, AI2, Mila, ETH, Oxford)
- Have an associated GitHub repo or released weights

---

## Tier 1 — Rising & Under-the-Radar Dev Tools (Discovery, Check Weekly)

Great developer tools rarely arrive as a lab blog post — they show up as a
fast-climbing GitHub repo that solves a real, specific pain (build times, git
ergonomics, local infra, observability, DX) months before anyone writes about
them. This section exists to catch those *while they're still early*, not after
they've won. Different mandate from the rest of this file: here we're hunting
for the useful-but-quiet, not the already-famous.

### Discovery engine (how to find them)

1. **GitHub Trending** — `github.com/trending` and the language-scoped views
   `github.com/trending/{go,rust,python,typescript,zig}?since={daily,weekly,monthly}`.
   Scan `weekly` and `monthly` (daily is too noisy). Fetch policy point 8 applies.
2. **star-history.com** — for every trending candidate, pull its star curve
   (`star-history.com/#owner/repo&Date`) and keep only repos whose growth is
   *recent and sustained*, not a flattened one-day spike. Fetch policy point 9.
3. **Where else the quiet ones surface** (curated discovery — all high-signal for
   under-the-radar dev tools):

   | Source | URL | Why it's good | Feed |
   |--------|-----|---------------|------|
   | Changelog Nightly | changelog.com/nightly | Nightly email of the day's fastest-rising **new** GitHub repos — built for exactly this | email/archive |
   | Star History Monthly | star-history.com (newsletter) | Monthly roundup of trending repos with the star curves already drawn | scrape |
   | OSSInsight | ossinsight.io | Analytics-backed trending repos + curated "collections"; real growth data, not vibes | scrape |
   | Lobsters | lobste.rs | Higher signal-to-noise than HN; tag-filtered | lobste.rs/rss, lobste.rs/t/{programming,devops,ml}.rss |
   | Hacker News — Show HN | news.ycombinator.com (Show HN, score >150) | Where builders launch their tools first | hnrss.org/show |
   | Terminal Trove | terminaltrove.com | Catalog of new CLI/TUI tools — very on-theme for quiet dev gems | scrape |
   | LibHunt | libhunt.com | Trending libraries per language (Awesome-* powered) | per-language RSS |
   | console.dev | console.dev/tools | Weekly hand-picked dev tools, opinionated reviews | console.dev/rss.xml |
   | Cooper Press weeklies | javascriptweekly.com, nodeweekly.com, golangweekly.com, pythonweekly.com, react.statuscode.com | Language-scoped curated tool/release roundups | each has /rss |
   | Product Hunt — Dev Tools | producthunt.com/topics/developer-tools | Launch-day discovery; filter to the Trending tab | scrape |
   | GitHub search (new + rising) | `github.com/search?q=stars:>500+created:>{{DATE}}&s=stars&type=repositories` | Directly surfaces repos created recently that already gained traction | scrape |

### Selection filter — what earns a slot

A repo qualifies as a **Rising Dev Tool** only if it clears ALL of these:
- **Solves a concrete developer problem** you can state in one sentence
  ("run GitHub Actions locally", "readable git diffs", "one-file backend").
- **Under-the-radar:** roughly < 25k stars, OR clearly newer/less-known than the
  dominant tool in its niche. A 100k-star household name does not belong here —
  it goes in the main digest if it ships news.
- **Real momentum:** star-history shows a recently steepening curve, not a spike
  that already flattened.
- **Actually usable now:** has releases/tags, a real README with install steps,
  and commits within the last ~90 days (not abandoned, not vaporware).
- **Not just an LLM wrapper:** general dev-productivity tools are the target.
  AI/LLM infra repos already have a home in the GitHub Releases table above.

Score each with the quality gate as usual, then tag impact tier. Most Rising Dev
Tools will be `[NOTABLE]`; one that genuinely changes a workflow can be `[HIGH]`.

### Seed watchlist (rotating — replace as they graduate or stall)

These are real, currently-underrated tools solving real problems, grouped by the
pain they kill. Use them as calibration for "the kind of thing we're looking
for" and check their `releases.atom` for updates — but the discovery engine
above is the durable source; this list is expected to churn.

| Repo | Problem it solves |
|------|-------------------|
| nektos/act | Run GitHub Actions workflows locally before pushing |
| casey/just | A saner command runner to replace tangled Makefiles |
| jesseduffield/lazygit | Full git operations from a fast terminal UI |
| dandavison/delta | Readable, syntax-highlighted git diffs and blame |
| astral-sh/uv | Extremely fast Python packaging/venv/resolver |
| pocketbase/pocketbase | Backend (DB + auth + API) in a single Go binary |
| usebruno/bruno | Git-friendly, offline API client (Postman alternative) |
| coollabsio/coolify | Self-hosted Heroku/Netlify alternative for deploys |
| dagger/dagger | Portable, programmable CI/CD pipelines as code |
| derailed/k9s | Navigate and debug Kubernetes clusters from a TUI |
| wagoodman/dive | Inspect and shrink Docker image layers |
| atuin-sh/atuin | Searchable, syncable, encrypted shell history |
| zellij-org/zellij | Terminal multiplexer with sane defaults and layouts |
| sxyazi/yazi | Fast, async terminal file manager |
| evilmartians/lefthook | Fast, language-agnostic git hooks manager |
| tursodatabase/turso | Embedded SQLite-compatible DB for the edge |
| duckdb/duckdb | In-process OLAP — analytics without a data warehouse |

**Feed for any repo above:** `https://github.com/<owner>/<repo>/releases.atom`.

---

## Tier 1 — Benchmarks and Leaderboards (Check Weekly)

These track the real-world state of model capabilities. Changes here are news.

| Source | URL | What to watch |
|--------|-----|---------------|
| LMSYS Chatbot Arena | lmarena.ai | ELO ranking changes, new model entries, head-to-head upsets |
| Open LLM Leaderboard | huggingface.co/spaces/open-llm-leaderboard | New top-ranked open models, benchmark score movement |
| BigCodeBench / LiveCodeBench | bigcode-bench.github.io, livecodebench.github.io | Coding benchmark leaderboard changes |
| SWE-bench Verified | swebench.com | New models cracking top positions (especially >50%) |
| Papers With Code State-of-the-Art | paperswithcode.com/sota | SOTA changes across key NLP/CV/RL tasks |

---

## Tier 2 — High-Quality Technical Writers

Individuals or publications with strong technical credibility.
Read carefully — skim the title first for the "developer signal."

| Source | URL | Why trusted | Feed |
|--------|-----|-------------|------|
| Simon Willison | simonwillison.net | Meticulous researcher, always links primary sources, no hype | simonwillison.net/atom/everything/ |
| Sebastian Raschka | magazine.sebastianraschka.com | Deep ML/LLM technical posts, benchmarked, rigorous | magazine.sebastianraschka.com/feed |
| Lilian Weng | lilianweng.github.io | Deep dives on architectures and techniques, very thorough | lilianweng.github.io/index.xml |
| Andrej Karpathy | karpathy.ai | Rare posts but extremely high value | per policy |
| Nathan Lambert | interconnects.ai | RLHF, alignment, post-training research — deep technical | interconnects.ai/feed |
| Eugene Yan | eugeneyan.com | Applied LLM engineering, RAG, evals, production patterns | eugeneyan.com/rss/ |
| Hamel Husain | hamel.dev | Fine-tuning, evaluation, practical LLM ops | per policy |
| The Gradient | thegradient.pub | Long-form technical AI research discussion | thegradient.pub/rss/ |
| BAIR Blog | bair.berkeley.edu/blog | Berkeley AI research, links to papers | bair.berkeley.edu/blog/feed.xml |
| AI2 Blog | allenai.org/blog | Allen Institute research, open models (Olmo, Tulu) | per policy |
| Hugging Face Papers Daily | huggingface.co/papers | Daily curated papers with community discussion — high signal | scrape |
| ML Papers of the Week (DAIR.AI) | github.com/dair-ai/ML-Papers-of-the-Week | Curated top ML papers each week | github.com/dair-ai/ML-Papers-of-the-Week/commits/main.atom |
| Ethan Mollick (One Useful Thing) | oneusefulthing.org | Practical AI use, benchmarked experiments, educator perspective | oneusefulthing.org/feed |
| Aishwarya Naresh Reganti (The Nuanced Perspective) | thenuancedperspective.substack.com | Applied AI research, enterprise/GenAI, agentic workflows & AI-native products — practitioner depth, anti-hype | thenuancedperspective.substack.com/feed |

> Note on The Nuanced Perspective: scan the **written** Substack posts (the `/feed`
> RSS), not the `+youtube@substack.com` email alias — YouTube uploads with no
> transcript or written notes fall under the podcast/video exclusion below. As a
> practitioner newsletter it's a secondary source: follow the primary link it
> cites and score *that*, per the newsletter policy.

---

## Tier 2 — Community (Filter Aggressively)

High noise but occasionally the best signal comes through first here.

| Source | Filter |
|--------|--------|
| Hacker News (news.ycombinator.com) | Only: Show HN, Ask HN, score >200, points-to-comments ratio suggests technical depth |
| r/LocalLlama | Filter to: benchmark posts, release announcements, technical comparisons. Skip: "which model should I use" posts |
| r/MachineLearning | Filter to: paper discussions, not news aggregation |
| Twitter/X | Only verified researchers/engineers. Always check linked primary source before including. High-value accounts: @karpathy, @ylecun, @GaryMarcus, @DrJimFan, @srush_nlp, @cwolferesearch |
| EleutherAI Discord | #announcements only — model releases, dataset releases |
| Hugging Face Community | Filter to release announcements and paper discussions with >50 likes |

> Community feeds: Hacker News exposes RSS via `hnrss.org` (e.g.
> `https://hnrss.org/newest?q=AI&points=200`); most subreddits expose
> `https://www.reddit.com/r/<sub>/.rss`. Prefer these over scraping, per policy.

---

## Newsletters (Scan via Web Archive)

Practitioner-curated newsletters with public web archives. Fetch via WebFetch — all URLs below are confirmed working.
These are secondary sources — always follow the primary source link and score that, not the newsletter blurb.
Value: practitioner curation signal and coverage of hardware/infra/IT areas that web scanning misses.

### TLDR Network
URL format: `https://tldr.tech/{edition}/YYYY-MM-DD` — substitute today's date. All confirmed working.

| Newsletter | URL slug | What to extract |
|------------|----------|-----------------|
| TLDR AI | `tldr.tech/ai/YYYY-MM-DD` | Model releases, research papers, AI tooling — **highest priority** |
| TLDR Dev | `tldr.tech/dev/YYYY-MM-DD` | SDK changes, framework releases, developer tooling |
| TLDR DevOps | `tldr.tech/devops/YYYY-MM-DD` | Infrastructure, CI/CD, Kubernetes, cloud platform changes |
| TLDR Founders | `tldr.tech/founders/YYYY-MM-DD` | Dev tool and AI startup launches with technical substance |
| TLDR IT | `tldr.tech/it/YYYY-MM-DD` | Enterprise software, IT infra — low priority unless AI-adjacent |
| TLDR Hardware | `tldr.tech/hardware/YYYY-MM-DD` | GPU releases, chip news, hardware acceleration |
| TLDR Infosec | `tldr.tech/infosec/YYYY-MM-DD` | Security vulnerabilities, breaches affecting AI/dev tooling |
| TLDR Data | `tldr.tech/data/YYYY-MM-DD` | Data engineering, ML pipelines, analytics tooling |
| TLDR (main) | `tldr.tech/YYYY-MM-DD` | Mixed tech — filter aggressively, extract AI/dev items only |

### Independent Newsletters
| Newsletter | Archive URL | Individual issue format | What to extract |
|------------|-------------|------------------------|-----------------|
| Superhuman (Zain K.) | `superhuman.ai/archive` | `superhuman.ai/p/[slug]` | Daily AI brief — model news, tool launches, practitioner angle |
| The Batch (Andrew Ng) | `deeplearning.ai/the-batch/` | `deeplearning.ai/the-batch/issue-[N]` | Weekly; high-signal research, model releases, applied AI |
| Latent Space (swyx & Alessio) | `latent.space/archive` | `latent.space/p/[slug]` | AI engineering deep dives — inference, agents, frameworks |
| AlphaSignal | `alphasignal.ai` | `alphasignal.ai/news/[slug]` | ML papers, models, tools — good for research items |

**Fetch tip:** For TLDR, use `WebFetch https://tldr.tech/ai/YYYY-MM-DD` directly. If the issue isn't published yet (weekend/holiday), try the previous weekday.
**Quality gate:** Score the linked primary source (≥3 to include). The newsletter entry itself is not a source.

---

## Sources to Exclude (Never Cite)

These consistently produce low-value content for developers:

- Medium AI publications (unless direct link to a known author from Tier 2)
- "AI Weekly" roundup newsletters from non-practitioners
- TechCrunch, The Verge, Wired (for AI dev news — they write for general audience)
- VentureBeat, Forbes AI coverage
- Most LinkedIn posts about AI
- Anything titled: "X Explained Simply", "What X Means For Your Business", "The Future of AI"
- Aggregator posts that summarize other aggregator posts
- Any post with "game-changer", "revolutionary", "groundbreaking" without supporting data
- Podcasts without accompanying written transcript or show notes with specifics

---

## Quality Gate Checklist

Before including any article in a digest, score it:

| Signal | Score |
|--------|-------|
| Written by the team that built it (official lab/repo source) | +3 |
| Contains code, benchmarks, or concrete API changes | +2 |
| Links to GitHub PR, arXiv paper, or changelog as primary source | +2 |
| Published within scan window (24h for daily, 7d for weekly) | +1 |
| Technical audience assumed (no "for beginners" framing) | +1 |
| Has a GitHub repo with the paper / associated code | +1 |
| | |
| Uses "game-changer", "revolutionary" without supporting data | -2 |
| No primary source links (no paper, no PR, no changelog) | -2 |
| Opinion/prediction framing ("I think X will...") | -2 |
| Paraphrase-heavy, no specifics or concrete numbers | -2 |
| Author clearly hasn't used or run the thing | -3 |
| Published outside the scan window | -1 |

**Minimum score to include: 3**

### Impact Tier Assignment (assign after quality gate passes)

| Tier | Label | Criteria |
|------|-------|----------|
| 1 | `[BREAKING]` | API/SDK breaking change, deprecated endpoint, removed feature — requires code changes |
| 2 | `[HIGH]` | Major model release, significant capability jump, important new tool |
| 3 | `[MEDIUM]` | Notable update, useful new feature, interesting paper with clear implications |
| 4 | `[NOTABLE]` | Minor release, incremental improvement, worth knowing but not urgent |
