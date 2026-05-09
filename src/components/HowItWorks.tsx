'use client'

import { useState } from 'react'

const journeys = [
  {
    roleId: 'developer',
    emoji: '⚡',
    label: 'Developer',
    color: '#3B82F6',
    story: '9am. Three PRs queued before standup. Drop them into Dev Agent. By the time your coffee\'s ready, you have file-level reviews, a critical SQL injection flagged with a one-line fix, and comments ready to paste into GitHub.',
    steps: [
      { n: '01', title: 'Drop your task', body: 'Paste code, a PR URL, or describe the bug. The Dev Agent reads your codebase conventions before writing a word.' },
      { n: '02', title: 'Agent works', body: 'Reads the code, checks for security issues, cites every issue by file:line. Runs against your coding standards.' },
      { n: '03', title: 'Get the review', body: 'Critical → Warning → Style. Each issue has a fix suggestion. Copy it straight into GitHub — done before standup.' },
    ],
  },
  {
    roleId: 'entrepreneur',
    emoji: '🚀',
    label: 'Founder',
    color: '#F59E0B',
    story: '11:30am. Enterprise prospect emails asking for a proposal. Describe the engagement to Ops Agent. Forty-five seconds later you have a polished, specific, client-ready document. You edit two lines and send it.',
    steps: [
      { n: '01', title: 'Describe the engagement', body: 'Client name, problem, scope, rough pricing. Two sentences is enough to start.' },
      { n: '02', title: 'Ops Agent drafts', body: 'Problem → Solution → Deliverables → Investment → Next step. Structured, professional, and specific to your client.' },
      { n: '03', title: 'Send it', body: 'Edit your two lines. PDF it. Send it. The agent does the structure — you handle the relationship.' },
    ],
  },
  {
    roleId: 'ba',
    emoji: '📊',
    label: 'Business Analyst',
    color: '#10B981',
    story: '2pm. You need a BRD section by 5pm from a messy 90-minute requirements session. Paste the transcript. Get back structured user stories, Given/When/Then acceptance criteria, and a process flow doc. Ready for Jira.',
    steps: [
      { n: '01', title: 'Paste the transcript', body: 'Notes, Slack threads, email chains — whatever you have. The agent finds the requirements buried in the noise.' },
      { n: '02', title: 'BA Agent structures it', body: 'User stories in role/goal/benefit format. Acceptance criteria in Given/When/Then. Scope and out-of-scope explicitly noted.' },
      { n: '03', title: 'Paste into Jira', body: 'Every requirement is specific and independently verifiable. No translation needed — it\'s already in the right shape.' },
    ],
  },
  {
    roleId: 'qa',
    emoji: '🔍',
    label: 'QA Engineer',
    color: '#EF4444',
    story: '4pm Friday. Payment integration goes live Monday. You need a complete test plan by end of day. QA Agent generates the full suite — happy path, webhooks, failure modes, and exact test data — in under a minute.',
    steps: [
      { n: '01', title: 'Describe what ships', body: 'Integration scope, what\'s most critical, what\'s in scope. The QA Agent handles the rest from there.' },
      { n: '02', title: 'QA Agent builds it', body: 'Happy path, error paths, boundary values, edge cases, negative tests. Exact test data included — not placeholders.' },
      { n: '03', title: 'Start testing', body: 'Table format with IDs, preconditions, steps, expected results, pass/fail criteria. Executable immediately.' },
    ],
  },
]

export function HowItWorks() {
  const [active, setActive] = useState(journeys[0])

  return (
    <section className="py-28 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-400 tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-slate-50">How your day changes.</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Pick your role and see how the hub fits into your actual work.
          </p>
        </div>

        {/* Role picker */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {journeys.map(j => {
            const isActive = j.roleId === active.roleId
            return (
              <button
                key={j.roleId}
                onClick={() => setActive(j)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive ? `${j.color}18` : 'transparent',
                  color: isActive ? j.color : '#64748B',
                  border: `1px solid ${isActive ? `${j.color}40` : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <span>{j.emoji}</span>
                {j.label}
              </button>
            )
          })}
        </div>

        {/* Story block */}
        <div
          className="rounded-2xl border p-7 mb-10 transition-all duration-300"
          style={{ background: '#0D1117', borderColor: `${active.color}30` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
              style={{ background: `${active.color}18`, border: `1px solid ${active.color}35` }}
            >
              {active.emoji}
            </div>
            <p className="text-slate-300 leading-relaxed text-[0.97rem]">{active.story}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-0 items-start">
          {active.steps.map((step, i) => (
            <div key={step.n} className="flex flex-col lg:flex-row items-start lg:items-center flex-1">
              <div
                className="relative flex-1 rounded-xl border p-6 text-center transition-all duration-300"
                style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mx-auto mb-4"
                  style={{ background: `${active.color}15`, color: active.color, border: `1px solid ${active.color}30` }}
                >
                  {step.n}
                </div>
                <h3 className="font-semibold text-slate-100 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.body}</p>
              </div>

              {i < active.steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center w-14 flex-shrink-0">
                  <div className="relative w-10 h-px bg-white/10">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full flow-dot"
                      style={{ background: active.color }}
                    />
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2" width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M0 4H7M7 4L4 1M7 4L4 7" stroke={active.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
