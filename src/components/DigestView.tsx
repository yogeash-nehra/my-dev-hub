'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { StructuredDigest, DigestItem, DigestSection, HorizonEntry } from '@/lib/digests'

/* ────────────────────────────────  palette  ──────────────────────────────── */
/* Light editorial theme. Accent hues are kept but darkened for legibility on
   a warm-paper background; tints use low-alpha hex suffixes on white. */

const INK = '#1C1A17'
const BODY = '#45413B'
const MUTED = '#6B665E'
const FAINT = '#948E84'
const BORDER = 'rgba(30,27,22,0.10)'
const HAIRLINE = 'rgba(30,27,22,0.07)'
const CARD = '#FFFFFF'

const TAG_STYLES: Record<string, { color: string; label: string }> = {
  BREAKING: { color: '#DC2626', label: 'Breaking' },
  HIGH: { color: '#EA580C', label: 'High' },
  MEDIUM: { color: '#D97706', label: 'Medium' },
  NOTABLE: { color: '#2563EB', label: 'Notable' },
}

const SECTION_ACCENT: Record<string, string> = {
  'Breaking Changes': '#DC2626',
  'Model Releases': '#4F46E5',
  'API & SDK Changes': '#059669',
  'Research': '#B45309',
  'Tooling': '#2563EB',
  'Benchmarks & Leaderboards': '#0891B2',
  'Trends & Emerging Tech': '#DB2777',
  'Technical Discussions': '#7C3AED',
  'Quick Hits': '#64748B',
  'Worth Watching (Announced, Not Yet Shipped)': '#78716C',
}

const HORIZON_ACCENT: Record<string, string> = {
  PATTERN: '#7C3AED',
  TENSION: '#DB2777',
  'OPEN QUESTION': '#0284C7',
  'IF THIS CONTINUES': '#059669',
  'RESEARCH THREAD': '#B45309',
}

const EFFORT_COLOR: Record<string, string> = {
  Quick: '#059669',
  Moderate: '#D97706',
  Significant: '#DC2626',
}

function accentFor(title: string): string {
  return SECTION_ACCENT[title] ?? '#4F46E5'
}

/* ──────────────────────────────  markdown atoms  ─────────────────────────── */

const inlineComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#4F46E5', textDecoration: 'none', borderBottom: '1px solid rgba(79,70,229,0.30)' }}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong style={{ color: INK, fontWeight: 650 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: MUTED }}>{children}</em>,
  code: ({ children }) => (
    <code
      style={{
        background: '#F1EFEA',
        border: '1px solid rgba(30,27,22,0.08)',
        borderRadius: 4,
        padding: '1px 6px',
        fontSize: '0.85em',
        color: '#6D28D9',
        fontFamily: 'var(--font-geist-mono)',
      }}
    >
      {children}
    </code>
  ),
  p: ({ children }) => <span>{children}</span>,
}

// Inline markdown (no block wrapper) — used inside callouts and chips.
function MDInline({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inlineComponents}>
      {children}
    </ReactMarkdown>
  )
}

const blockComponents: Components = {
  ...inlineComponents,
  p: ({ children }) => (
    <p style={{ fontSize: 14.5, color: BODY, lineHeight: 1.75, margin: '10px 0' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 18, margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li style={{ fontSize: 14.5, color: BODY, lineHeight: 1.7 }}>{children}</li>
  ),
}

// Block-level markdown — used for list sections (Quick Hits, Worth Watching).
function MDBlock({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={blockComponents}>
      {children}
    </ReactMarkdown>
  )
}

/* ─────────────────────────────────  pills  ───────────────────────────────── */

function TagPill({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] ?? { color: '#4F46E5', label: tag.charAt(0) + tag.slice(1).toLowerCase() }
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: style.color,
        background: `${style.color}14`,
        border: `1px solid ${style.color}33`,
        borderRadius: 5,
        padding: '3px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {tag === 'BREAKING' && <span style={{ marginRight: 4 }}>●</span>}
      {style.label}
    </span>
  )
}

/* ────────────────────────────  item field blocks  ───────────────────────── */

interface FieldBlock {
  label: string | null
  text: string
}

// Narrative callout labels rendered as highlighted boxes, in source order.
const CALLOUT_STYLE: Record<string, { accent: string; tint: string; caption: string }> = {
  'What changed': { accent: '#78716C', tint: 'rgba(120,113,108,0.06)', caption: 'What changed' },
  'TL;DR': { accent: '#4F46E5', tint: 'rgba(79,70,229,0.06)', caption: 'TL;DR' },
  'Developer signal': { accent: '#059669', tint: 'rgba(5,150,105,0.06)', caption: 'Developer signal' },
  'Dev signal': { accent: '#059669', tint: 'rgba(5,150,105,0.06)', caption: 'Developer signal' },
  "What's happening": { accent: '#DB2777', tint: 'rgba(219,39,119,0.05)', caption: "What's happening" },
  'Why watch this': { accent: '#DB2777', tint: 'rgba(219,39,119,0.05)', caption: 'Why watch this' },
}

const META_LABELS = new Set(['Affects you if', 'Adoption effort'])
const SOURCE_LABELS = new Set(['Source', 'Primary source', 'Source (model retirement)', 'Source (billing split)'])

function parseFields(body: string): FieldBlock[] {
  return body
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const m = line.match(/^\*\*([^:*]+):\*\*\s*(.*)$/)
      if (m) return { label: m[1].trim(), text: m[2].trim() }
      if (/^\*Quality gate score/i.test(line)) return { label: '__score', text: line.replace(/^\*|\*$/g, '') }
      return { label: null, text: line }
    })
}

function Callout({ caption, accent, tint, text }: { caption: string; accent: string; tint: string; text: string }) {
  return (
    <div style={{ background: tint, borderLeft: `2px solid ${accent}`, borderRadius: '0 8px 8px 0', padding: '11px 14px' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 5,
        }}
      >
        {caption}
      </div>
      <div style={{ fontSize: 14.5, color: BODY, lineHeight: 1.7 }}>
        <MDInline>{text}</MDInline>
      </div>
    </div>
  )
}

function MetaChip({ label, text }: { label: string; text: string }) {
  if (label === 'Adoption effort') {
    const level = text.split(/[\s(]/)[0]
    const color = EFFORT_COLOR[level] ?? '#78716C'
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: BODY,
          background: '#F6F4EE',
          border: `1px solid ${BORDER}`,
          borderRadius: 6,
          padding: '4px 10px',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
        <span style={{ color: FAINT }}>Effort</span>
        <span style={{ color: INK }}>
          <MDInline>{text}</MDInline>
        </span>
      </span>
    )
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 6,
        fontSize: 12,
        color: BODY,
        background: '#F6F4EE',
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        padding: '4px 10px',
      }}
    >
      <span style={{ color: FAINT }}>Affects you if</span>
      <span style={{ color: INK }}>
        <MDInline>{text}</MDInline>
      </span>
    </span>
  )
}

function ItemCard({ item, accent }: { item: DigestItem; accent: string }) {
  const [showScore, setShowScore] = useState(false)
  const fields = parseFields(item.body)

  const narrative = fields.filter(f => f.label === null || (f.label in CALLOUT_STYLE))
  const meta = fields.filter(f => f.label && META_LABELS.has(f.label))
  const sources = fields.filter(f => f.label && SOURCE_LABELS.has(f.label))
  const score = fields.find(f => f.label === '__score')

  return (
    <article
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        background: CARD,
        padding: '22px 22px 18px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(30,27,22,0.03)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, ${accent}, transparent 70%)`, opacity: 0.7 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        {item.tag && <span style={{ marginTop: 3 }}><TagPill tag={item.tag} /></span>}
        <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
          {item.title}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {narrative.map((f, i) => {
          if (f.label && f.label in CALLOUT_STYLE) {
            const c = CALLOUT_STYLE[f.label]
            return <Callout key={i} caption={c.caption} accent={c.accent} tint={c.tint} text={f.text} />
          }
          return (
            <p key={i} style={{ fontSize: 14.5, color: BODY, lineHeight: 1.75, margin: 0 }}>
              <MDInline>{f.text}</MDInline>
            </p>
          )
        })}
      </div>

      {meta.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {meta.map((f, i) => (
            <MetaChip key={i} label={f.label as string} text={f.text} />
          ))}
        </div>
      )}

      {(sources.length > 0 || score) && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${HAIRLINE}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {sources.map((f, i) => (
            <span key={i} style={{ fontSize: 12, color: FAINT, lineHeight: 1.5 }}>
              <MDInline>{f.text}</MDInline>
            </span>
          ))}
          {score && (
            <button
              onClick={() => setShowScore(s => !s)}
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                color: FAINT,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-geist-mono)',
                padding: 0,
              }}
            >
              {showScore ? '− scoring' : '+ scoring'}
            </button>
          )}
        </div>
      )}
      {score && showScore && (
        <p style={{ fontSize: 11, color: FAINT, fontStyle: 'italic', margin: '8px 0 0', fontFamily: 'var(--font-geist-mono)', lineHeight: 1.5 }}>
          {score.text}
        </p>
      )}
    </article>
  )
}

/* ───────────────────────────────  sections  ─────────────────────────────── */

function SectionHeader({ section, accent }: { section: DigestSection; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          margin: 0,
        }}
      >
        {section.title}
      </h2>
      {section.items.length > 0 && (
        <span style={{ fontSize: 11, color: FAINT, fontFamily: 'var(--font-geist-mono)' }}>
          {section.items.length}
        </span>
      )}
      <span style={{ flex: 1, height: 1, background: `${accent}2E` }} />
    </div>
  )
}

function Section({ section }: { section: DigestSection }) {
  const accent = accentFor(section.title)
  return (
    <section id={section.id} style={{ scrollMarginTop: 70, marginBottom: 44 }}>
      <SectionHeader section={section} accent={accent} />
      {section.intro && (
        <div style={{ marginBottom: section.items.length ? 16 : 0, color: MUTED }}>
          <MDBlock>{section.intro}</MDBlock>
        </div>
      )}
      {section.items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {section.items.map((item, i) => (
            <ItemCard key={i} item={item} accent={accent} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────  horizon  ─────────────────────────────── */

function HorizonCard({ entry }: { entry: HorizonEntry }) {
  const accent = HORIZON_ACCENT[entry.tag] ?? '#7C3AED'
  return (
    <article style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px', background: CARD, boxShadow: '0 1px 2px rgba(30,27,22,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: accent,
            background: `${accent}14`,
            border: `1px solid ${accent}33`,
            borderRadius: 5,
            padding: '3px 8px',
          }}
        >
          {entry.tag}
        </span>
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 8px', lineHeight: 1.4 }}>
        {entry.title}
      </h4>
      <div style={{ fontSize: 14, color: BODY, lineHeight: 1.7 }}>
        <MDInline>{entry.body}</MDInline>
      </div>
      {entry.grounded && (
        <p style={{ fontSize: 11.5, color: FAINT, fontStyle: 'italic', margin: '12px 0 0', lineHeight: 1.5 }}>
          <MDInline>{entry.grounded}</MDInline>
        </p>
      )}
    </article>
  )
}

function HorizonSection({ entries }: { entries: HorizonEntry[] }) {
  const [open, setOpen] = useState(false)
  if (entries.length === 0) return null
  return (
    <section style={{ marginTop: 56 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(37,99,235,0.04))',
          border: '1px solid rgba(124,58,237,0.22)',
          borderRadius: 14,
          padding: '18px 22px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 22 }}>🔭</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: INK }}>
            The Frontier — {entries.length} signals worth thinking about
          </span>
          <span style={{ display: 'block', fontSize: 12.5, color: MUTED, marginTop: 3 }}>
            Open questions, emerging patterns &amp; grounded speculation. Every claim cites a source.
          </span>
        </span>
        <span style={{ fontSize: 13, color: '#7C3AED', fontWeight: 600 }}>{open ? 'Hide −' : 'Explore →'}</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          {entries.map((e, i) => (
            <HorizonCard key={i} entry={e} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ───────────────────────────────  signal hero  ───────────────────────────── */

function SignalHero({ signal, mustReads }: { signal: string; mustReads: string[] }) {
  if (!signal && mustReads.length === 0) return null
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 18,
        padding: '28px 28px 26px',
        marginBottom: 40,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(37,99,235,0.05) 55%, rgba(5,150,105,0.04))',
        border: '1px solid rgba(124,58,237,0.20)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#6D28D9',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7C3AED' }} />
        The Signal — start here
      </div>

      {signal && (
        <div style={{ fontSize: 16.5, color: '#2A2825', lineHeight: 1.7, letterSpacing: '-0.005em' }}>
          <MDInline>{signal}</MDInline>
        </div>
      )}

      {mustReads.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, marginBottom: 12 }}>
            Must-reads today
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mustReads.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: 'rgba(124,58,237,0.12)',
                    border: '1px solid rgba(124,58,237,0.30)',
                    color: '#6D28D9',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ fontSize: 14.5, color: BODY, lineHeight: 1.65 }}>
                  <MDInline>{m}</MDInline>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────  jump nav  ─────────────────────────────── */

function JumpNav({ sections }: { sections: DigestSection[] }) {
  const live = sections.filter(s => s.items.length > 0 || !s.empty)
  if (live.length === 0) return null
  return (
    <nav
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        padding: '16px 0 4px',
        marginBottom: 36,
        borderTop: `1px solid ${HAIRLINE}`,
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      {live.map(s => {
        const accent = accentFor(s.title)
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              fontSize: 12.5,
              color: MUTED,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 7,
              border: `1px solid ${BORDER}`,
              background: CARD,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
            {s.navLabel}
            {s.items.length > 0 && <span style={{ color: FAINT, fontSize: 11 }}>{s.items.length}</span>}
          </a>
        )
      })}
    </nav>
  )
}

/* ───────────────────────────────  methodology  ──────────────────────────── */

function Methodology({ markdown, excluded }: { markdown: string; scanned: number | null; excluded: number | null }) {
  const [open, setOpen] = useState(false)
  if (!markdown) return null
  return (
    <section style={{ marginTop: 40 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          color: MUTED,
          fontSize: 12.5,
          cursor: 'pointer',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--font-geist-mono)',
        }}
      >
        <span>{open ? '▾' : '▸'}</span>
        Methodology &amp; what we filtered out
        {excluded !== null && <span style={{ color: FAINT }}>· {excluded} excluded</span>}
      </button>
      {open && (
        <div
          style={{
            marginTop: 14,
            padding: '16px 18px',
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            background: '#F6F4EE',
            fontSize: 12.5,
            color: MUTED,
            lineHeight: 1.65,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ...inlineComponents,
              p: ({ children }) => <p style={{ margin: '0 0 8px', color: MUTED }}>{children}</p>,
              em: ({ children }) => <em style={{ color: MUTED }}>{children}</em>,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────  shell  ───────────────────────────────── */

export function DigestView({ digest }: { digest: StructuredDigest }) {
  return (
    <main style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 48px)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <Link href="/digest" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: FAINT, fontSize: 13, textDecoration: 'none', marginBottom: 28 }}>
          ← All digests
        </Link>

        {/* Masthead */}
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT }}>
              AI Developer Digest
            </span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 750, color: INK, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {digest.displayDate}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13, color: MUTED }}>
            <span><strong style={{ color: INK, fontWeight: 650 }}>{digest.totalItems}</strong> signals that cleared the gate</span>
            {digest.scanned !== null && <span><strong style={{ color: INK, fontWeight: 650 }}>{digest.scanned}</strong> scanned</span>}
            <span><strong style={{ color: INK, fontWeight: 650 }}>{digest.readingMinutes}</strong> min read</span>
          </div>
        </header>

        <SignalHero signal={digest.signal} mustReads={digest.mustReads} />

        <JumpNav sections={digest.body} />

        {digest.body.map(section => (
          <Section key={section.id} section={section} />
        ))}

        <HorizonSection entries={digest.horizon} />

        <Methodology markdown={digest.methodology} scanned={digest.scanned} excluded={digest.excluded} />

        {/* Prev / next */}
        <nav style={{ marginTop: 56, paddingTop: 24, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          {digest.prev ? (
            <Link href={`/digest/${digest.prev}`} style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>
              ← Previous digest
            </Link>
          ) : <span />}
          {digest.next ? (
            <Link href={`/digest/${digest.next}`} style={{ color: MUTED, fontSize: 13, textDecoration: 'none', textAlign: 'right' }}>
              Next digest →
            </Link>
          ) : <span />}
        </nav>

        <p style={{ marginTop: 28, fontSize: 12, color: FAINT, lineHeight: 1.6, textAlign: 'center' }}>
          Filtered from 30+ primary sources against a published quality rubric. No press releases, no fluff —
          only what changes what you build.
        </p>
      </div>
    </main>
  )
}
