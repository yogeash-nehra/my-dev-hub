'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { StructuredDigest, DigestItem, DigestSection, HorizonEntry } from '@/lib/digests'

/* ────────────────────────────────  palette  ──────────────────────────────── */

const TAG_STYLES: Record<string, { color: string; label: string }> = {
  BREAKING: { color: '#F87171', label: 'Breaking' },
  HIGH: { color: '#FB923C', label: 'High' },
  MEDIUM: { color: '#FBBF24', label: 'Medium' },
  NOTABLE: { color: '#60A5FA', label: 'Notable' },
}

const SECTION_ACCENT: Record<string, string> = {
  'Breaking Changes': '#F87171',
  'Model Releases': '#818CF8',
  'API & SDK Changes': '#34D399',
  'Research': '#F59E0B',
  'Tooling': '#60A5FA',
  'Benchmarks & Leaderboards': '#22D3EE',
  'Trends & Emerging Tech': '#F472B6',
  'Technical Discussions': '#A78BFA',
  'Quick Hits': '#94A3B8',
  'Worth Watching (Announced, Not Yet Shipped)': '#64748B',
}

const HORIZON_ACCENT: Record<string, string> = {
  PATTERN: '#A78BFA',
  TENSION: '#F472B6',
  'OPEN QUESTION': '#38BDF8',
  'IF THIS CONTINUES': '#34D399',
  'RESEARCH THREAD': '#FBBF24',
}

const EFFORT_COLOR: Record<string, string> = {
  Quick: '#34D399',
  Moderate: '#FBBF24',
  Significant: '#F87171',
}

function accentFor(title: string): string {
  return SECTION_ACCENT[title] ?? '#818CF8'
}

/* ──────────────────────────────  markdown atoms  ─────────────────────────── */

const inlineComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#A5B4FC', textDecoration: 'none', borderBottom: '1px solid rgba(165,180,252,0.35)' }}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong style={{ color: '#E2E8F0', fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em style={{ color: '#94A3B8' }}>{children}</em>,
  code: ({ children }) => (
    <code
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        padding: '1px 6px',
        fontSize: '0.85em',
        color: '#C7D2FE',
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
    <p style={{ fontSize: 14.5, color: '#A6B2C4', lineHeight: 1.75, margin: '10px 0' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 18, margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li style={{ fontSize: 14.5, color: '#A6B2C4', lineHeight: 1.7 }}>{children}</li>
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
  const style = TAG_STYLES[tag] ?? { color: '#818CF8', label: tag.charAt(0) + tag.slice(1).toLowerCase() }
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: style.color,
        background: `${style.color}1A`,
        border: `1px solid ${style.color}40`,
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
  'What changed': { accent: '#94A3B8', tint: 'rgba(148,163,184,0.06)', caption: 'What changed' },
  'TL;DR': { accent: '#818CF8', tint: 'rgba(129,140,248,0.08)', caption: 'TL;DR' },
  'Developer signal': { accent: '#34D399', tint: 'rgba(52,211,153,0.07)', caption: 'Developer signal' },
  'Dev signal': { accent: '#34D399', tint: 'rgba(52,211,153,0.07)', caption: 'Developer signal' },
  "What's happening": { accent: '#F472B6', tint: 'rgba(244,114,182,0.06)', caption: "What's happening" },
  'Why watch this': { accent: '#F472B6', tint: 'rgba(244,114,182,0.06)', caption: 'Why watch this' },
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
      <div style={{ fontSize: 14.5, color: '#CBD5E1', lineHeight: 1.7 }}>
        <MDInline>{text}</MDInline>
      </div>
    </div>
  )
}

function MetaChip({ label, text }: { label: string; text: string }) {
  if (label === 'Adoption effort') {
    const level = text.split(/[\s(]/)[0]
    const color = EFFORT_COLOR[level] ?? '#94A3B8'
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#94A3B8',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6,
          padding: '4px 10px',
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
        <span style={{ color: '#64748B' }}>Effort</span>
        <span style={{ color: '#CBD5E1' }}>
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
        color: '#94A3B8',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        padding: '4px 10px',
      }}
    >
      <span style={{ color: '#64748B' }}>Affects you if</span>
      <span style={{ color: '#CBD5E1' }}>
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
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.018)',
        padding: '22px 22px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: `linear-gradient(90deg, ${accent}, transparent 70%)`, opacity: 0.55 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        {item.tag && <span style={{ marginTop: 3 }}><TagPill tag={item.tag} /></span>}
        <h3 style={{ fontSize: 18, fontWeight: 650, color: '#F1F5F9', margin: 0, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
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
            <p key={i} style={{ fontSize: 14.5, color: '#A6B2C4', lineHeight: 1.75, margin: 0 }}>
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
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {sources.map((f, i) => (
            <span key={i} style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
              <MDInline>{f.text}</MDInline>
            </span>
          ))}
          {score && (
            <button
              onClick={() => setShowScore(s => !s)}
              style={{
                marginLeft: 'auto',
                fontSize: 11,
                color: '#475569',
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
        <p style={{ fontSize: 11, color: '#475569', fontStyle: 'italic', margin: '8px 0 0', fontFamily: 'var(--font-geist-mono)', lineHeight: 1.5 }}>
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
        <span style={{ fontSize: 11, color: '#475569', fontFamily: 'var(--font-geist-mono)' }}>
          {section.items.length}
        </span>
      )}
      <span style={{ flex: 1, height: 1, background: `${accent}1F` }} />
    </div>
  )
}

function Section({ section }: { section: DigestSection }) {
  const accent = accentFor(section.title)
  return (
    <section id={section.id} style={{ scrollMarginTop: 70, marginBottom: 44 }}>
      <SectionHeader section={section} accent={accent} />
      {section.intro && (
        <div style={{ marginBottom: section.items.length ? 16 : 0, color: '#8B98AC' }}>
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
  const accent = HORIZON_ACCENT[entry.tag] ?? '#A78BFA'
  return (
    <article style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px', background: 'rgba(255,255,255,0.015)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}38`,
            borderRadius: 5,
            padding: '3px 8px',
          }}
        >
          {entry.tag}
        </span>
      </div>
      <h4 style={{ fontSize: 16, fontWeight: 650, color: '#E8EDF5', margin: '0 0 8px', lineHeight: 1.4 }}>
        {entry.title}
      </h4>
      <div style={{ fontSize: 14, color: '#A6B2C4', lineHeight: 1.7 }}>
        <MDInline>{entry.body}</MDInline>
      </div>
      {entry.grounded && (
        <p style={{ fontSize: 11.5, color: '#64748B', fontStyle: 'italic', margin: '12px 0 0', lineHeight: 1.5 }}>
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
          background: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(56,189,248,0.06))',
          border: '1px solid rgba(124,58,237,0.28)',
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
          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>
            The Frontier — {entries.length} signals worth thinking about
          </span>
          <span style={{ display: 'block', fontSize: 12.5, color: '#94A3B8', marginTop: 3 }}>
            Open questions, emerging patterns &amp; grounded speculation. Every claim cites a source.
          </span>
        </span>
        <span style={{ fontSize: 13, color: '#A78BFA', fontWeight: 600 }}>{open ? 'Hide −' : 'Explore →'}</span>
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
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.07) 55%, rgba(52,211,153,0.05))',
        border: '1px solid rgba(124,58,237,0.30)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#C4B5FD',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px #A78BFA' }} />
        The Signal — start here
      </div>

      {signal && (
        <div style={{ fontSize: 16.5, color: '#E8EDF5', lineHeight: 1.7, letterSpacing: '-0.005em' }}>
          <MDInline>{signal}</MDInline>
        </div>
      )}

      {mustReads.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: 12 }}>
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
                    background: 'rgba(124,58,237,0.2)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    color: '#C4B5FD',
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
                <div style={{ fontSize: 14.5, color: '#CBD5E1', lineHeight: 1.65 }}>
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
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
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
              color: '#94A3B8',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 7,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
            {s.navLabel}
            {s.items.length > 0 && <span style={{ color: '#475569', fontSize: 11 }}>{s.items.length}</span>}
          </a>
        )
      })}
    </nav>
  )
}

/* ───────────────────────────────  methodology  ──────────────────────────── */

function Methodology({ markdown, scanned, excluded }: { markdown: string; scanned: number | null; excluded: number | null }) {
  const [open, setOpen] = useState(false)
  if (!markdown) return null
  return (
    <section style={{ marginTop: 40 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
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
        {excluded !== null && <span style={{ color: '#334155' }}>· {excluded} excluded</span>}
      </button>
      {open && (
        <div
          style={{
            marginTop: 14,
            padding: '16px 18px',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.015)',
            fontSize: 12.5,
            color: '#64748B',
            lineHeight: 1.65,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ...inlineComponents,
              p: ({ children }) => <p style={{ margin: '0 0 8px', color: '#64748B' }}>{children}</p>,
              em: ({ children }) => <em style={{ color: '#64748B' }}>{children}</em>,
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
    <main style={{ background: '#030712', minHeight: 'calc(100vh - 48px)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <Link href="/digest" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 13, textDecoration: 'none', marginBottom: 28 }}>
          ← All digests
        </Link>

        {/* Masthead */}
        <header style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#64748B' }}>
              AI Developer Digest
            </span>
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 750, color: '#F8FAFC', margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {digest.displayDate}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', fontSize: 13, color: '#64748B' }}>
            <span><strong style={{ color: '#94A3B8', fontWeight: 600 }}>{digest.totalItems}</strong> signals that cleared the gate</span>
            {digest.scanned !== null && <span><strong style={{ color: '#94A3B8', fontWeight: 600 }}>{digest.scanned}</strong> scanned</span>}
            <span><strong style={{ color: '#94A3B8', fontWeight: 600 }}>{digest.readingMinutes}</strong> min read</span>
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
        <nav style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          {digest.prev ? (
            <Link href={`/digest/${digest.prev}`} style={{ color: '#94A3B8', fontSize: 13, textDecoration: 'none' }}>
              ← Previous digest
            </Link>
          ) : <span />}
          {digest.next ? (
            <Link href={`/digest/${digest.next}`} style={{ color: '#94A3B8', fontSize: 13, textDecoration: 'none', textAlign: 'right' }}>
              Next digest →
            </Link>
          ) : <span />}
        </nav>

        <p style={{ marginTop: 28, fontSize: 12, color: '#334155', lineHeight: 1.6, textAlign: 'center' }}>
          Filtered from 30+ primary sources against a published quality rubric. No press releases, no fluff —
          only what changes what you build.
        </p>
      </div>
    </main>
  )
}
