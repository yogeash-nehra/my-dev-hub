'use client'

const scenarios = [
  {
    id: 'code-review',
    emoji: '⚡',
    label: 'Code Review',
    color: '#3B82F6',
    time: '9:03 AM',
    situation: 'Three PRs waiting before standup.',
    action: 'Dev Agent reviews all three — finds the SQL injection in PR #2, gives file:line citations and a one-line fix.',
    metric: '~18s',
    metricLabel: 'per PR reviewed',
  },
  {
    id: 'digest',
    emoji: '📡',
    label: 'Morning Digest',
    color: '#F59E0B',
    time: '8:00 AM',
    situation: 'Coffee\'s not even done brewing.',
    action: 'The digest scans 30+ primary sources overnight and lands in your repo — model releases, API changes, research that matters. Zero fluff.',
    metric: '2 min',
    metricLabel: 'to read the whole thing',
    href: '/digest',
  },
  {
    id: 'workflow',
    emoji: '◈',
    label: 'Flow Builder',
    color: '#10B981',
    time: '11:30 AM',
    situation: 'Same multi-step task, third time this week.',
    action: 'Chain skills into a saved workflow in the Flow Builder — input, agents, output. Run it again in one click next time.',
    metric: '1 build',
    metricLabel: 'reused indefinitely',
    href: '/flow',
  },
  {
    id: 'debug',
    emoji: '🔍',
    label: 'Debugging',
    color: '#EF4444',
    time: '4:15 PM',
    situation: 'Cryptic stack trace, prod is on fire.',
    action: 'Dev Agent identifies the root cause first, then hands you the minimal exact fix — not a guess-and-check loop.',
    metric: '30s',
    metricLabel: 'to root cause',
  },
]

function go(href?: string) {
  if (href) {
    window.location.href = href
    return
  }
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
            Real situations. Real outputs. Click any scenario to try it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.href)}
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
