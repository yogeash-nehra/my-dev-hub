'use client'

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useState } from 'react'

export type SkillNodeStatus = 'idle' | 'running' | 'done' | 'error'

export type SkillNodeData = {
  skillId: string
  name: string
  emoji: string
  color: string
  output: string
  status: SkillNodeStatus
  instruction: string
  onDelete?: () => void
  onInstructionChange?: (value: string) => void
}

export type SkillNodeType = Node<SkillNodeData, 'skill-node'>

export function SkillNode({ data }: NodeProps<SkillNodeType>) {
  const { name, emoji, color, output, status, instruction } = data
  const [expanded, setExpanded] = useState(false)

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
          padding: '10px 10px 10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: `${color}10`,
          borderTop: `2px solid ${color}`,
        }}
      >
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', flex: 1 }}>{name}</span>
        <span
          style={{
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
        <button
          onClick={() => data.onDelete?.()}
          className="nodrag"
          title="Delete node (or select + Delete key)"
          style={{
            background: 'none',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '0 2px',
            marginLeft: 4,
            borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#EF4444' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#475569' }}
        >
          ×
        </button>
      </div>

      {/* Output body */}
      <div
        style={{
          padding: '10px 12px',
          maxHeight: expanded ? 480 : 160,
          minHeight: 52,
          overflowY: 'auto',
          transition: 'max-height 0.2s ease',
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
            {status === 'running' ? 'Generating…' : 'Output appears here when run.'}
          </p>
        )}
      </div>

      {/* Expand toggle */}
      {output && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="nodrag"
          style={{
            display: 'block',
            width: '100%',
            background: 'none',
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            color: '#334155',
            fontSize: 10,
            cursor: 'pointer',
            padding: '4px 0',
            textAlign: 'center',
            fontFamily: 'var(--font-geist-mono)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748B' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#334155' }}
        >
          {expanded ? '▲ collapse' : '▼ expand'}
        </button>
      )}

      {/* Instruction field */}
      <div style={{ padding: '6px 10px 8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <input
          className="nodrag"
          value={instruction || ''}
          onChange={e => data.onInstructionChange?.(e.target.value)}
          placeholder="Additional instruction…"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6,
            color: '#94A3B8',
            fontSize: 11,
            padding: '4px 8px',
            outline: 'none',
            fontFamily: 'var(--font-geist-mono)',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = `${color}60` }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)' }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: 10, height: 10, background: color, border: '2px solid #030712' }}
      />
    </div>
  )
}
