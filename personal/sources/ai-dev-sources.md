# AI Developer Sources — Curated Quality List

Sources are tiered by trust level and technical depth. The AI news agent
reads this file before every scan to know where to look and what to skip.

---

## Tier 1 — First-Party Lab Sources (Always Check)

Official sources from the teams building frontier models and APIs.
Treat everything here as high signal. Check every scan cycle.

| Source | URL | What to look for |
|--------|-----|-----------------|
| Anthropic News | anthropic.com/news | Model releases, API changes, safety research, Claude updates |
| Anthropic Platform Release Notes | platform.claude.com/docs/en/release-notes/overview | Breaking API/SDK changes, feature launches, deprecations |
| OpenAI Blog | openai.com/blog | Model releases, API updates (skip policy/opinion posts) |
| OpenAI Platform Changelog | platform.openai.com/docs/changelog | API-level changes, model deprecations |
| Google DeepMind | deepmind.google/research | Research papers, model announcements |
| Google AI for Developers | ai.google.dev | Gemini API updates, technical posts, SDK changes |
| Meta AI | ai.meta.com/blog | Llama releases, research papers |
| Mistral AI | mistral.ai/news | Model releases, API changes |
| xAI | x.ai/blog | Grok releases and updates |
| Cohere | cohere.com/blog | Enterprise LLM updates, API features |
| Groq | groq.com/blog | Inference speed records, new model support |
| Together AI | together.ai/blog | Open model hosting, fine-tuning, inference updates |
| Fireworks AI | fireworks.ai/blog | Inference optimization, model serving |
| Hugging Face Blog | huggingface.co/blog | Model releases, research, technical posts, dataset releases |
| AWS AI/ML Blog | aws.amazon.com/blogs/machine-learning | Bedrock, SageMaker, AWS-hosted model updates |
| Azure AI Blog | techcommunity.microsoft.com/t5/ai-azure-ai-services-blog | Azure OpenAI, Copilot Stack, Azure AI Studio |
| NVIDIA Developer Blog | developer.nvidia.com/blog/category/ai | TensorRT-LLM, CUDA, inference optimization |

### GitHub Releases (check every scan)
These repos ship fast — releases often contain real news before blog posts appear.

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

| Source | URL | Why trusted |
|--------|-----|-------------|
| Simon Willison | simonwillison.net | Meticulous researcher, always links primary sources, no hype |
| Sebastian Raschka | magazine.sebastianraschka.com | Deep ML/LLM technical posts, benchmarked, rigorous |
| Lilian Weng | lilianweng.github.io | Deep dives on architectures and techniques, very thorough |
| Andrej Karpathy | karpathy.ai | Rare posts but extremely high value |
| Nathan Lambert | interconnects.ai | RLHF, alignment, post-training research — deep technical |
| Eugene Yan | eugeneyan.com | Applied LLM engineering, RAG, evals, production patterns |
| Hamel Husain | hamel.dev | Fine-tuning, evaluation, practical LLM ops |
| The Gradient | thegradient.pub | Long-form technical AI research discussion |
| BAIR Blog | bair.berkeley.edu/blog | Berkeley AI research, links to papers |
| AI2 Blog | allenai.org/blog | Allen Institute research, open models (Olmo, Tulu) |
| Hugging Face Papers Daily | huggingface.co/papers | Daily curated papers with community discussion — high signal |
| ML Papers of the Week (DAIR.AI) | github.com/dair-ai/ML-Papers-of-the-Week | Curated top ML papers each week |
| Ethan Mollick (One Useful Thing) | oneusefulthing.org | Practical AI use, benchmarked experiments, educator perspective |

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
