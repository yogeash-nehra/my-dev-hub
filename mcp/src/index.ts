#!/usr/bin/env node
/**
 * Dev Hub MCP server.
 *
 * Exposes the Yogi Dev Hub's markdown knowledge base to any MCP client:
 *   • Tools     — list/fetch agents, prompt templates, workflows; search &
 *                 fetch digests; read & append project memory.
 *   • Prompts   — the domain prompt templates and agent system prompts,
 *                 surfaced as native MCP prompts (slash commands in clients),
 *                 with arguments derived from their {{PLACEHOLDER}} tokens.
 *
 * Transport: stdio. Run with `node dist/index.js` after `npm run build`.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  ROOT,
  listAgents,
  getAgent,
  listPrompts,
  getPrompt,
  extractPlaceholders,
  listWorkflows,
  getWorkflow,
  listDigests,
  getDigest,
  searchDigests,
  readMemory,
  appendMemory,
} from "./assets.js";

const server = new McpServer({
  name: "dev-hub",
  version: "0.1.0",
});

const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] });

// ─── Tools: agents ───────────────────────────────────────────────────────────

server.registerTool(
  "list_agents",
  {
    title: "List agents",
    description:
      "List the specialized agent system prompts available in the Dev Hub (dev, research, ops, ai-news).",
    inputSchema: {},
  },
  async () => {
    const agents = await listAgents();
    const lines = agents.map((a) => `- ${a.name} — ${a.title}${a.description ? `: ${a.description}` : ""}`);
    return text(lines.length ? lines.join("\n") : "No agents found.");
  }
);

server.registerTool(
  "get_agent",
  {
    title: "Get agent",
    description: "Fetch the full system prompt for a Dev Hub agent by name (e.g. 'dev-agent').",
    inputSchema: { name: z.string().describe("Agent name, e.g. 'dev-agent' or 'research-agent'") },
  },
  async ({ name }) => text(await getAgent(name))
);

// ─── Tools: prompt templates ─────────────────────────────────────────────────

server.registerTool(
  "list_prompts",
  {
    title: "List prompt templates",
    description:
      "List reusable prompt templates across all domains (dev/, ops/, …), including their {{PLACEHOLDER}} inputs.",
    inputSchema: {},
  },
  async () => {
    const prompts = await listPrompts();
    if (!prompts.length) return text("No prompt templates found.");
    const lines = prompts.map(
      (p) =>
        `- ${p.domain}/${p.name} — ${p.title}` +
        (p.placeholders.length ? ` [inputs: ${p.placeholders.join(", ")}]` : "")
    );
    return text(lines.join("\n"));
  }
);

server.registerTool(
  "get_prompt",
  {
    title: "Get prompt template",
    description: "Fetch a prompt template by domain and name (e.g. domain='dev', name='code-review').",
    inputSchema: {
      domain: z.string().describe("Domain folder, e.g. 'dev' or 'ops'"),
      name: z.string().describe("Template name, e.g. 'code-review'"),
    },
  },
  async ({ domain, name }) => text(await getPrompt(domain, name))
);

// ─── Tools: workflows ────────────────────────────────────────────────────────

server.registerTool(
  "list_workflows",
  {
    title: "List workflows",
    description: "List multi-step workflows (daily-brief, code-review, weekly-digest, …) and their triggers.",
    inputSchema: {},
  },
  async () => {
    const wf = await listWorkflows();
    if (!wf.length) return text("No workflows found.");
    return text(wf.map((w) => `- ${w.name} — ${w.title} (trigger: ${w.trigger})`).join("\n"));
  }
);

server.registerTool(
  "get_workflow",
  {
    title: "Get workflow",
    description: "Fetch the full steps of a workflow by name (e.g. 'code-review').",
    inputSchema: { name: z.string().describe("Workflow name, e.g. 'daily-brief'") },
  },
  async ({ name }) => text(await getWorkflow(name))
);

// ─── Tools: digests ──────────────────────────────────────────────────────────

server.registerTool(
  "list_digests",
  {
    title: "List AI digests",
    description: "List available AI Developer Digest dates (newest first).",
    inputSchema: { limit: z.number().int().positive().optional().describe("Max dates to return") },
  },
  async ({ limit }) => {
    const dates = await listDigests(limit);
    return text(dates.length ? dates.join("\n") : "No digests found.");
  }
);

server.registerTool(
  "get_digest",
  {
    title: "Get AI digest",
    description: "Fetch the full AI Developer Digest for a date (YYYY-MM-DD).",
    inputSchema: { date: z.string().describe("Date in YYYY-MM-DD, e.g. '2026-07-21'") },
  },
  async ({ date }) => text(await getDigest(date))
);

server.registerTool(
  "search_digests",
  {
    title: "Search AI digests",
    description:
      "Case-insensitive full-text search across all AI Developer Digests. Returns matching dates with snippets.",
    inputSchema: {
      query: z.string().describe("Search text, e.g. 'MCP' or 'Gemini Flash'"),
      limit: z.number().int().positive().optional().describe("Max digests to return (default 20)"),
    },
  },
  async ({ query, limit }) => {
    const hits = await searchDigests(query, limit ?? 20);
    if (!hits.length) return text(`No matches for "${query}".`);
    const blocks = hits.map((h) => `## ${h.date}\n${h.matches.map((m) => `  • ${m}`).join("\n")}`);
    return text(`Found ${hits.length} digest(s) matching "${query}":\n\n${blocks.join("\n\n")}`);
  }
);

// ─── Tools: memory ───────────────────────────────────────────────────────────

server.registerTool(
  "read_memory",
  {
    title: "Read memory",
    description:
      "Read the project memory index (MEMORY.md), or a specific memory file if a name is given.",
    inputSchema: { name: z.string().optional().describe("Optional memory file name (without .md)") },
  },
  async ({ name }) => text(await readMemory(name))
);

server.registerTool(
  "append_memory",
  {
    title: "Append memory",
    description:
      "Create a memory file with frontmatter (name/type/description) and add a pointer to MEMORY.md. " +
      "Use for user preferences, feedback, project context, or reference pointers — not code or file paths.",
    inputSchema: {
      name: z.string().describe("Descriptive name for the memory"),
      type: z.enum(["user", "feedback", "project", "reference"]).describe("Memory category"),
      description: z.string().describe("One-line hook for the MEMORY.md index"),
      content: z.string().describe("Body of the memory note (markdown)"),
    },
  },
  async (args) => text(await appendMemory(args))
);

// ─── Prompts: expose templates & agents as MCP prompts ───────────────────────

function fillTemplate(md: string, values: Record<string, string | undefined>): string {
  return md.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (whole, key: string) =>
    values[key] !== undefined && values[key] !== "" ? String(values[key]) : whole
  );
}

async function registerPromptPrimitives(): Promise<void> {
  // Domain prompt templates → prompts named "<domain>:<name>".
  for (const p of await listPrompts()) {
    const argsShape: Record<string, z.ZodString> = {};
    for (const ph of p.placeholders) {
      argsShape[ph] = z.string().describe(`Value for {{${ph}}}`);
    }
    server.registerPrompt(
      `${p.domain}:${p.name}`,
      {
        title: p.title,
        description: p.description || `${p.domain} prompt template`,
        argsSchema: argsShape,
      },
      async (args: Record<string, string | undefined>) => {
        const md = await getPrompt(p.domain, p.name);
        return {
          messages: [
            { role: "user", content: { type: "text", text: fillTemplate(md, args) } },
          ],
        };
      }
    );
  }

  // Agent system prompts → prompts named "agent:<name>" with a {{task}} arg.
  for (const a of await listAgents()) {
    server.registerPrompt(
      `agent:${a.name}`,
      {
        title: `Act as ${a.title}`,
        description: a.description || `Adopt the ${a.name} persona`,
        argsSchema: { task: z.string().describe("The task for this agent to perform") },
      },
      async ({ task }: { task?: string }) => {
        const md = await getAgent(a.name);
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Adopt the following agent persona, then carry out the task.\n\n${md}\n\n---\n\nTask: ${task ?? ""}`,
              },
            },
          ],
        };
      }
    );
  }
}

async function main(): Promise<void> {
  await registerPromptPrimitives();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe for logs; stdout is reserved for the MCP protocol.
  console.error(`dev-hub MCP server running (root: ${ROOT})`);
}

main().catch((err) => {
  console.error("Fatal error starting dev-hub MCP server:", err);
  process.exit(1);
});
