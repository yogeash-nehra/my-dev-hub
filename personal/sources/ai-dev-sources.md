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
