'use client'

import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const roles = [
  {
    id: 'developer',
    emoji: '⚡',
    label: 'Developer',
    tagline: 'Ship faster. Break less.',
    color: '#3B82F6',
    examples: [
      'Review this code for bugs, edge cases, and security issues:\n\n```js\nasync function getUser(id) {\n  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`)\n  return user.rows[0]\n}\n```',
      'Generate unit tests for a function that validates email addresses and passwords (min 8 chars, 1 uppercase, 1 number)',
      'Debug: TypeError: Cannot read properties of undefined (reading "map") — occurs in React when fetching data on mount',
      'Explain the difference between useEffect, useLayoutEffect, and useInsertionEffect with when to use each',
    ],
  },
  {
    id: 'architect',
    emoji: '🏗️',
    label: 'Architect',
    tagline: 'Design systems that scale.',
    color: '#8B5CF6',
    examples: [
      'Compare PostgreSQL vs MongoDB vs DynamoDB for a multi-tenant SaaS app with 500k users. Give a direct recommendation.',
      'Design an API rate limiting strategy for a public REST API that needs to handle 10k req/min with per-user quotas',
      'Microservices vs monolith for a 6-person startup building a B2B analytics platform. Be opinionated.',
      'Design a real-time notification system for a marketplace app — WebSockets vs SSE vs polling',
    ],
  },
  {
    id: 'entrepreneur',
    emoji: '🚀',
    label: 'Entrepreneur',
    tagline: 'Move fast. Think clearly.',
    color: '#F59E0B',
    examples: [
      'Write a one-page business proposal for an AI-powered scheduling tool for healthcare clinics',
      'Research the competitive landscape for B2B project management tools — key players, gaps, and where to position',
      'Draft a Q1 investor update email: shipped auth, onboarded 3 enterprise pilots, $180k ARR, raising $1.5M seed',
      'SWOT analysis for entering the AI-powered legal document review market as a bootstrapped startup',
    ],
  },
  {
    id: 'ba',
    emoji: '📊',
    label: 'Business Analyst',
    tagline: 'Turn requirements into clarity.',
    color: '#10B981',
    examples: [
      'Write user stories and acceptance criteria for a two-factor authentication feature on a mobile banking app',
      'Document business requirements for a real-time inventory dashboard for a retail chain with 50 stores',
      'Create a process flow for employee offboarding including IT, HR, and finance touchpoints',
      'Write a BRD section for migrating customer data from Salesforce to HubSpot with zero downtime',
    ],
  },
  {
    id: 'qa',
    emoji: '🔍',
    label: 'QA Engineer',
    tagline: 'Find it before they do.',
    color: '#EF4444',
    examples: [
      'Generate a complete test plan for a Stripe payment integration — happy path, failures, webhooks, and edge cases',
      'Write test cases for a date-range picker: min/max constraints, timezone handling, invalid ranges',
      'Design a regression testing checklist for a mobile app release covering iOS 17 and Android 14',
      'Create a performance testing strategy for an API endpoint that must handle 1000 concurrent users',
    ],
  },
  {
    id: 'it_support',
    emoji: '🛠️',
    label: 'IT Support',
    tagline: 'Fix it fast. Document it right.',
    color: '#06B6D4',
    examples: [
      'Write a troubleshooting runbook for users unable to connect to VPN — Windows and Mac coverage',
      'Create an incident response playbook for a production database outage — detection to post-mortem',
      'Knowledge base article: How to reset MFA for a locked-out Office 365 account (helpdesk procedure)',
      'Write a system access request and provisioning process for onboarding new developers',
    ],
  },
  {
    id: 'social_media',
    emoji: '📱',
    label: 'Social Media',
    tagline: 'Create content that lands.',
    color: '#EC4899',
    examples: [
      'Write 3 LinkedIn posts about how AI is changing developer workflows — insight-led, not hype',
      'Create a Twitter/X thread (6 tweets) on why most startups fail at product-market fit and how to avoid it',
      'Draft a product launch announcement for Instagram and LinkedIn: launching an AI meeting notes tool',
      'Write 5 content ideas with hooks for a personal brand in the B2B SaaS space, audience: CTOs and founders',
    ],
  },
]

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
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [activeExample, setActiveExample] = useState<number | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const selectRole = (role: typeof roles[0]) => {
    setSelectedRole(role)
    setPrompt('')
    setOutput('')
    setDone(false)
    setError('')
    setActiveExample(null)
  }

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

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), role: selectedRole.id }),
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
      setStreaming(false)
      setDone(true)
    }
  }, [prompt, selectedRole.id, streaming])

  const reset = () => {
    setOutput('')
    setPrompt('')
    setDone(false)
    setError('')
    setActiveExample(null)
  }

  return (
    <section id="demo" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-purple-400 tracking-widest uppercase mb-3">Live demo</p>
          <h2 className="text-4xl font-bold text-slate-50">Pick your role. Get real work done.</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            No signup. No credits. Pick what you do, describe what you need, and get a finished output.
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-8">
          {roles.map(role => {
            const active = role.id === selectedRole.id
            return (
              <button
                key={role.id}
                onClick={() => selectRole(role)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200"
                style={{
                  borderColor: active ? role.color : 'rgba(255,255,255,0.08)',
                  background: active ? `${role.color}12` : '#0D1117',
                  boxShadow: active ? `0 0 18px -4px ${role.color}50` : 'none',
                }}
              >
                <span className="text-2xl">{role.emoji}</span>
                <span className="text-xs font-medium leading-tight"
                  style={{ color: active ? role.color : '#94A3B8' }}>
                  {role.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tagline */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-lg">{selectedRole.emoji}</span>
          <span className="font-semibold" style={{ color: selectedRole.color }}>{selectedRole.tagline}</span>
        </div>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2 mb-5">
          {selectedRole.examples.map((ex, i) => {
            const preview = ex.replace(/```[\s\S]*?```/g, '[code]').slice(0, 72)
            return (
              <button
                key={i}
                onClick={() => pickExample(ex, i)}
                className="text-xs px-3 py-2 rounded-lg border transition-all duration-150 text-left"
                style={{
                  borderColor: activeExample === i ? selectedRole.color : 'rgba(255,255,255,0.08)',
                  background: activeExample === i ? `${selectedRole.color}14` : '#0D1117',
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
            placeholder={`Describe what you need, ${selectedRole.label}...`}
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
              background: streaming ? '#4B5563' : `linear-gradient(135deg, ${selectedRole.color}, #7C3AED)`,
              boxShadow: streaming ? 'none' : `0 0 20px -4px ${selectedRole.color}60`,
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
                <span>{selectedRole.emoji}</span>
                <span>{selectedRole.label} output</span>
                {streaming && <LoadingDots />}
              </div>
              {done && output && <CopyButton text={output} />}
            </div>

            {/* Content */}
            <div className="p-5 overflow-auto max-h-[60vh]">
              {error ? (
                <p className="text-red-400 text-sm">{error}</p>
              ) : (
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
                    {output}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
