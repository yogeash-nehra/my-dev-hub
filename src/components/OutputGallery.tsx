'use client'

import { useState } from 'react'

const tabs = [
  { id: 'developer', roleId: 'developer', emoji: '⚡', label: 'Developer', color: '#3B82F6', agentLabel: 'Dev Agent', prompt: 'Review this for bugs, edge cases, and security issues:\n\nasync function getUser(id) {\n  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`)\n  return user.rows[0]\n}' },
  { id: 'founder',   roleId: 'entrepreneur', emoji: '🚀', label: 'Founder', color: '#F59E0B', agentLabel: 'Ops Agent', prompt: 'Draft a one-page proposal for AI scheduling automation.\nClient: Riverside Medical Group · 6 clinic locations · ~200 staff.' },
  { id: 'ba',        roleId: 'ba', emoji: '📊', label: 'Business Analyst', color: '#10B981', agentLabel: 'BA Agent', prompt: 'Write user stories and acceptance criteria for two-factor authentication on a mobile banking app.' },
  { id: 'qa',        roleId: 'qa', emoji: '🔍', label: 'QA Engineer', color: '#EF4444', agentLabel: 'QA Agent', prompt: 'Generate a complete test plan for a Stripe payment integration — happy path, failures, webhooks, and edge cases.' },
]

function DevOutput() {
  return (
    <div className="space-y-5 text-sm" style={{ fontFamily: 'var(--font-geist-mono)' }}>
      <div>
        <p className="text-slate-100 font-semibold text-base mb-0.5">Code Review — <span className="text-blue-400">getUser()</span></p>
        <p className="text-slate-500 text-xs">2 issues found · 1 critical · 1 warning</p>
      </div>
      <div className="w-full h-px bg-white/6" />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-red-400 font-semibold text-xs uppercase tracking-wide">Critical</span>
          <span className="text-slate-500 text-xs">·</span>
          <span className="text-slate-400 text-xs"><span className="text-slate-500">getUser:2</span> — SQL Injection</span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed pl-4">Raw <span className="text-blue-300">id</span> directly interpolated into query string. Attacker passes <span className="text-red-300">id = &quot;1; DROP TABLE users&quot;</span> and executes arbitrary SQL.</p>
        <div className="rounded-lg p-3 pl-4 space-y-1" style={{ background: '#0A0F1A' }}>
          <div className="text-red-400/60 text-xs">{'// ❌ Vulnerable'}</div>
          <div className="text-slate-300 text-xs">{`await db.query(\`SELECT * FROM users WHERE id = \${id}\`)`}</div>
          <div className="pt-1 text-slate-600 text-xs">{'// ✅ Fix — parameterised query'}</div>
          <div className="text-emerald-400 text-xs">{`await db.query('SELECT * FROM users WHERE id = $1', [id])`}</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-amber-400 font-semibold text-xs uppercase tracking-wide">Warning</span>
          <span className="text-slate-500 text-xs">·</span>
          <span className="text-slate-400 text-xs"><span className="text-slate-500">getUser:3</span> — Missing null check</span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed pl-4"><span className="text-blue-300">rows[0]</span> is <span className="text-amber-300">undefined</span> when no user matches. Callers expecting an object will throw <span className="text-red-300">TypeError</span>.</p>
        <div className="rounded-lg p-3 pl-4 space-y-1" style={{ background: '#0A0F1A' }}>
          <div className="text-emerald-400 text-xs">{`if (!user.rows[0]) throw new Error(\`User not found: \${id}\`)`}</div>
          <div className="text-slate-300 text-xs">return user.rows[0]</div>
        </div>
      </div>
    </div>
  )
}

function FounderOutput() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-slate-100 font-semibold text-base">Proposal: AI Scheduling Automation</p>
        <p className="text-slate-500 text-xs mt-0.5">Riverside Medical Group · May 2026</p>
      </div>
      <div className="w-full h-px bg-white/6" />
      <div>
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1.5">The Problem</p>
        <p className="text-slate-400 text-xs leading-relaxed">Front desks across 6 locations spend <span className="text-slate-200 font-medium">11–14 hours/week</span> resolving scheduling conflicts and chasing no-shows — work that is entirely rule-bound and repeatable.</p>
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1.5">The Solution</p>
        <div className="space-y-1 text-slate-400 text-xs leading-relaxed">
          {['Auto-resolves conflicts using clinic-specific priority rules', 'Sends & tracks no-show follow-ups without staff involvement', 'Daily exception report for the 5% needing human judgment'].map(l => (
            <div key={l} className="flex gap-2"><span className="text-amber-500 flex-shrink-0">·</span>{l}</div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">Deliverables</p>
        <div className="rounded-lg overflow-hidden border border-white/6 text-xs" style={{ background: '#0A0F1A' }}>
          {[['Phase 1 — Integration', 'EHR connector, calendar sync', '3 weeks'], ['Phase 2 — Automation', 'Rules engine, follow-up sequences', '2 weeks'], ['Phase 3 — Handoff', 'Staff training, runbook', '1 week']].map(([phase, scope, time]) => (
            <div key={phase} className="flex items-center gap-3 px-3 py-2 border-b border-white/4 last:border-0">
              <span className="text-slate-300 font-medium w-36 flex-shrink-0">{phase}</span>
              <span className="text-slate-500 flex-1">{scope}</span>
              <span className="text-amber-400/70 flex-shrink-0">{time}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1.5">Investment</p>
        <p className="text-slate-200 text-sm font-medium">$8,500 <span className="text-slate-500 font-normal text-xs">setup</span> · $1,200/mo <span className="text-slate-500 font-normal text-xs">ongoing</span></p>
        <p className="text-slate-500 text-xs mt-0.5">ROI break-even at ~6 weeks based on current staff cost</p>
      </div>
    </div>
  )
}

function BAOutput() {
  return (
    <div className="space-y-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)' }}>
      <div>
        <p className="text-slate-100 font-semibold text-base">Feature: Two-Factor Authentication</p>
        <p className="text-slate-500 text-xs mt-0.5">Requirements Specification · Mobile Banking App</p>
      </div>
      <div className="w-full h-px bg-white/6" />
      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">US-01</span>
          <span className="text-slate-400 text-xs ml-2">Enrol SMS 2FA</span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed pl-3 border-l border-emerald-500/30">
          <span className="text-slate-500">As a</span> registered user<span className="text-slate-500">, I want to</span> add SMS-based 2FA to my account <span className="text-slate-500">so that</span> it is protected even if my password is compromised.
        </p>
        <div className="rounded-lg overflow-hidden border border-white/6 text-xs" style={{ background: '#0A0F1A' }}>
          {[
            ['AC-01', 'GIVEN logged in', 'WHEN Security Settings opened', 'THEN "Enable 2FA" option visible'],
            ['AC-02', 'GIVEN 2FA setup open', 'WHEN valid phone entered', 'THEN 6-digit SMS within 30s'],
            ['AC-03', 'GIVEN code received', 'WHEN correct code entered', 'THEN 2FA enabled, email sent'],
            ['AC-04', 'GIVEN code received', 'WHEN incorrect code entered', 'THEN error shown, retry up to 3×'],
          ].map(([id, given, when, then]) => (
            <div key={id} className="px-3 py-2 border-b border-white/4 last:border-0">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400/70 flex-shrink-0 w-8">{id}</span>
                <div className="space-y-0.5">
                  <div><span className="text-slate-600">Given</span> <span className="text-slate-400">{given.replace('GIVEN ', '')}</span></div>
                  <div><span className="text-slate-600">When</span>  <span className="text-slate-400">{when.replace('WHEN ', '')}</span></div>
                  <div><span className="text-slate-600">Then</span>  <span className="text-slate-300">{then.replace('THEN ', '')}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs pl-1">US-02: Login with 2FA active · US-03: Account recovery · [2 more stories below]</p>
      </div>
    </div>
  )
}

function QAOutput() {
  return (
    <div className="space-y-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)' }}>
      <div>
        <p className="text-slate-100 font-semibold text-base">Test Plan: Stripe Payment Integration</p>
        <div className="flex gap-4 mt-1 text-xs">
          <span><span className="text-slate-500">Scope</span> <span className="text-slate-300">Charges, refunds, webhooks, errors</span></span>
          <span><span className="text-slate-500">Out</span> <span className="text-slate-400">Subscriptions, Connect, Radar</span></span>
        </div>
      </div>
      <div className="w-full h-px bg-white/6" />
      <div>
        <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">Happy Path</p>
        <div className="rounded-lg overflow-hidden border border-white/6 text-xs" style={{ background: '#0A0F1A' }}>
          {[
            { id: 'TC-001', desc: 'Successful card charge', given: 'Visa 4242 4242 4242 4242 · exp 12/30 · CVV 123', when: 'POST /charge {amount: 1000, currency: "usd"}', then: 'HTTP 200 · charge.status = "succeeded" · receipt emailed' },
            { id: 'TC-002', desc: 'Amount captured correctly', given: 'TC-001 completed successfully', when: 'GET /charges/{id}', then: 'amount = 1000 · currency = "usd" · captured = true' },
          ].map(tc => (
            <div key={tc.id} className="px-3 py-2.5 border-b border-white/4 last:border-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-red-400/70 w-10 flex-shrink-0">{tc.id}</span>
                <span className="text-slate-200">{tc.desc}</span>
              </div>
              <div className="pl-12 space-y-0.5 text-slate-500">
                <div><span className="text-slate-600 w-10 inline-block">Given</span> {tc.given}</div>
                <div><span className="text-slate-600 w-10 inline-block">When</span>  {tc.when}</div>
                <div><span className="text-slate-600 w-10 inline-block">Then</span>  <span className="text-slate-300">{tc.then}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">Failure Paths</p>
        <div className="rounded-lg overflow-hidden border border-white/6 text-xs" style={{ background: '#0A0F1A' }}>
          {[
            { id: 'TC-010', desc: 'Card declined', given: 'Card 4000 0000 0000 0002 (always declines)', when: 'POST /charge', then: 'HTTP 402 · error.code = "card_declined"' },
            { id: 'TC-011', desc: 'Insufficient funds', given: 'Card 4000 0000 0000 9995', when: 'POST /charge', then: 'HTTP 402 · error.decline_code = "insufficient_funds"' },
          ].map(tc => (
            <div key={tc.id} className="px-3 py-2.5 border-b border-white/4 last:border-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-red-400/70 w-10 flex-shrink-0">{tc.id}</span>
                <span className="text-slate-200">{tc.desc}</span>
              </div>
              <div className="pl-12 space-y-0.5 text-slate-500">
                <div><span className="text-slate-600 w-10 inline-block">Given</span> {tc.given}</div>
                <div><span className="text-slate-600 w-10 inline-block">When</span>  {tc.when}</div>
                <div><span className="text-slate-600 w-10 inline-block">Then</span>  <span className="text-slate-300">{tc.then}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-slate-600 text-xs pl-1">TC-020–TC-025: Webhooks · TC-030–TC-034: Refunds · [12 more test cases below]</p>
    </div>
  )
}

const outputs: Record<string, React.ReactNode> = {
  developer: <DevOutput />,
  founder: <FounderOutput />,
  ba: <BAOutput />,
  qa: <QAOutput />,
}

function go(roleId: string) {
  window.dispatchEvent(new CustomEvent('devhub:selectRole', { detail: { roleId } }))
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function OutputGallery() {
  const [active, setActive] = useState(tabs[0])

  return (
    <section className="py-28 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-purple-400 tracking-widest uppercase mb-3">Real outputs</p>
          <h2 className="text-4xl font-bold text-slate-50">Not feature bullets. Actual deliverables.</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Every output below is what the hub produces — typed exactly once. No back-and-forth. No cleanup needed.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl border border-white/8" style={{ background: '#0A0F1A' }}>
          {tabs.map(tab => {
            const isActive = tab.id === active.id
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive ? `${tab.color}16` : 'transparent',
                  color: isActive ? tab.color : '#64748B',
                  border: isActive ? `1px solid ${tab.color}35` : '1px solid transparent',
                }}
              >
                <span className="text-base">{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content panel */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: '#0D1117', borderColor: `${active.color}25` }}
        >
          {/* Prompt bar */}
          <div className="px-5 py-3 border-b border-white/6 flex items-start gap-3">
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: active.color }} />
              <span className="text-xs text-slate-500">You asked:</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed" style={{ fontFamily: 'var(--font-geist-mono)', whiteSpace: 'pre-wrap' }}>
              {active.prompt}
            </p>
          </div>

          {/* Output */}
          <div className="relative">
            <div className="p-6 max-h-96 overflow-y-auto gallery-scroll">
              {outputs[active.id]}
            </div>
            {/* Fade overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, #0D1117)' }}
            />
          </div>

          {/* Footer bar */}
          <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{active.emoji}</span>
              <span>{active.agentLabel}</span>
              <span>·</span>
              <span>claude-sonnet-4-6</span>
            </div>
            <button
              onClick={() => go(active.roleId)}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-150"
              style={{
                background: `${active.color}18`,
                color: active.color,
                border: `1px solid ${active.color}35`,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${active.color}28` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${active.color}18` }}
            >
              Try it with your own task →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
