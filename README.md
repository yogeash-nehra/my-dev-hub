# Yogi Dev Hub

Personal multi-agent workspace for dev, automation, and business operations —
and home of the **AI Developer Digest**, a quality-gated scan of what actually
shipped for developers, rendered as a browsable site.

- **Domains:** `dev/`, `ops/`, `personal/` — each with its own `CLAUDE.md` and prompt templates
- **Agents:** `agents/` — dev, research, ops, and AI-news system prompts
- **Workflows:** `workflows/` — daily brief, code review, weekly digest, AI news digest
- **Site:** Next.js app that renders digests from `personal/digests/` at `/digest/{date}`

```bash
npm install && npm run dev   # → localhost:3000
```

---

## Sources

The AI Developer Digest reads from a curated, tiered source list. The canonical,
always-current version — with feed URLs, the fetch policy, the quality-gate
rubric, and impact-tier criteria — lives in
[`personal/sources/ai-dev-sources.md`](personal/sources/ai-dev-sources.md).
This section is the human-readable index of everything it looks at.

> **Feeds first.** Where a machine-readable RSS/Atom feed exists it's fetched
> before the HTML page; any GitHub repo exposes `.../releases.atom`. See the
> Fetch Policy in the sources file.

### Tier 1 — First-Party Lab Sources (every scan)

Anthropic News · Anthropic Platform Release Notes · OpenAI Blog · OpenAI Platform
Changelog · Google DeepMind · Google AI for Developers · Meta AI · Mistral AI ·
xAI · Cohere · Groq · Together AI · Fireworks AI · Hugging Face Blog · AWS AI/ML
Blog · Azure AI Blog · NVIDIA Developer Blog · Microsoft Dev Platform Changelog ·
GitHub Changelog

**Open-weights labs:** DeepSeek · Alibaba Qwen · Zhipu / Z.ai (GLM) · Moonshot AI (Kimi)
— watched via their Hugging Face orgs and GitHub `releases.atom`.

### Tier 1 — GitHub Releases (every scan)

`huggingface/transformers` · `vllm-project/vllm` · `ollama/ollama` ·
`ggml-org/llama.cpp` · `langchain-ai/langchain` · `run-llama/llama_index` ·
`BerriAI/litellm` · `openai/openai-python` · `anthropics/anthropic-sdk-python` ·
`microsoft/DeepSpeed` · `unsloth/unsloth` · `NVIDIA/TensorRT-LLM` ·
`mlc-ai/mlc-llm` · `guidance-ai/guidance` · `microsoft/vscode-copilot` ·
`huggingface/diffusers` · `pytorch/pytorch` · `modal-labs/modal` ·
`microsoft/autogen` · `crewai-inc/crewAI` · `huggingface/smolagents` · `agno-agi/agno`

### Tier 1 — Research

arXiv new submissions: **cs.AI · cs.CL · cs.LG · cs.CV** (category RSS, filtered
for released code / measurable results / recognized labs).

### Tier 1 — Rising & Under-the-Radar Dev Tools (weekly) 🌱

Catches useful dev tools *while they're still climbing*, before they become
household names. The durable engine is discovery, not a static list:

- **GitHub Trending** — `github.com/trending` + language views (`weekly` / `monthly`)
- **star-history.com** — validates *sustained* momentum vs. a one-day spike
- **Changelog Nightly** — nightly email of the fastest-rising new repos
- **Star History Monthly** · **OSSInsight** — trending repos with real growth data
- **Lobsters** · **Hacker News (Show HN)** — where builders launch first
- **Terminal Trove** — catalog of new CLI/TUI tools
- **LibHunt** · **console.dev** · **Cooper Press weeklies** (JavaScript / Node /
  Golang / Python / React) — language-scoped curated tool roundups
- **Product Hunt — Dev Tools** · **GitHub search** (`stars:>500 created:>DATE`)

A rotating seed watchlist (in the sources file) calibrates the bar — e.g.
`nektos/act`, `casey/just`, `jesseduffield/lazygit`, `dandavison/delta`,
`astral-sh/uv`, `pocketbase/pocketbase`, `usebruno/bruno`, `coollabsio/coolify`,
`dagger/dagger`, `derailed/k9s`, `atuin-sh/atuin`, `duckdb/duckdb`.

Each digest also crowns a **🏆 Repo of the Day** — one featured repo (usually the
standout from this scan) with the problem it kills and a runnable "try it in 60
seconds" snippet. It renders as a spotlight at the top of the digest.

### Tier 1 — Benchmarks & Leaderboards (weekly)

LMSYS Chatbot Arena · Open LLM Leaderboard · BigCodeBench / LiveCodeBench ·
SWE-bench Verified · Papers With Code (State-of-the-Art)

### Tier 2 — High-Quality Technical Writers

Simon Willison · Sebastian Raschka · Lilian Weng · Andrej Karpathy · Nathan
Lambert (Interconnects) · Eugene Yan · Hamel Husain · The Gradient · BAIR Blog ·
AI2 Blog · Hugging Face Papers Daily · ML Papers of the Week (DAIR.AI) · Ethan
Mollick (One Useful Thing)

### Tier 2 — Community (filtered aggressively)

Hacker News · r/LocalLlama · r/MachineLearning · Twitter/X (verified
researchers only) · EleutherAI Discord (#announcements) · Hugging Face Community

### Newsletters (scanned via public web archive)

**TLDR Network:** AI · Dev · DevOps · Founders · IT · Hardware · Infosec · Data · main
**Independent:** Superhuman · The Batch (Andrew Ng) · Latent Space · AlphaSignal

> Newsletters are secondary sources — the digest always follows the primary link
> and scores *that*, not the newsletter blurb.

### Excluded (never cited)

General-audience tech press (TechCrunch, The Verge, Wired, VentureBeat, Forbes),
non-practitioner "AI Weekly" roundups, most Medium/LinkedIn AI posts, and anything
titled "X Explained Simply" / "What X Means For Your Business" / "The Future of AI".

---

*Adding a source?* Edit [`personal/sources/ai-dev-sources.md`](personal/sources/ai-dev-sources.md)
(the file the agent actually reads) and reflect it here.
