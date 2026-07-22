'use client'

import { useState, useRef, useCallback } from 'react'
import { MarkdownContent } from './MarkdownContent'

const role = {
  id: 'developer',
  emoji: '⚡',
  label: 'Developer',
  tagline: 'Ship faster. Break less.',
  situation: 'You just got PRs to review before standup.',
  agentLabel: 'Dev Agent',
  color: '#3B82F6',
  examples: [
    'Review this code for bugs, edge cases, and security issues:\n\n```js\nasync function getUser(id) {\n  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`)\n  return user.rows[0]\n}\n```',
    'Generate unit tests for a function that validates email addresses and passwords (min 8 chars, 1 uppercase, 1 number)',
    'Debug: TypeError: Cannot read properties of undefined (reading "map") — occurs in React when fetching data on mount',
    'Explain the difference between useEffect, useLayoutEffect, and useInsertionEffect with when to use each',
  ],
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="text-xs px-3 py-1.5 rounded-md transition-all duration-150"
      style={{ border: '1px solid rgba(30,27,22,0.12)', color: '#57534E', background: '#FFFFFF' }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export function RoleDemo() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [activeExample, setActiveExample] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(0)

  const pickExample = (example: string, i: number) => {
    setPrompt(example)
    setActiveExample(i)
    setOutput('')
    setDone(false)
    setError('')
  }

  const generate = useCallback(async () => {
    if (!prompt.trim() || streaming) return
    setStreaming(true)
    setOutput('')
    setDone(false)
    setError('')
    setElapsed(null)
    startTimeRef.current = Date.now()

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), role: role.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Error ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done: readerDone, value } = await reader.read()
        if (readerDone) break
        setOutput(prev => prev + decoder.decode(value, { stream: true }))
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 100) / 10)
      setStreaming(false)
      setDone(true)
    }
  }, [prompt, streaming])

  const reset = () => {
    setOutput('')
    setPrompt('')
    setDone(false)
    setError('')
    setActiveExample(null)
    setElapsed(null)
  }

  return (
    <section id="demo" className="py-24 px-6" style={{ borderTop: '1px solid rgba(30,27,22,0.08)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: '#7C3AED' }}>Live demo</p>
          <h2 className="text-4xl font-bold" style={{ color: '#1C1A17' }}>Dev Agent. Get real work done.</h2>
          <p className="mt-4 max-w-lg mx-auto" style={{ color: '#57534E' }}>
            No signup. No credits. Describe what you need, and get a finished output.
          </p>
        </div>

        {/* Tagline + situation */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">{role.emoji}</span>
            <span className="font-semibold" style={{ color: role.color }}>{role.tagline}</span>
          </div>
          <div className="flex items-center gap-2 text-xs rounded-full px-3 py-1" style={{ color: '#78716C', border: '1px solid rgba(30,27,22,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: role.color }} />
            {role.situation}
          </div>
        </div>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-5">
          {role.examples.map((ex, i) => {
            const preview = ex.replace(/```[\s\S]*?```/g, '[code]').slice(0, 72)
            return (
              <button
                key={i}
                onClick={() => pickExample(ex, i)}
                className="text-xs px-3 py-2 rounded-lg border transition-all duration-150 text-left"
                style={{
                  borderColor: activeExample === i ? role.color : 'rgba(30,27,22,0.10)',
                  background: activeExample === i ? `${role.color}12` : '#FFFFFF',
                  color: activeExample === i ? '#1C1A17' : '#57534E',
                }}
              >
                {preview}{preview.length < ex.replace(/```[\s\S]*?```/g, '[code]').length ? '…' : ''}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); setActiveExample(null) }}
            placeholder={`Describe what you need, ${role.label}...`}
            rows={4}
            disabled={streaming}
            className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-all duration-200 focus:border-purple-500/60 disabled:opacity-60"
            style={{
              borderColor: 'rgba(30,27,22,0.12)',
              background: '#FFFFFF',
              color: '#1C1A17',
              fontFamily: 'var(--font-geist-mono)',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
            }}
          />
          <div className="absolute bottom-3 right-3 text-xs" style={{ color: '#B4AEA3' }}>⌘↵ to generate</div>
        </div>

        {/* Generate button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={generate}
            disabled={!prompt.trim() || streaming}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: streaming ? '#9CA3AF' : `linear-gradient(135deg, ${role.color}, #7C3AED)`,
              boxShadow: streaming ? 'none' : `0 6px 16px -8px ${role.color}80`,
            }}
          >
            {streaming ? 'Working…' : 'Generate →'}
          </button>
          {done && (
            <button
              onClick={reset}
              className="text-sm transition-colors"
              style={{ color: '#8A857C' }}
            >
              ↺ Try another
            </button>
          )}
        </div>

        {/* Output */}
        {(streaming || output || error) && (
          <div
            ref={outputRef}
            className="mt-8 rounded-xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1px solid rgba(30,27,22,0.10)', boxShadow: '0 1px 2px rgba(30,27,22,0.03)' }}
          >
            {/* Output header */}
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(30,27,22,0.08)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#78716C' }}>
                <span>{role.emoji}</span>
                <span>{role.agentLabel}</span>
                <span style={{ color: 'rgba(30,27,22,0.20)' }}>·</span>
                <span>claude-sonnet-4-6</span>
                {streaming && <LoadingDots />}
                {done && elapsed !== null && (
                  <span style={{ color: '#A8A399' }}>{elapsed}s</span>
                )}
              </div>
              {done && output && <CopyButton text={output} />}
            </div>

            {/* Content */}
            <div className="p-5 overflow-auto max-h-[60vh]">
              {error ? (
                <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
              ) : (
                <MarkdownContent content={output} streaming={streaming} />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
