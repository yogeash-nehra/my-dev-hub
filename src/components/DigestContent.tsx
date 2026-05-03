'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface Props {
  content: string
}

const SECTION_ACCENT: Record<string, string> = {
  'Model Releases': '#818CF8',
  'API & SDK Changes': '#34D399',
  'Research': '#F59E0B',
  'Research Papers': '#F59E0B',
  'Tooling': '#60A5FA',
  'Tooling Updates': '#60A5FA',
  'Trends & Emerging Tech': '#F472B6',
  'Technical Discussions': '#A78BFA',
}

function getSectionColor(text: string): string {
  return SECTION_ACCENT[text.trim()] ?? '#6366F1'
}

// Strip the top-level h1 title line — we render our own header
function stripTitle(content: string): string {
  return content.replace(/^# AI Developer Digest.*\n\*[^\n]+\*\n\n---\n\n/, '')
}

const components: Components = {
  h1: () => null,

  h2: ({ children }) => {
    const text = String(children)
    const color = getSectionColor(text)
    return (
      <h2
        style={{
          fontSize: 13,
          fontWeight: 700,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '40px 0 20px',
          paddingBottom: 10,
          borderBottom: `1px solid ${color}22`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: 'inline-block' }} />
        {text}
      </h2>
    )
  },

  h3: ({ children }) => (
    <h3
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: '#E2E8F0',
        margin: '28px 0 12px',
        lineHeight: 1.4,
      }}
    >
      {children}
    </h3>
  ),

  p: ({ children }) => {
    const text = String(children)

    // Style "TL;DR:" paragraphs
    if (text.startsWith('**TL;DR:**') || text.startsWith('**TL;DR**')) {
      return (
        <div
          style={{
            background: 'rgba(99,102,241,0.07)',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 12,
            fontSize: 14,
            color: '#CBD5E1',
            lineHeight: 1.65,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <span>{children}</span> }}>
            {String(children)}
          </ReactMarkdown>
        </div>
      )
    }

    // Style "Developer signal:" paragraphs
    if (text.startsWith('**Developer signal:**') || text.startsWith('**Dev signal:**')) {
      return (
        <div
          style={{
            background: 'rgba(52,211,153,0.05)',
            border: '1px solid rgba(52,211,153,0.14)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 12,
            fontSize: 14,
            color: '#CBD5E1',
            lineHeight: 1.65,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <span>{children}</span> }}>
            {String(children)}
          </ReactMarkdown>
        </div>
      )
    }

    // Style "What's happening:" / "Why watch this:" paragraphs
    if (text.startsWith("**What's happening:**") || text.startsWith('**Why watch this:**')) {
      return (
        <div
          style={{
            background: 'rgba(244,114,182,0.05)',
            border: '1px solid rgba(244,114,182,0.14)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 12,
            fontSize: 14,
            color: '#CBD5E1',
            lineHeight: 1.65,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <span>{children}</span> }}>
            {String(children)}
          </ReactMarkdown>
        </div>
      )
    }

    // Metadata line (Source / Date / Link)
    if (text.startsWith('**Source:**') || text.startsWith('**Primary source:**')) {
      return (
        <p style={{ fontSize: 12, color: '#475569', margin: '8px 0', lineHeight: 1.5 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <span>{children}</span> }}>
            {String(children)}
          </ReactMarkdown>
        </p>
      )
    }

    // Quality gate score line
    if (text.startsWith('*Quality gate score:')) {
      return (
        <p style={{ fontSize: 11, color: '#334155', fontStyle: 'italic', margin: '8px 0 20px', fontFamily: 'var(--font-geist-mono)' }}>
          {children}
        </p>
      )
    }

    // Exclusion footer line
    if (text.startsWith('*Quality gate excluded') || text.startsWith('*Items excluded')) {
      return (
        <p style={{ fontSize: 12, color: '#334155', fontStyle: 'italic', marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
          {children}
        </p>
      )
    }

    return (
      <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: '10px 0' }}>
        {children}
      </p>
    )
  },

  strong: ({ children }) => (
    <strong style={{ color: '#CBD5E1', fontWeight: 600 }}>{children}</strong>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#818CF8', textDecoration: 'none', borderBottom: '1px solid rgba(129,140,248,0.3)' }}
    >
      {children}
    </a>
  ),

  code: ({ children, className }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code
          style={{
            display: 'block',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '14px 16px',
            fontSize: 12,
            color: '#94A3B8',
            fontFamily: 'var(--font-geist-mono)',
            overflowX: 'auto',
            lineHeight: 1.6,
          }}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          padding: '1px 6px',
          fontSize: '0.875em',
          color: '#94A3B8',
          fontFamily: 'var(--font-geist-mono)',
        }}
      >
        {children}
      </code>
    )
  },

  pre: ({ children }) => (
    <pre
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '14px 16px',
        overflowX: 'auto',
        margin: '12px 0',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  ),

  ul: ({ children }) => (
    <ul style={{ paddingLeft: 20, margin: '8px 0', color: '#94A3B8', fontSize: 14, lineHeight: 1.7 }}>
      {children}
    </ul>
  ),

  li: ({ children }) => (
    <li style={{ marginBottom: 4 }}>{children}</li>
  ),

  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '32px 0' }} />
  ),

  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid rgba(99,102,241,0.4)',
        paddingLeft: 16,
        margin: '16px 0',
        color: '#64748B',
        fontStyle: 'italic',
      }}
    >
      {children}
    </blockquote>
  ),
}

export function DigestContent({ content }: Props) {
  const stripped = stripTitle(content)
  return (
    <div style={{ lineHeight: 1.7 }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {stripped}
      </ReactMarkdown>
    </div>
  )
}
