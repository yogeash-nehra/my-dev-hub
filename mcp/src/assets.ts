/**
 * Filesystem helpers for reading Dev Hub assets.
 *
 * Everything here is read-only except the memory helpers. Paths are resolved
 * relative to the repo root, which is discovered by walking up from this module
 * until a CLAUDE.md is found (or taken from the DEV_HUB_ROOT env var).
 */
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Locate the repo root: env override, else walk up looking for CLAUDE.md. */
function findRoot(): string {
  const fromEnv = process.env.DEV_HUB_ROOT;
  if (fromEnv) return path.resolve(fromEnv);

  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "CLAUDE.md"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: two levels up from mcp/dist or mcp/src.
  return path.resolve(__dirname, "..", "..");
}

export const ROOT = findRoot();

/** Where the memory system lives. Configurable; defaults to <root>/memory. */
export const MEMORY_DIR = process.env.MEMORY_DIR
  ? path.resolve(process.env.MEMORY_DIR)
  : path.join(ROOT, "memory");

/** Reject any path that escapes the repo root (defense against traversal). */
function safeJoin(base: string, ...parts: string[]): string {
  const target = path.resolve(base, ...parts);
  const rootReal = path.resolve(base);
  if (target !== rootReal && !target.startsWith(rootReal + path.sep)) {
    throw new Error(`Path escapes allowed directory: ${parts.join("/")}`);
  }
  return target;
}

async function readIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

/** First markdown heading (`# ...`) in a document, or a fallback. */
function firstHeading(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

/** First non-empty, non-heading paragraph — used as a one-line description. */
function firstParagraph(md: string): string {
  const lines = md.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("---")) continue;
    return line.replace(/^\*+|\*+$/g, "").trim();
  }
  return "";
}

// ─── Agents ────────────────────────────────────────────────────────────────

export interface AgentInfo {
  name: string;
  title: string;
  description: string;
}

export async function listAgents(): Promise<AgentInfo[]> {
  const dir = path.join(ROOT, "agents");
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const out: AgentInfo[] = [];
  for (const f of files.sort()) {
    const md = (await readIfExists(path.join(dir, f))) ?? "";
    const name = f.replace(/\.md$/, "");
    out.push({
      name,
      title: firstHeading(md, name),
      description: firstParagraph(md),
    });
  }
  return out;
}

export async function getAgent(name: string): Promise<string> {
  const clean = name.replace(/\.md$/, "").replace(/^agents\//, "");
  const file = safeJoin(path.join(ROOT, "agents"), `${clean}.md`);
  const md = await readIfExists(file);
  if (md === null) throw new Error(`Agent not found: ${clean}`);
  return md;
}

// ─── Prompt templates (dev/prompts, ops/prompts, …) ──────────────────────────

export interface PromptInfo {
  domain: string;
  name: string;
  title: string;
  description: string;
  placeholders: string[];
}

/** Uppercase {{PLACEHOLDER}} tokens, ignoring handlebars control tokens. */
export function extractPlaceholders(md: string): string[] {
  const set = new Set<string>();
  const re = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) set.add(m[1]);
  return [...set];
}

async function domainsWithPrompts(): Promise<string[]> {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const domains: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (existsSync(path.join(ROOT, e.name, "prompts"))) domains.push(e.name);
  }
  return domains.sort();
}

export async function listPrompts(): Promise<PromptInfo[]> {
  const out: PromptInfo[] = [];
  for (const domain of await domainsWithPrompts()) {
    const dir = path.join(ROOT, domain, "prompts");
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
    for (const f of files.sort()) {
      const md = (await readIfExists(path.join(dir, f))) ?? "";
      const name = f.replace(/\.md$/, "");
      out.push({
        domain,
        name,
        title: firstHeading(md, name),
        description: firstParagraph(md),
        placeholders: extractPlaceholders(md),
      });
    }
  }
  return out;
}

export async function getPrompt(domain: string, name: string): Promise<string> {
  const dir = safeJoin(ROOT, domain, "prompts");
  const file = safeJoin(dir, `${name.replace(/\.md$/, "")}.md`);
  const md = await readIfExists(file);
  if (md === null) throw new Error(`Prompt not found: ${domain}/${name}`);
  return md;
}

// ─── Workflows ───────────────────────────────────────────────────────────────

export interface WorkflowInfo {
  name: string;
  title: string;
  trigger: string;
}

/** Pull the text under a `## Trigger` heading, if present. */
function extractTrigger(md: string): string {
  const m = md.match(/##\s+Trigger\s*\n+([^\n]+)/i);
  return m ? m[1].trim() : firstParagraph(md);
}

export async function listWorkflows(): Promise<WorkflowInfo[]> {
  const dir = path.join(ROOT, "workflows");
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const out: WorkflowInfo[] = [];
  for (const f of files.sort()) {
    const md = (await readIfExists(path.join(dir, f))) ?? "";
    const name = f.replace(/\.md$/, "");
    out.push({ name, title: firstHeading(md, name), trigger: extractTrigger(md) });
  }
  return out;
}

export async function getWorkflow(name: string): Promise<string> {
  const file = safeJoin(path.join(ROOT, "workflows"), `${name.replace(/\.md$/, "")}.md`);
  const md = await readIfExists(file);
  if (md === null) throw new Error(`Workflow not found: ${name}`);
  return md;
}

// ─── Digests ─────────────────────────────────────────────────────────────────

const DIGEST_DIR = path.join(ROOT, "personal", "digests");
const DATE_RE = /(\d{4}-\d{2}-\d{2})/;

function digestFileForDate(date: string): string {
  return path.join(DIGEST_DIR, `ai-${date}.md`);
}

export async function listDigests(limit?: number): Promise<string[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(DIGEST_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const dates = files
    .map((f) => f.match(DATE_RE)?.[1])
    .filter((d): d is string => Boolean(d))
    .sort()
    .reverse();
  return typeof limit === "number" ? dates.slice(0, limit) : dates;
}

export async function getDigest(date: string): Promise<string> {
  if (!DATE_RE.test(date)) throw new Error(`Invalid date (expected YYYY-MM-DD): ${date}`);
  const md = await readIfExists(digestFileForDate(date));
  if (md === null) throw new Error(`No digest for ${date}`);
  return md;
}

export interface DigestHit {
  date: string;
  matches: string[];
}

/** Case-insensitive full-text search across all digests. Returns snippets. */
export async function searchDigests(
  query: string,
  limit = 20,
  snippetsPerDigest = 3
): Promise<DigestHit[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const dates = await listDigests();
  const hits: DigestHit[] = [];
  for (const date of dates) {
    const md = (await readIfExists(digestFileForDate(date))) ?? "";
    const lines = md.split(/\r?\n/);
    const matches: string[] = [];
    for (const line of lines) {
      if (line.toLowerCase().includes(q)) {
        const trimmed = line.trim();
        if (trimmed) matches.push(trimmed);
        if (matches.length >= snippetsPerDigest) break;
      }
    }
    if (matches.length) hits.push({ date, matches });
    if (hits.length >= limit) break;
  }
  return hits;
}

// ─── Memory ──────────────────────────────────────────────────────────────────

const MEMORY_INDEX = "MEMORY.md";

export async function readMemory(name?: string): Promise<string> {
  if (name) {
    const clean = name.replace(/\.md$/, "");
    const file = safeJoin(MEMORY_DIR, `${clean}.md`);
    const md = await readIfExists(file);
    if (md === null) throw new Error(`Memory file not found: ${clean}`);
    return md;
  }
  const index = await readIfExists(path.join(MEMORY_DIR, MEMORY_INDEX));
  if (index === null) {
    return `No memory index yet (${path.join(MEMORY_DIR, MEMORY_INDEX)} does not exist). Use append_memory to start one.`;
  }
  return index;
}

export interface AppendMemoryArgs {
  name: string;
  type: "user" | "feedback" | "project" | "reference";
  description: string;
  content: string;
}

/**
 * Create a memory file with frontmatter and add a pointer line to MEMORY.md,
 * matching the convention documented in the root CLAUDE.md.
 */
export async function appendMemory(args: AppendMemoryArgs): Promise<string> {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
  const slug = args.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("name produced an empty slug");

  const file = safeJoin(MEMORY_DIR, `${slug}.md`);
  const frontmatter = [
    "---",
    `name: ${args.name}`,
    `type: ${args.type}`,
    `description: ${args.description}`,
    "---",
    "",
    args.content.trim(),
    "",
  ].join("\n");
  await fs.writeFile(file, frontmatter, "utf8");

  const indexPath = path.join(MEMORY_DIR, MEMORY_INDEX);
  const existing = (await readIfExists(indexPath)) ?? "# Memory Index\n\n";
  const pointer = `- [${args.name}](${slug}.md) — ${args.description}\n`;
  await fs.writeFile(indexPath, existing.endsWith("\n") ? existing + pointer : existing + "\n" + pointer, "utf8");

  return `Wrote ${slug}.md and added a pointer to ${MEMORY_INDEX}.`;
}
