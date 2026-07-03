import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getResource, getResources, type ResourceCategory, type ResourceDomain } from '@/lib/resources'
import { MarkdownContent } from '@/components/MarkdownContent'

interface Props {
  params: Promise<{ slug: string }>
}

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  agent: 'Agent',
  workflow: 'Workflow',
  prompt: 'Prompt',
}

const DOMAIN_LABELS: Record<ResourceDomain, string> = {
  dev: 'Dev',
  ops: 'Ops',
  personal: 'Personal',
}

export async function generateStaticParams() {
  return getResources().map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const resource = getResource(slug)
  if (!resource) return {}
  return {
    title: `${resource.title} — Clearline`,
    description: resource.description || `A ${CATEGORY_LABELS[resource.category]} resource from Clearline.`,
  }
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const resource = getResource(slug)
  if (!resource) notFound()

  const body = resource.content.replace(/^#\s+.+\n/, '')

  return (
    <main style={{ background: '#030712', minHeight: 'calc(100vh - 48px)', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/resources" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
          ← Resources
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 10px' }}>
          <span
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#A78BFA', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 5, padding: '3px 8px',
            }}
          >
            {CATEGORY_LABELS[resource.category]}
          </span>
          {resource.domain && (
            <span style={{ fontSize: 11.5, color: '#64748B' }}>{DOMAIN_LABELS[resource.domain]}</span>
          )}
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 750, color: '#F8FAFC', margin: '0 0 28px', letterSpacing: '-0.02em' }}>
          {resource.title}
        </h1>

        <MarkdownContent content={body} />
      </div>
    </main>
  )
}
