'use client'

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { useCallback } from 'react'

export type InputNodeData = {
  inputText: string
  onChange: (text: string) => void
}

export type InputNodeType = Node<InputNodeData, 'input-node'>

export function InputNode({ data }: NodeProps<InputNodeType>) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => data.onChange(e.target.value),
    [data]
  )

  return (
    <div
      style={{
        width: 300,
        background: '#0D1117',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <span style={{ fontSize: 16 }}>▶</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Input</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            color: '#475569',
            fontFamily: 'var(--font-geist-mono)',
          }}
        >
          START
        </span>
      </div>

      {/* Textarea */}
      <div style={{ padding: '10px 12px' }}>
        <textarea
          value={data.inputText}
          onChange={onChange}
          placeholder="Type your input here — this flows through all connected skills…"
          className="nodrag"
          rows={5}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#CBD5E1',
            fontSize: 12,
            padding: '8px 10px',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'var(--font-geist-mono)',
            lineHeight: 1.6,
          }}
        />
        <div style={{ textAlign: 'right', fontSize: 10, color: '#334155', marginTop: 4 }}>
          {data.inputText.length} chars
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: '#7C3AED',
          border: '2px solid #030712',
        }}
      />
    </div>
  )
}
