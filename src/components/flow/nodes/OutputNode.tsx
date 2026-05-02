'use client'

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useState } from 'react'

export type OutputNodeData = { result: string }
export type OutputNodeType = Node<OutputNodeData, 'output-node'>

export function OutputNode({ data }: NodeProps<OutputNodeType>) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!data.result) return
    await navigator.clipboard.writeText(data.result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        width: 340,
        background: '#0D1117',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: data.result ? '0 0 20px -5px rgba(16,185,129,0.2)' : 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ width: 10, height: 10, background: '#10B981', border: '2px solid #030712' }}
      />

      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(16,185,129,0.05)',
        }}
      >
        <span style={{ fontSize: 16 }}>⬛</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Output</span>
        {data.result && (
          <button
            onClick={copy}
            className="nodrag"
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: copied ? '#10B981' : '#64748B',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
        {!data.result && (
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#334155', fontFamily: 'var(--font-geist-mono)' }}>
            END
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          padding: '12px 14px',
          maxHeight: 300,
          overflowY: 'auto',
          minHeight: 60,
        }}
      >
        {data.result ? (
          <pre
            style={{
              fontSize: 12,
              color: '#CBD5E1',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              fontFamily: 'var(--font-geist-mono)',
              lineHeight: 1.6,
            }}
          >
            {data.result}
          </pre>
        ) : (
          <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>
            Connect skills and click Run ▶ to see results here.
          </p>
        )}
      </div>
    </div>
  )
}
