'use client'

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'

export type SkillNodeStatus = 'idle' | 'running' | 'done' | 'error'

export type SkillNodeData = {
  skillId: string
  name: string
  emoji: string
  color: string
  output: string
  status: SkillNodeStatus
}

export type SkillNodeType = Node<SkillNodeData, 'skill-node'>

export function SkillNode({ data }: NodeProps<SkillNodeType>) {
  const { name, emoji, color, output, status } = data

  const statusColor =
    status === 'running' ? '#F59E0B'
    : status === 'done' ? '#10B981'
    : status === 'error' ? '#EF4444'
    : '#334155'

  const statusLabel =
    status === 'running' ? 'Running…'
    : status === 'done' ? 'Done'
    : status === 'error' ? 'Error'
    : 'Idle'

  return (
    <div
      style={{
        width: 280,
        background: '#0D1117',
        border: `1px solid ${status === 'idle' ? 'rgba(255,255,255,0.1)' : color}40`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: status === 'done' ? `0 0 20px -5px ${color}30` : 'none',
        transition: 'border-color 0.2s, box-shadow 0.3s',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ width: 10, height: 10, background: color, border: '2px solid #030712' }}
      />

      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: `${color}10`,
          borderTop: `2px solid ${color}`,
        }}
      >
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{name}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            color: statusColor,
            fontFamily: 'var(--font-geist-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {status === 'running' && (
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#F59E0B',
                animation: 'pulse 1s infinite',
              }}
            />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Output body */}
      <div
        style={{
          padding: '10px 12px',
          maxHeight: 200,
          minHeight: 60,
          overflowY: 'auto',
        }}
      >
        {output ? (
          <pre
            style={{
              fontSize: 11,
              color: '#CBD5E1',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              fontFamily: 'var(--font-geist-mono)',
              lineHeight: 1.6,
            }}
          >
            {output}
            {status === 'running' && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 12,
                  background: color,
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </pre>
        ) : (
          <p style={{ fontSize: 11, color: '#334155', margin: 0 }}>
            {status === 'running' ? 'Generating…' : 'Output will appear here when run.'}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 10, height: 10, background: color, border: '2px solid #030712' }}
      />
    </div>
  )
}
