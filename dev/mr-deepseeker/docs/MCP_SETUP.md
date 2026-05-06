# Mr_Deepseeker — MCP Server Setup

This guide covers running Mr_Deepseeker as a native MCP server so Claude Code
can call its tools deterministically, without relying on keyword matching.

---

## 1. Install

```bash
pip install -r requirements-mcp.txt
```

This installs the `mcp` package only. It does not touch the core dependencies
already listed in the existing requirements files.

---

## 2. Configure

Open `.mcp.json` in the project root and paste your DeepSeek API key:

```json
{
  "mcpServers": {
    "mr-deepseeker": {
      "type": "stdio",
      "command": "python3",
      "args": ["./mcp_server.py"],
      "env": {
        "DEEPSEEK_API_KEY": "paste-your-key-here"
      }
    }
  }
}
```

Get a free key at https://platform.deepseek.com

Alternatively, set `DEEPSEEK_API_KEY` in your shell or in the project `.env`
file — `mcp_server.py` calls `load_env()` at startup and will pick it up.

---

## 3. Activate

Restart Claude Code (or reload the window). The server starts automatically via
stdio transport. You will see `mr-deepseeker` listed in the MCP panel.

No separate `python3 mcp_server.py` invocation is needed — Claude Code manages
the process lifecycle.

---

## 4. Tool Usage Examples

Each tool is invoked by Claude automatically when you phrase a request naturally:

| Tool | Example prompt |
|---|---|
| `deepseek_review` | "Review the `src/` folder for bugs" |
| `deepseek_write_tests` | "Write tests for `mr_deepseeker/llm_client.py`" |
| `deepseek_generate` | "Generate a Python async rate limiter with token bucket" |
| `deepseek_write_docstrings` | "Add docstrings to `mr_deepseeker/boilerplate.py`" |
| `deepseek_translate` | "Translate `mr_deepseeker/env.py` to TypeScript" |

You can also call tools explicitly:

```
Use deepseek_review on ./mr_deepseeker with context "focus on thread safety"
```

---

## 5. Fallback Chain

`mcp_server.py` delegates all LLM calls through `llm_client.py`, which tries
providers in this order until one succeeds:

```
DeepSeek  →  Ollama (local)  →  OpenRouter  →  Groq
```

- **DeepSeek** (`DEEPSEEK_API_KEY`) — primary, cheapest for code tasks
- **Ollama** — local fallback, no key needed, defaults to `qwen2.5:1.5b`
- **OpenRouter** (`OPENROUTER_API_KEY`) — cloud fallback, free tier available
- **Groq** (`GROQ_API_KEY`) — final cloud fallback, fast inference

Set any combination of keys in `.env` or `.mcp.json`'s `env` block. The chain
is transparent — tools work the same regardless of which backend answers.

---

## 6. MCP vs SKILL.md

**Keep both files** — they serve different purposes:

`SKILL.md` is a natural-language hint file that Claude reads and pattern-matches
against your prompts. It works without any installation and is useful in any
Claude session, but invocation depends on Claude recognising the right keywords
in context.

The MCP server gives **deterministic invocation**: Claude Code calls tools
directly by name via the protocol, with typed parameters, structured errors, and
no ambiguity. It also surfaces the tools in the MCP panel and makes them
available to any MCP-compatible client, not just Claude Code.

Use `SKILL.md` for lightweight, install-free sessions. Use the MCP server when
you want reliable, repeatable tool calls integrated into your Claude Code
workflow.
