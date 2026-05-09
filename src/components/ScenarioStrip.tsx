'use client'

const scenarios = [
  {
    roleId: 'developer',
    emoji: '⚡',
    label: 'Developer',
    color: '#3B82F6',
    time: '9:03 AM',
    situation: 'Three PRs waiting before standup.',
    action: 'Dev Agent reviews all three — finds the SQL injection in PR #2, gives file:line citations and a one-line fix.',
    metric: '~18s',
    metricLabel: 'per PR reviewed',
  },
  {
    roleId: 'entrepreneur',
    emoji: '🚀',
    label: 'Founder',
    color: '#F59E0B',
    time: '11:30 AM',
    situation: 'New enterprise prospect just emailed.',
    action: 'Ops Agent drafts a tailored proposal — problem, solution, pricing table, and next steps. You edit two lines and send.',
    metric: '45s',
    metricLabel: 'to a sendable proposal',
  },
  {
    roleId: 'ba',
    emoji: '📊',
    label: 'Business Analyst',
    color: '#10B981',
    time: '2:00 PM',
    situation: 'Requirements meeting transcript just dropped.',
    action: 'BA Agent turns raw transcript into structured user stories, Given/When/Then acceptance criteria, and a process flow doc.',
    metric: '90s',
    metricLabel: 'from transcript to BRD',
  },
  {
    roleId: 'qa',
    emoji: '🔍',
    label: 'QA Engineer',
    color: '#EF4444',
    time: '4:15 PM',
    situation: 'Payment integration ships Friday.',
    action: 'QA Agent generates the complete test plan — happy path, webhooks, edge cases, exact test data. Executable immediately.',
    metric: '30s',
    metricLabel: 'to a full test plan',
  },
]

function go(roleId: string) {
  window.dispatchEvent(new CustomEvent('devhub:selectRole', { detail: { roleId } }))
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function ScenarioStrip() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-400 tracking-widest uppercase mb-3">Use cases</p>
          <h2 className="text-4xl font-bold text-slate-50">A day with the hub.</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Real situations. Real outputs. Click any scenario to run it with your own task.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <button
              key={s.roleId}
              onClick={() => go(s.roleId)}
              className="group text-left rounded-2xl border p-6 transition-all duration-200 cursor-pointer"
              style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.08)' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${s.color}55`
                e.currentTarget.style.boxShadow = `0 0 40px -10px ${s.color}28`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}
                  >
                    {s.emoji}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-white/8 text-slate-500">
                  {s.time}
                </span>
              </div>

              <p className="text-slate-100 font-semibold leading-snug mb-2">{s.situation}</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{s.action}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.metric}</span>
                  <span className="text-xs text-slate-500">{s.metricLabel}</span>
                </div>
                <span
                  className="text-xs font-medium transition-all duration-150 group-hover:translate-x-0.5"
                  style={{ color: s.color }}
                >
                  Try this →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
