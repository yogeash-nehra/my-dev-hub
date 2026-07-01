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

export function DigestCard({ digest, featured = false }: { digest: DigestMeta; featured?: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/digest/${digest.date}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${hovered ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 14,
          padding: featured ? '24px 26px' : '20px 24px',
          background: hovered
            ? 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(37,99,235,0.04))'
            : 'rgba(255,255,255,0.018)',
          transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-1px)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: digest.preview ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0, flexWrap: 'wrap' }}>
            {featured && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34D399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 5, padding: '3px 8px' }}>
                Latest
              </span>
            )}
            <span style={{ fontSize: featured ? 17 : 15, fontWeight: 650, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
              {digest.displayDate}
            </span>
            <span style={{ fontSize: 12.5, color: '#475569' }}>
              {digest.itemCount !== null ? `${digest.itemCount} signals · ${digest.scanned} scanned` : 'Digest'}
            </span>
          </div>
          <span style={{ color: hovered ? '#A78BFA' : '#334155', fontSize: 16, flexShrink: 0, transition: 'color 0.15s' }}>→</span>
        </div>

        {digest.preview && (
          <p style={{ fontSize: 14, color: hovered ? '#CBD5E1' : '#94A3B8', lineHeight: 1.6, margin: '0 0 14px', transition: 'color 0.15s' }}>
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
                  color: SECTION_COLORS[section] ?? '#94A3B8',
                  background: `${SECTION_COLORS[section] ?? '#94A3B8'}14`,
                  border: `1px solid ${SECTION_COLORS[section] ?? '#94A3B8'}2E`,
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
