'use client'

import { useState } from 'react'
import type { Skill } from './skills'

interface GenerateSkillDialogProps {
  onClose: () => void
  onSkillCreated: (skill: Skill) => void
}

export function GenerateSkillDialog({ onClose, onSkillCreated }: GenerateSkillDialogProps) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!description.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      onSkillCreated(data.skill)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: 480,
          background: '#0D1117',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 25px 60px -10px rgba(0,0,0,0.6), 0 0 40px -10px rgba(124,58,237,0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(124,58,237,0.06)',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>
              ✦ Generate a Skill
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
              Describe what you want and Claude will build it
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 8 }}>
            Describe your skill
          </label>
          <textarea
            autoFocus
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. A skill that takes raw meeting notes and extracts an executive summary with action items, owners, and deadlines…"
            rows={5}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              color: '#CBD5E1',
              fontSize: 13,
              padding: '10px 12px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />

          {error && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                fontSize: 12,
                color: '#FCA5A5',
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 10, color: '#334155' }}>⌘↵ to generate</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#64748B',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={generate}
                disabled={!description.trim() || loading}
                style={{
                  padding: '8px 20px',
                  background: loading || !description.trim()
                    ? 'rgba(124,58,237,0.3)'
                    : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  border: 'none',
                  borderRadius: 8,
                  color: loading || !description.trim() ? '#6B7280' : '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading || !description.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                    Generating…
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
