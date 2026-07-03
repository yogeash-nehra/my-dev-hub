import fs from 'fs'
import path from 'path'

export type ResourceCategory = 'agent' | 'workflow' | 'prompt'
export type ResourceDomain = 'dev' | 'ops' | 'personal'

export interface ResourceMeta {
  slug: string
  category: ResourceCategory
  domain: ResourceDomain | null
  title: string
  description: string
}

export interface Resource extends ResourceMeta {
  content: string
}

const SOURCES: { dir: string; category: ResourceCategory; domain: ResourceDomain | null }[] = [
  { dir: 'agents', category: 'agent', domain: null },
  { dir: 'workflows', category: 'workflow', domain: null },
  { dir: 'dev/prompts', category: 'prompt', domain: 'dev' },
  { dir: 'ops/prompts', category: 'prompt', domain: 'ops' },
  { dir: 'personal/prompts', category: 'prompt', domain: 'personal' },
]

const TITLE_STRIP = / — System Prompt$|^Workflow: |^Prompt: /g

function parseTitleAndDescription(content: string): { title: string; description: string } {
  const lines = content.split('\n')
  const titleLine = lines.find(l => l.startsWith('# '))
  const title = (titleLine ?? '').slice(2).replace(TITLE_STRIP, '').trim()

  const titleIdx = titleLine ? lines.indexOf(titleLine) : -1
  const rest = lines.slice(titleIdx + 1)

  let description = ''
  for (let i = 0; i < rest.length; i++) {
    const line = rest[i].trim()
    if (!line || line.startsWith('#')) continue
    // Found the start of a body paragraph — collect until the next blank line.
    const para: string[] = []
    for (let j = i; j < rest.length && rest[j].trim(); j++) para.push(rest[j].trim())
    description = para.join(' ')
    break
  }

  return { title: title || 'Untitled', description }
}

function loadFile(dir: string, filename: string, category: ResourceCategory, domain: ResourceDomain | null): Resource {
  const filepath = path.join(process.cwd(), dir, filename)
  const content = fs.readFileSync(filepath, 'utf-8')
  const { title, description } = parseTitleAndDescription(content)
  const slug = `${category}-${filename.replace(/\.md$/, '')}`
  return { slug, category, domain, title, description, content }
}

export function getResources(): Resource[] {
  const resources: Resource[] = []
  for (const { dir, category, domain } of SOURCES) {
    const fullDir = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullDir)) continue
    for (const filename of fs.readdirSync(fullDir).filter(f => f.endsWith('.md')).sort()) {
      resources.push(loadFile(dir, filename, category, domain))
    }
  }
  return resources
}

export function getResource(slug: string): Resource | null {
  return getResources().find(r => r.slug === slug) ?? null
}
