'use client'

import type { Skill } from './skills'

interface SkillPaletteProps {
  skills: Skill[]
  onGenerateClick: () => void
}

function DraggableSkillCard({ skill }: { skill: Skill }) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/skill', JSON.stringify(skill))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        padding: '10px 12px',
        background: '#0D1117',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        borderLeft: `3px solid ${skill.color}`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = `${skill.color}80`
        el.style.background = `${skill.color}0A`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.08)'
        el.style.background = '#0D1117'
        el.style.borderLeftColor = skill.color
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{skill.emoji}</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9' }}>{skill.name}</div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{skill.description}</div>
        </div>
      </div>
    </div>
  )
}

export function SkillPalette({ skills, onGenerateClick }: SkillPaletteProps) {
  const builtIn = skills.filter(s => s.category === 'built-in')
  const custom = skills.filter(s => s.category === 'custom')

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        background: '#080D14',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Palette header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 11, color: '#475569', fontFamily: 'var(--font-geist-mono)', marginBottom: 10 }}>
          SKILL PALETTE
        </div>
        <button
          onClick={onGenerateClick}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>✦</span>
          Generate Skill
        </button>
      </div>

      {/* Scrollable skill list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        <div style={{ fontSize: 10, color: '#334155', fontFamily: 'var(--font-geist-mono)', marginBottom: 8 }}>
          BUILT-IN — drag to canvas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {builtIn.map(skill => (
            <DraggableSkillCard key={skill.id} skill={skill} />
          ))}
        </div>

        {custom.length > 0 && (
          <>
            <div
              style={{
                fontSize: 10,
                color: '#334155',
                fontFamily: 'var(--font-geist-mono)',
                margin: '16px 0 8px',
              }}
            >
              CUSTOM — drag to canvas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {custom.map(skill => (
                <DraggableSkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 10,
          color: '#1E293B',
          flexShrink: 0,
        }}
      >
        Drag skills onto the canvas. Connect them to build a flow.
      </div>
    </div>
  )
}
