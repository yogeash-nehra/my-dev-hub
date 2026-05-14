'use client'

import { useState, useRef } from 'react'
import {
  GALLERY_SKILLS,
  CATEGORY_META,
  type GallerySkill,
  type FilterCategory,
  type SkillCategory,
} from '@/data/skills-gallery'

function downloadMd(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function slugFromContent(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  if (!match) return fallback
  return match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const FILTER_KEYS: FilterCategory[] = ['all', 'code', 'devops', 'ops', 'research', 'writing']

export function SkillsHub() {
  const [desc, setDesc] = useState('')
  const [genCategory, setGenCategory] = useState<SkillCategory | ''>('')
  const [generated, setGenerated] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const [filter, setFilter] = useState<FilterCategory>('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<GallerySkill | null>(null)
  const [modalCopied, setModalCopied] = useState(false)

  const filteredSkills = GALLERY_SKILLS.filter(s => {
    if (filter !== 'all' && s.category !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  async function generate() {
    if (!desc.trim() || generating) return
    setGenerating(true)
    setGenerated('')
    setGenError('')
    setCopied(false)

    try {
      const res = await fetch('/api/skills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc.trim(), category: genCategory || undefined }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `Error ${res.status}`)
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setGenerated(prev => prev + decoder.decode(value, { stream: true }))
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setGenerating(false)
    }
  }

  function copyText(text: string, onDone: () => void) {
    navigator.clipboard.writeText(text).then(onDone)
  }

  return (
    <div style={{ background: '#030712', minHeight: 'calc(100vh - 48px)', color: '#F1F5F9' }}>

      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            AI Skills
          </span>
        </div>
        <h1 className="font-bold tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.1, marginBottom: 16 }}>
          Skills that actually<br />
          <span className="gradient-text">do something.</span>
        </h1>
        <p style={{ fontSize: 15, color: '#94A3B8', maxWidth: 520, lineHeight: 1.6 }}>
          Browse curated Claude Code skills or generate one in seconds. Drop the{' '}
          <code style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#CBD5E1' }}>.md</code>
          {' '}file into{' '}
          <code style={{ fontSize: 12, background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#CBD5E1' }}>.claude/commands/</code>
          {' '}and it becomes a slash command.
        </p>
      </div>

      {/* ── Generator ── */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <div style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 0 0 1px rgba(124,58,237,0.06), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>⚡</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Skill Generator</span>
            <span style={{ fontSize: 12, color: '#475569', marginLeft: 4 }}>Describe it. Get the file.</span>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
              placeholder='e.g. "Review database queries for N+1 issues and suggest fixes"'
              rows={3}
              style={{
                flex: '1 1 300px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '12px 14px',
                color: '#F1F5F9',
                fontSize: 14,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.55,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
              <select
                value={genCategory}
                onChange={e => setGenCategory(e.target.value as SkillCategory | '')}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: genCategory ? '#F1F5F9' : '#475569',
                  fontSize: 13,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Category (optional)</option>
                <option value="code">Code</option>
                <option value="devops">DevOps</option>
                <option value="ops">Ops</option>
                <option value="research">Research</option>
                <option value="writing">Writing</option>
              </select>
              <button
                onClick={generate}
                disabled={!desc.trim() || generating}
                style={{
                  background: !desc.trim() || generating
                    ? 'rgba(124,58,237,0.15)'
                    : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 0',
                  color: !desc.trim() || generating ? '#4B5563' : '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: !desc.trim() || generating ? 'not-allowed' : 'pointer',
                  flex: 1,
                  boxShadow: !desc.trim() || generating ? 'none' : '0 2px 12px rgba(124,58,237,0.35)',
                  transition: 'all 0.15s',
                }}
              >
                {generating ? 'Generating...' : 'Generate  ⌘↵'}
              </button>
            </div>
          </div>

          {genError && (
            <p style={{ fontSize: 13, color: '#EF4444', marginTop: 10 }}>{genError}</p>
          )}

          {(generated || generating) && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '16px 18px',
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 12.5,
                lineHeight: 1.75,
                color: '#CBD5E1',
                whiteSpace: 'pre-wrap',
                maxHeight: 380,
                overflowY: 'auto',
                minHeight: 80,
              }}>
                {generated || <span style={{ color: '#374151' }}>Starting...</span>}
                {generating && <span style={{ opacity: 0.6, marginLeft: 2 }}>▋</span>}
                <div ref={outputRef} />
              </div>
              {generated && !generating && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => copyText(generated, () => { setCopied(true); setTimeout(() => setCopied(false), 2000) })}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      padding: '7px 14px',
                      color: copied ? '#10B981' : '#94A3B8',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => downloadMd(generated, slugFromContent(generated, 'my-skill'))}
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 16px',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                    }}
                  >
                    Download .md
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            Skill Gallery
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 400, marginLeft: 10 }}>
              {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
            </span>
          </h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '8px 14px',
              color: '#F1F5F9',
              fontSize: 13,
              outline: 'none',
              width: 180,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {FILTER_KEYS.map(cat => {
            const meta = CATEGORY_META[cat]
            const active = filter === cat
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: `1px solid ${active ? meta.color + '55' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? meta.color + '15' : 'transparent',
                  color: active ? meta.color : '#4B5563',
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {meta.label}
              </button>
            )
          })}
        </div>

        {filteredSkills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#374151' }}>
            No skills match. Try the generator above.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filteredSkills.map(skill => {
              const catColor = CATEGORY_META[skill.category].color
              return (
                <div
                  key={skill.id}
                  style={{
                    background: 'rgba(13,17,23,0.8)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 14,
                    padding: '18px 18px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.13)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22, lineHeight: 1, marginTop: 1 }}>{skill.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {skill.name}
                        {skill.popular && (
                          <span style={{
                            fontSize: 10, background: 'rgba(124,58,237,0.18)',
                            color: '#A78BFA', borderRadius: 4, padding: '1px 5px', fontWeight: 500,
                          }}>
                            popular
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: catColor, fontWeight: 500, marginTop: 2 }}>
                        {CATEGORY_META[skill.category].label}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                    {skill.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {skill.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, color: '#475569',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 4, padding: '2px 7px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setModal(skill); setModalCopied(false) }}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8,
                        padding: '8px 0',
                        color: '#94A3B8',
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget
                        el.style.color = '#CBD5E1'
                        el.style.borderColor = 'rgba(255,255,255,0.13)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget
                        el.style.color = '#94A3B8'
                        el.style.borderColor = 'rgba(255,255,255,0.07)'
                      }}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => downloadMd(skill.content, skill.id)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.75), rgba(79,70,229,0.75))',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 0',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      Download
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(10,14,20,0.99)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 680,
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{modal.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{modal.name}</div>
                  <div style={{ fontSize: 11, color: CATEGORY_META[modal.category].color, marginTop: 1 }}>
                    {CATEGORY_META[modal.category].label} · {modal.id}.md
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', color: '#475569', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
              >
                ×
              </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '18px 20px', flex: 1 }}>
              <pre style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 12.5,
                lineHeight: 1.75,
                color: '#CBD5E1',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}>
                {modal.content}
              </pre>
            </div>

            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: 8, justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => copyText(modal.content, () => { setModalCopied(true); setTimeout(() => setModalCopied(false), 2000) })}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: modalCopied ? '#10B981' : '#94A3B8',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
              >
                {modalCopied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                onClick={() => downloadMd(modal.content, modal.id)}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }}
              >
                Download .md
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
