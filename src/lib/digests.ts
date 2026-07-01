import fs from 'fs'
import path from 'path'

export interface DigestMeta {
  date: string
  displayDate: string
  itemCount: number | null
  scanned: number | null
  excluded: number | null
  sections: string[]
  preview: string | null
}

export interface Digest extends DigestMeta {
  content: string
}

const DIGESTS_DIR = path.join(process.cwd(), 'personal', 'digests')

const SECTION_LABELS: Record<string, string> = {
  'Model Releases': 'Models',
  'API & SDK Changes': 'API',
  'Research': 'Research',
  'Research Papers': 'Research',
  'Tooling': 'Tooling',
  'Tooling Updates': 'Tooling',
  'Trends & Emerging Tech': 'Trends',
  'Technical Discussions': 'Discussions',
}

function parseMeta(content: string, date: string): DigestMeta {
  const statsMatch = content.match(/\*(\d+) items (?:passed quality gate|pass)[^\|]*\|\s*(\d+[+]?) scanned \|\s*(\d+[+]?) excluded/)
  const itemCount = statsMatch ? parseInt(statsMatch[1]) : null
  const scanned = statsMatch ? parseInt(statsMatch[2]) : null
  const excluded = statsMatch ? parseInt(statsMatch[3]) : null

  const sections: string[] = []
  const sectionRe = /^## (.+)$/gm
  let match
  while ((match = sectionRe.exec(content)) !== null) {
    const label = SECTION_LABELS[match[1].trim()]
    if (label && !sections.includes(label)) {
      const sectionContent = content.slice(match.index)
      const nextSection = sectionContent.indexOf('\n## ', 1)
      const body = nextSection > -1 ? sectionContent.slice(0, nextSection) : sectionContent
      // Only include if section has actual content beyond "Nothing today"
      const hasContent = body.length > 100 && !body.match(/^## .+\n\nNothing today/m)
      if (hasContent) sections.push(label)
    }
  }

  const [year, month, day] = date.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  const displayDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  // Preview = first sentence of "This Week's Signal" blockquote, links flattened.
  let preview: string | null = null
  const signalMatch = content.match(/## This Week's Signal\s*\n((?:>[^\n]*\n?)+)/)
  if (signalMatch) {
    const text = signalMatch[1]
      .replace(/^>\s?/gm, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const firstSentence = text.match(/^.*?[.!?](?=\s|$)/)
    preview = (firstSentence ? firstSentence[0] : text).slice(0, 180).trim()
  }

  return { date, displayDate, itemCount, scanned, excluded, sections, preview }
}

export function getDigestList(): DigestMeta[] {
  if (!fs.existsSync(DIGESTS_DIR)) return []

  return fs.readdirSync(DIGESTS_DIR)
    .filter(f => f.startsWith('ai-') && f.endsWith('.md'))
    .sort()
    .reverse()
    .map(filename => {
      const date = filename.replace('ai-', '').replace('.md', '')
      const content = fs.readFileSync(path.join(DIGESTS_DIR, filename), 'utf-8')
      return parseMeta(content, date)
    })
}

export function getDigest(date: string): Digest | null {
  const filename = `ai-${date}.md`
  const filepath = path.join(DIGESTS_DIR, filename)
  if (!fs.existsSync(filepath)) return null
  const content = fs.readFileSync(filepath, 'utf-8')
  return { ...parseMeta(content, date), content }
}

export function getDigestDates(): string[] {
  if (!fs.existsSync(DIGESTS_DIR)) return []
  return fs.readdirSync(DIGESTS_DIR)
    .filter(f => f.startsWith('ai-') && f.endsWith('.md'))
    .map(f => f.replace('ai-', '').replace('.md', ''))
}

// ──────────────────────────────────────────────────────────────────────────
// Structured parsing — turns the raw digest markdown into typed blocks so the
// UI can render a magazine-grade layout instead of a flat markdown dump.
// ──────────────────────────────────────────────────────────────────────────

export interface DigestItem {
  tag: string | null      // BREAKING | HIGH | MEDIUM | NOTABLE | null
  title: string
  body: string            // raw markdown of the item's labeled fields
}

export interface DigestSection {
  id: string              // anchor slug
  navLabel: string        // short label for the jump-nav
  title: string           // display title (severity tag stripped)
  tag: string | null      // section-level tag (e.g. BREAKING)
  intro: string           // markdown before the first item / whole body if no items
  items: DigestItem[]
  empty: boolean          // true when the section had nothing this period
}

export interface HorizonEntry {
  tag: string             // PATTERN | TENSION | OPEN QUESTION | ...
  title: string
  body: string            // markdown
  grounded: string        // the "Grounded in: ..." provenance line
}

export interface StructuredDigest extends DigestMeta {
  signal: string          // "This Week's Signal" prose — the headline takeaway
  mustReads: string[]     // must-read bullet markdown
  body: DigestSection[]
  horizon: HorizonEntry[]
  methodology: string     // excluded / near-misses provenance markdown
  readingMinutes: number
  totalItems: number
  prev: string | null     // older digest date
  next: string | null     // newer digest date
}

const NAV_LABELS: Record<string, string> = {
  'Breaking Changes': 'Breaking',
  'Model Releases': 'Models',
  'API & SDK Changes': 'API · SDK',
  'Research': 'Research',
  'Tooling': 'Tooling',
  'Benchmarks & Leaderboards': 'Benchmarks',
  'Trends & Emerging Tech': 'Trends',
  'Technical Discussions': 'Discussions',
  'Quick Hits': 'Quick Hits',
  'Worth Watching (Announced, Not Yet Shipped)': 'Worth Watching',
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function splitTag(title: string): { tag: string | null; clean: string } {
  const m = title.match(/^\[([A-Z][A-Z ]*)\]\s*(.*)$/)
  if (m) return { tag: m[1].trim(), clean: m[2].trim() }
  return { tag: null, clean: title.trim() }
}

const EMPTY_RE = /^(No\b|Nothing\b|None\b)/i

function parseHorizon(raw: string): HorizonEntry[] {
  // Drop the <details>/<summary> wrapper and the leading "rules" blockquote.
  const inner = raw
    .replace(/<\/?details>/g, '')
    .replace(/<summary>[\s\S]*?<\/summary>/g, '')
  const entries: HorizonEntry[] = []
  const re = /\*\*\[([A-Z][A-Z ]*)\]\s*([^\n]*?)\*\*\n([\s\S]*?)(?=\n\*\*\[[A-Z]|$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(inner)) !== null) {
    const tag = m[1].trim()
    const title = m[2].trim()
    let block = m[3].trim()
    let grounded = ''
    const g = block.match(/\n?\*Grounded in:[\s\S]*$/i)
    if (g) {
      grounded = g[0].replace(/^\n?\*|\*$/g, '').trim()
      block = block.slice(0, g.index).trim()
    }
    entries.push({ tag, title, body: block, grounded })
  }
  return entries
}

function parseStructured(content: string, date: string): Omit<StructuredDigest, keyof DigestMeta | 'prev' | 'next'> {
  // Body starts at the first "## " header (drops the title + stats line).
  const start = content.indexOf('\n## ')
  let work = start >= 0 ? content.slice(start + 1) : content

  // Pull out the Horizon <details> block.
  let horizon: HorizonEntry[] = []
  const details = work.match(/<details>[\s\S]*?<\/details>/)
  if (details) {
    horizon = parseHorizon(details[0])
    work = work.replace(details[0], '')
  }

  // Pull out the trailing methodology footer (Excluded / Near-misses).
  let methodology = ''
  const meth = work.match(/(?:^|\n)\*(?:Excluded|Items excluded|Near-misses)[\s\S]*$/)
  if (meth) {
    methodology = work.slice(meth.index).replace(/^\n+/, '').trim()
    work = work.slice(0, meth.index)
  }

  // Word count for reading time (whole digest, links/markdown stripped roughly).
  const words = content.replace(/[#>*`_\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length
  const readingMinutes = Math.max(1, Math.round(words / 200))

  let signal = ''
  const mustReads: string[] = []
  const body: DigestSection[] = []
  let totalItems = 0

  const chunks = work.split(/\n(?=## )/).map(c => c.trim()).filter(Boolean)
  for (const chunk of chunks) {
    const nl = chunk.indexOf('\n')
    const rawTitle = (nl > -1 ? chunk.slice(3, nl) : chunk.slice(3)).trim()
    const rest = nl > -1 ? chunk.slice(nl + 1).trim() : ''
    const { tag, clean } = splitTag(rawTitle)

    // The Signal section becomes the hero — not a body section.
    if (/^This Week's Signal/i.test(clean) || /^Today's Signal/i.test(clean)) {
      const mustIdx = rest.search(/\*\*Must-reads[^*]*\*\*/i)
      const signalPart = mustIdx > -1 ? rest.slice(0, mustIdx) : rest
      signal = signalPart.replace(/^>\s?/gm, '').trim()
      if (mustIdx > -1) {
        const mr = rest.slice(mustIdx).replace(/\*\*Must-reads[^*]*\*\*/i, '')
        for (const line of mr.split('\n')) {
          const t = line.trim()
          if (t.startsWith('- ')) mustReads.push(t.slice(2).trim())
        }
      }
      continue
    }

    // Split the section into items by "### " headings.
    const parts = rest.split(/\n(?=### )/)
    let intro = ''
    const items: DigestItem[] = []
    for (const part of parts) {
      const p = part.trim()
      if (p.startsWith('### ')) {
        const inl = p.indexOf('\n')
        const itemTitle = (inl > -1 ? p.slice(4, inl) : p.slice(4)).trim()
        const itemBody = inl > -1 ? p.slice(inl + 1).trim() : ''
        const { tag: itag, clean: ititle } = splitTag(itemTitle)
        items.push({ tag: itag, title: ititle, body: itemBody })
      } else if (p) {
        intro += (intro ? '\n\n' : '') + p
      }
    }
    totalItems += items.length

    const empty = items.length === 0 && EMPTY_RE.test(intro.trim())
    body.push({
      id: slugify(clean),
      navLabel: NAV_LABELS[clean] ?? clean,
      title: clean,
      tag,
      intro,
      items,
      empty,
    })
  }

  return { signal, mustReads, body, horizon, methodology, readingMinutes, totalItems }
}

export function getStructuredDigest(date: string): StructuredDigest | null {
  const filename = `ai-${date}.md`
  const filepath = path.join(DIGESTS_DIR, filename)
  if (!fs.existsSync(filepath)) return null
  const content = fs.readFileSync(filepath, 'utf-8')
  const meta = parseMeta(content, date)
  const structured = parseStructured(content, date)

  // Neighbour digests for prev/next navigation (dates sorted ascending).
  const dates = getDigestDates().sort()
  const i = dates.indexOf(date)
  const prev = i > 0 ? dates[i - 1] : null
  const next = i >= 0 && i < dates.length - 1 ? dates[i + 1] : null

  return { ...meta, ...structured, prev, next }
}
