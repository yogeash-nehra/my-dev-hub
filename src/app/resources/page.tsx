import Link from 'next/link'
import { getResources, type Resource, type ResourceDomain } from '@/lib/resources'

export const metadata = {
  title: 'Resources — Dev Hub',
  description: 'Real, reusable agent system prompts, workflow docs, and prompt templates — pulled straight from this repo, not marketing filler.',
}

const DOMAIN_LABELS: Record<ResourceDomain, string> = {
  dev: 'Dev',
  ops: 'Ops',
  personal: 'Personal',
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link href={`/resources/${resource.slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          border: '1px solid rgba(30,27,22,0.10)',
          borderRadius: 12,
          padding: '18px 20px',
          background: '#FFFFFF',
          height: '100%',
          boxShadow: '0 1px 2px rgba(30,27,22,0.03)',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1A17', marginBottom: 6 }}>
          {resource.title}
        </div>
        {resource.description && (
          <p style={{ fontSize: 13, color: '#57534E', lineHeight: 1.55, margin: 0 }}>
            {resource.description}
          </p>
        )}
      </div>
    </Link>
  )
}

function Section({ title, resources }: { title: string; resources: Resource[] }) {
  if (resources.length === 0) return null
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948E84', marginBottom: 14 }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {resources.map(r => (
          <ResourceCard key={r.slug} resource={r} />
        ))}
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  const resources = getResources()
  const agents = resources.filter(r => r.category === 'agent')
  const workflows = resources.filter(r => r.category === 'workflow')
  const prompts = resources.filter(r => r.category === 'prompt')

  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 48px)', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 750, color: '#1C1A17', margin: '0 0 14px', letterSpacing: '-0.025em' }}>
            Resources
          </h1>
          <p style={{ color: '#57534E', fontSize: 16, margin: 0, lineHeight: 1.65, maxWidth: 620 }}>
            The actual agent system prompts, workflow docs, and prompt templates this hub runs on —
            pulled straight from the repo. Fork them, don&apos;t just read them.
          </p>
        </div>

        <Section title="Agents" resources={agents} />
        <Section title="Workflows" resources={workflows} />
        {(['dev', 'ops', 'personal'] as ResourceDomain[]).map(domain => (
          <Section
            key={domain}
            title={`Prompt Templates · ${DOMAIN_LABELS[domain]}`}
            resources={prompts.filter(r => r.domain === domain)}
          />
        ))}
      </div>
    </main>
  )
}
