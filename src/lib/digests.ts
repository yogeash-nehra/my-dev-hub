import fs from 'fs'
import path from 'path'

export interface DigestMeta {
  date: string
  displayDate: string
  itemCount: number | null
  scanned: number | null
  excluded: number | null
  sections: string[]
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

  return { date, displayDate, itemCount, scanned, excluded, sections }
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
