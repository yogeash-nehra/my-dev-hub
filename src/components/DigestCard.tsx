'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { DigestMeta } from '@/lib/digests'

const SECTION_COLORS: Record<string, string> = {
  Models: '#4F46E5',
  API: '#059669',
  Research: '#B45309',
  Tooling: '#2563EB',
  Trends: '#DB2777',
  Discussions: '#7C3AED',
}

export function DigestCard({ digest, featured = false }: { digest: DigestMeta; featured?: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/digest/${digest.date}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${hovered ? 'rgba(124,58,237,0.40)' : 'rgba(30,27,22,0.10)'}`,
          borderRadius: 14,
          padding: featured ? '24px 26px' : '20px 24px',
          background: '#FFFFFF',
          boxShadow: hovered
            ? '0 6px 20px -10px rgba(124,58,237,0.30), 0 1px 2px rgba(30,27,22,0.04)'
            : '0 1px 2px rgba(30,27,22,0.03)',
          transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-1px)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: digest.preview ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0, flexWrap: 'wrap' }}>
            {featured && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.28)', borderRadius: 5, padding: '3px 8px' }}>
                Latest
              </span>
            )}
            <span style={{ fontSize: featured ? 17 : 15, fontWeight: 700, color: '#1C1A17', letterSpacing: '-0.01em' }}>
              {digest.displayDate}
            </span>
            <span style={{ fontSize: 12.5, color: '#948E84' }}>
              {digest.itemCount !== null ? `${digest.itemCount} signals · ${digest.scanned} scanned` : 'Digest'}
            </span>
          </div>
          <span style={{ color: hovered ? '#7C3AED' : '#B4AEA3', fontSize: 16, flexShrink: 0, transition: 'color 0.15s' }}>→</span>
        </div>

        {digest.preview && (
          <p style={{ fontSize: 14, color: hovered ? '#2A2825' : '#57534E', lineHeight: 1.6, margin: '0 0 14px', transition: 'color 0.15s' }}>
            {digest.preview}
          </p>
        )}

        {digest.sections.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {digest.sections.map((section) => (
              <span
                key={section}
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: SECTION_COLORS[section] ?? '#78716C',
                  background: `${SECTION_COLORS[section] ?? '#78716C'}12`,
                  border: `1px solid ${SECTION_COLORS[section] ?? '#78716C'}2E`,
                  borderRadius: 6,
                  padding: '2px 8px',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                {section}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
