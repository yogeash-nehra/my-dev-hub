import Link from 'next/link'
import { getDigestList } from '@/lib/digests'
import { DigestCard } from '@/components/DigestCard'
import { PillarGrid } from '@/components/PillarGrid'
import { ContinueWorkflow } from '@/components/ContinueWorkflow'
import { RoleDemo } from '@/components/RoleDemo'
import { Footer } from '@/components/Footer'

export default function Home() {
  const [latest] = getDigestList()

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-6">
        {/* Masthead */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span style={{ fontSize: 11, color: '#948E84', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
              Dev Hub
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1C1A17' }}>Signal, not noise.</h1>
          <p className="mt-2 max-w-xl leading-relaxed" style={{ color: '#57534E' }}>
            Daily-curated AI digest for developers, a visual workflow builder, a dev agent, and
            the real prompt library this hub runs on.
          </p>
        </div>

        <ContinueWorkflow />

        {/* Latest digest */}
        {latest && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948E84' }}>
                Latest digest
              </span>
              <Link href="/digest" className="text-xs transition-colors" style={{ color: '#8A857C' }}>
                View archive →
              </Link>
            </div>
            <DigestCard digest={latest} featured />
          </div>
        )}

        <div className="mb-4">
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#948E84' }}>
            Jump in
          </span>
        </div>
        <PillarGrid />
      </div>

      <RoleDemo />
      <Footer />
    </main>
  )
}
