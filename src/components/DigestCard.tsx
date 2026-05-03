'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { DigestMeta } from '@/lib/digests'

const SECTION_COLORS: Record<string, string> = {
  Models: '#818CF8',
  API: '#34D399',
  Research: '#F59E0B',
  Tooling: '#60A5FA',
  Trends: '#F472B6',
  Discussions: '#A78BFA',
}

export function DigestCard({ digest }: { digest: DigestMeta }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/digest/${digest.date}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${hovered ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 12,
          padding: '20px 24px',
          background: hovered ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          transition: 'border-color 0.15s, background 0.15s',
          cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
            {digest.displayDate}
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            {digest.itemCount !== null
              ? `${digest.itemCount} items · ${digest.scanned} scanned · ${digest.excluded} excluded`
              : 'Digest'}
          </div>
        </div>

        {digest.sections.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {digest.sections.map((section) => (
              <span
                key={section}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: SECTION_COLORS[section] ?? '#94A3B8',
                  background: `${SECTION_COLORS[section] ?? '#94A3B8'}18`,
                  border: `1px solid ${SECTION_COLORS[section] ?? '#94A3B8'}30`,
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

        <span style={{ color: hovered ? '#818CF8' : '#334155', fontSize: 16, flexShrink: 0, transition: 'color 0.15s' }}>→</span>
      </div>
    </Link>
  )
}
