# Dev Hub MCP Server

An [MCP](https://modelcontextprotocol.io) server that turns this repo's markdown
knowledge base into a live, queryable service. Any MCP client — Claude Code,
Claude Desktop, or your own SDK app — can discover and use the Dev Hub's agents,
prompt templates, workflows, AI news digests, and project memory.

## Why this is useful

The hub stores real value as static markdown: agent system prompts, reusable
prompt templates, multi-step workflows, and 90+ daily AI digests. Without a
server, a client has to be told exactly which file to open. With this server it
can *ask*: "what agents exist?", "load the code-review workflow", "search my
digests for MCP", "act as the dev agent on this task".

## Capabilities

### Tools

| Tool | What it does |
|------|--------------|
| `list_agents` | List agent system prompts (dev, research, ops, ai-news). |
| `get_agent` | Fetch a full agent system prompt by name. |
| `list_prompts` | List prompt templates across domains, with their `{{PLACEHOLDER}}` inputs. |
| `get_prompt` | Fetch a prompt template by `domain` + `name`. |
| `list_workflows` | List workflows and their triggers. |
| `get_workflow` | Fetch a workflow's full steps. |
| `list_digests` | List available digest dates (newest first). |
| `get_digest` | Fetch a digest by date (`YYYY-MM-DD`). |
| `search_digests` | Full-text search across all digests; returns dates + snippets. |
| `read_memory` | Read the `MEMORY.md` index, or a specific memory file. |
| `append_memory` | Create a memory note with frontmatter and index it in `MEMORY.md`. |

### Prompts (slash commands in clients)

Every domain prompt template is exposed as a native MCP prompt named
`<domain>:<name>` (e.g. `dev:code-review`), with arguments generated from its
`{{PLACEHOLDER}}` tokens — the server fills them in when invoked. Each agent is
exposed as `agent:<name>` (e.g. `agent:dev-agent`) taking a single `task`
argument.

## Setup

```bash
cd mcp
npm install
npm run build
```

Then run it directly (stdio transport):

```bash
npm start          # node dist/index.js
```

## Using it with Claude Code

A project-scoped `.mcp.json` at the repo root already registers this server, so
from the repo root Claude Code picks it up automatically once you've built it
(`cd mcp && npm install && npm run build`). Verify with `/mcp`.

## Using it with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dev-hub": {
      "command": "node",
      "args": ["/absolute/path/to/my-dev-hub/mcp/dist/index.js"]
    }
  }
}
```

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `DEV_HUB_ROOT` | auto-detected (walks up to the nearest `CLAUDE.md`) | Repo root to read assets from. |
| `MEMORY_DIR` | `<root>/memory` | Where `read_memory` / `append_memory` operate. |

## Development

```bash
npm run dev        # run from source with tsx, no build step
npm run inspect    # open the MCP Inspector against the built server
```

All asset reads are sandboxed to the repo root — path arguments that try to
escape it are rejected.
