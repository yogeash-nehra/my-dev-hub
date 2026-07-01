import { getDigestList } from '@/lib/digests'
import { DigestCard } from '@/components/DigestCard'

export const metadata = {
  title: 'AI Developer Digest — Dev Hub',
  description: 'The daily signal for AI engineers: model releases, breaking API changes, research, and tooling — filtered from 30+ primary sources against a published quality rubric. Zero fluff.',
}

export default function DigestIndexPage() {
  const digests = getDigestList()
  const [latest, ...rest] = digests

  return (
    <main style={{ background: '#030712', minHeight: 'calc(100vh - 48px)', padding: '48px 24px 80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Masthead */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#64748B' }}>
              Updated daily
            </span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 750, color: '#F8FAFC', margin: '0 0 14px', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
            AI Developer Digest
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 16, margin: 0, lineHeight: 1.65, maxWidth: 620 }}>
            The daily signal for people who ship. Model releases, breaking API changes, research that
            matters, and the tooling moving fastest — filtered from 30+ primary sources against a
            published quality rubric. Every entry tells you what changed, why it matters, and what to do.
          </p>

          {/* Trust strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['30+', 'primary sources'],
              ['Daily', 'scan cadence'],
              [`${digests.length}`, 'digests published'],
              ['0', 'press-release fluff'],
            ].map(([n, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0' }}>{n}</span>
                <span style={{ fontSize: 12.5, color: '#64748B' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {digests.length === 0 ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 48, textAlign: 'center', color: '#475569' }}>
            No digests yet. Run the AI news workflow to generate the first one.
          </div>
        ) : (
          <>
            {latest && (
              <div style={{ marginBottom: 28 }}>
                <DigestCard digest={latest} featured />
              </div>
            )}
            {rest.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569', marginBottom: 16 }}>
                  Archive
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {rest.map((digest) => (
                    <DigestCard key={digest.date} digest={digest} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}
