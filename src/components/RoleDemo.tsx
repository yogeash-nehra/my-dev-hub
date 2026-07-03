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
      className="text-xs px-3 py-1.5 rounded-md border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all duration-150"
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
    <section id="demo" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-purple-400 tracking-widest uppercase mb-3">Live demo</p>
          <h2 className="text-4xl font-bold text-slate-50">Dev Agent. Get real work done.</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            No signup. No credits. Describe what you need, and get a finished output.
          </p>
        </div>

        {/* Tagline + situation */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">{role.emoji}</span>
            <span className="font-semibold" style={{ color: role.color }}>{role.tagline}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 border border-white/8 rounded-full px-3 py-1">
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
                  borderColor: activeExample === i ? role.color : 'rgba(255,255,255,0.08)',
                  background: activeExample === i ? `${role.color}14` : '#0D1117',
                  color: activeExample === i ? '#F1F5F9' : '#94A3B8',
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
            className="w-full rounded-xl border bg-surface text-slate-200 placeholder-slate-600 px-4 py-3 text-sm resize-none outline-none transition-all duration-200 focus:border-purple-500/60 disabled:opacity-60"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              background: '#0D1117',
              fontFamily: 'var(--font-geist-mono)',
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
            }}
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-700">⌘↵ to generate</div>
        </div>

        {/* Generate button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={generate}
            disabled={!prompt.trim() || streaming}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: streaming ? '#4B5563' : `linear-gradient(135deg, ${role.color}, #7C3AED)`,
              boxShadow: streaming ? 'none' : `0 0 20px -4px ${role.color}60`,
            }}
          >
            {streaming ? 'Working…' : 'Generate →'}
          </button>
          {done && (
            <button
              onClick={reset}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              ↺ Try another
            </button>
          )}
        </div>

        {/* Output */}
        {(streaming || output || error) && (
          <div
            ref={outputRef}
            className="mt-8 rounded-xl border border-white/8 overflow-hidden"
            style={{ background: '#060B14' }}
          >
            {/* Output header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{role.emoji}</span>
                <span>{role.agentLabel}</span>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                <span>claude-sonnet-4-6</span>
                {streaming && <LoadingDots />}
                {done && elapsed !== null && (
                  <span className="text-slate-600">{elapsed}s</span>
                )}
              </div>
              {done && output && <CopyButton text={output} />}
            </div>

            {/* Content */}
            <div className="p-5 overflow-auto max-h-[60vh]">
              {error ? (
                <p className="text-red-400 text-sm">{error}</p>
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
