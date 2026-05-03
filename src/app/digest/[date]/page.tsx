import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDigest, getDigestDates } from '@/lib/digests'
import { DigestContent } from '@/components/DigestContent'

interface Props {
  params: Promise<{ date: string }>
}

export async function generateStaticParams() {
  return getDigestDates().map((date) => ({ date }))
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params
  const digest = getDigest(date)
  if (!digest) return {}
  return {
    title: `AI Digest ${digest.displayDate} — Dev Hub`,
    description: `${digest.itemCount ?? 'AI developer'} items: model releases, API changes, research, tooling, trends.`,
  }
}

export default async function DigestPage({ params }: Props) {
  const { date } = await params
  const digest = getDigest(date)
  if (!digest) notFound()

  return (
    <main style={{ background: '#030712', minHeight: 'calc(100vh - 48px)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Back nav */}
        <Link
          href="/digest"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#475569',
            fontSize: 13,
            textDecoration: 'none',
            marginBottom: 32,
            transition: 'color 0.15s',
          }}
        >
          ← All digests
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>📡</span>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
              AI Developer Digest
            </h1>
          </div>
          <div style={{ color: '#64748B', fontSize: 14 }}>
            {digest.displayDate}
            {digest.itemCount !== null && (
              <span style={{ marginLeft: 16, color: '#334155' }}>
                {digest.itemCount} items · {digest.scanned} scanned · {digest.excluded} excluded
              </span>
            )}
          </div>
        </div>

        {/* Digest content */}
        <DigestContent content={digest.content} />

        {/* Footer nav */}
        <div style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Link href="/digest" style={{ color: '#475569', fontSize: 13, textDecoration: 'none' }}>
            ← All digests
          </Link>
          <span style={{ color: '#1E293B', fontSize: 12, fontFamily: 'var(--font-geist-mono)' }}>
            personal/digests/ai-{date}.md
          </span>
        </div>
      </div>
    </main>
  )
}
