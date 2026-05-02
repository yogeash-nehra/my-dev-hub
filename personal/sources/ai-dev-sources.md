# AI Developer Sources — Curated Quality List

Sources are tiered by trust level and technical depth. The AI news agent
reads this file before every scan to know where to look and what to skip.

---

## Tier 1 — First-Party (Always Check)

These are official sources from the teams building the things.
Treat everything here as high signal.

| Source | URL | What to look for |
|--------|-----|-----------------|
| Anthropic News | anthropic.com/news | Model releases, API changes, safety research, Claude updates |
| OpenAI Blog | openai.com/blog | Model releases, API updates (skip policy/opinion posts) |
| Google DeepMind | deepmind.google/research | Research papers, model announcements |
| Google AI Blog | ai.google.dev/gemini | Gemini API updates, technical posts |
| Meta AI | ai.meta.com/blog | Llama releases, research papers |
| Mistral AI | mistral.ai/news | Model releases, API changes |
| xAI | x.ai/blog | Grok releases and updates |
| Cohere | cohere.com/blog | Enterprise LLM updates, API features |

### GitHub Releases (check weekly)
These repos ship fast — releases often contain the real news before blog posts:

| Repo | What changes matter |
|------|-------------------|
| huggingface/transformers | New model architectures, tokenizer updates |
| vllm-project/vllm | Inference performance, new model support |
| ollama/ollama | Local model support, performance |
| langchain-ai/langchain | New integrations, breaking changes |
| run-llama/llama_index | Retrieval improvements, new connectors |
| BerriAI/litellm | New model support, routing features |
| ggerganov/llama.cpp | Quantization, hardware support, speed |
| openai/openai-python | API client changes |
| anthropics/anthropic-sdk-python | Claude SDK changes |
| microsoft/vscode-copilot | IDE AI features |

### arXiv (cs.AI, cs.CL, cs.LG — new submissions daily)
Filter for papers that:
- Introduce a new model, benchmark, or training technique
- Show measurable performance improvements with numbers
- Are from recognized labs (DeepMind, Meta FAIR, CMU, Stanford, MIT)
- Have an associated GitHub repo

---

## Tier 2 — High-Quality Technical Writers

These are individuals or publications with strong technical credibility.
Read carefully — skim the title first for the "developer signal" (does this teach something real?).

| Source | URL | Why trusted |
|--------|-----|-------------|
| Simon Willison | simonwillison.net | Meticulous researcher, always links primary sources, no hype |
| Sebastian Raschka | magazine.sebastianraschka.com | Deep ML/LLM technical posts, benchmarked |
| The Gradient | thegradient.pub | Long-form technical AI research discussion |
| BAIR Blog | bair.berkeley.edu/blog | Berkeley AI research, links to papers |
| Lilian Weng | lilianweng.github.io | Deep dives on architectures and techniques |
| Andrej Karpathy | karpathy.ai | Rare posts but extremely high value |
| Eugene Yan | eugeneyan.com | Applied LLM engineering, RAG, evals |
| Hamel Husain | hamel.dev | Fine-tuning, evaluation, practical LLM ops |

---

## Tier 2 — Community (Filter Aggressively)

High noise but occasionally the best signal comes through first here.

| Source | Filter |
|--------|--------|
| Hacker News (news.ycombinator.com) | Only: Show HN, Ask HN, score >200, points-to-comments ratio suggests technical depth |
| r/LocalLlama | Filter to: benchmark posts, release announcements, technical comparisons |
| r/MachineLearning | Filter to: paper discussions, not news aggregation |
| Twitter/X | Only verified researchers, check linked primary source before including |

---

## Sources to Exclude (Never Cite)

These consistently produce low-value content for developers:

- Medium AI publications (unless direct link to known author from Tier 2)
- "AI Weekly" roundup newsletters from non-practitioners
- TechCrunch, The Verge, Wired (for AI dev news — they write for general audience)
- Most LinkedIn posts about AI
- Anything titled: "X Explained Simply", "What X Means For Your Business", "The Future of AI"
- Aggregator posts that summarize other aggregator posts
- Any post with "game-changer", "revolutionary", "groundbreaking" without supporting data

---

## Quality Gate Checklist

Before including any article in a digest, score it:

| Signal | Score |
|--------|-------|
| Written by the team that built it | +3 |
| Contains code, benchmarks, or API changes | +2 |
| Links to GitHub PR, arXiv paper, or changelog | +2 |
| Published within 7 days (for news mode) | +1 |
| Technical audience assumed (no "for beginners" framing) | +1 |
| | |
| Uses "game-changer", "revolutionary" without data | -2 |
| No primary source links | -2 |
| Opinion/prediction framing ("I think X will...") | -2 |
| Paraphrase-heavy, no specifics | -2 |
| Author clearly hasn't used/run the thing | -3 |

**Minimum score to include: 3**
