'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export function MarkdownContent({ content, streaming = false }: { content: string; streaming?: boolean }) {
  return (
    <div className={`prose prose-invert output-prose max-w-none ${streaming ? 'streaming-cursor' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? '')
            const isBlock = match !== null
            return isBlock ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  margin: '0.75rem 0',
                  background: '#0F172A',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={className}
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  color: '#A78BFA',
                  padding: '0.15em 0.4em',
                  borderRadius: '4px',
                  fontSize: '0.85em',
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-auto my-4">
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#E2E8F0', fontSize: '0.8rem', fontWeight: 600 }}>
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td style={{ padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#CBD5E1', fontSize: '0.85rem' }}>
                {children}
              </td>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
