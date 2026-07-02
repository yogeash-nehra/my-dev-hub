const tiles = [
  {
    icon: '📡',
    color: '#F59E0B',
    title: 'Daily AI Digest',
    when: 'Every morning at 8am',
    description: 'Scans 40+ tier-1 AI sources overnight. Quality-gated against a rubric. Committed to your repo before breakfast — zero effort, zero noise.',
    cta: { label: 'Read today\'s digest', href: '/digest' },
  },
  {
    icon: '🧠',
    color: '#8B5CF6',
    title: 'Persistent Memory',
    when: 'Builds across every session',
    description: 'Agents remember your stack, conventions, active projects, and preferences. Every new session picks up exactly where the last one left off.',
    cta: null,
  },
  {
    icon: '🔄',
    color: '#10B981',
    title: 'Scheduled Workflows',
    when: 'Set once, runs forever',
    description: 'Daily briefs, weekly digests, multi-agent pipelines — schedule once and they run in Anthropic\'s cloud while you focus on what only you can do.',
    cta: { label: 'Build a workflow', href: '/flow' },
  },
]

export function AutomationStrip() {
  return (
    <section className="py-28 px-6 border-t border-white/5 grid-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase mb-3">Always on</p>
          <h2 className="text-4xl font-bold text-slate-50">Runs while you focus.</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            Three things that keep working in the background every day, without you touching them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiles.map(tile => (
            <div
              key={tile.title}
              className="rounded-2xl border p-7 flex flex-col"
              style={{ background: '#0D1117', borderColor: `${tile.color}25` }}
            >
              {/* Icon + live indicator */}
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${tile.color}15`, border: `1px solid ${tile.color}30` }}
                >
                  {tile.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: tile.color, animation: 'live-pulse 2.4s ease-in-out infinite' }}
                  />
                  <span className="text-xs text-slate-500">{tile.when}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-slate-100 text-lg mb-2">{tile.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">{tile.description}</p>

              {/* CTA */}
              {tile.cta && (
                <a
                  href={tile.cta.href}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-150 group"
                  style={{ color: tile.color }}
                >
                  {tile.cta.label}
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Bottom stat strip */}
        <div className="mt-14 flex flex-wrap justify-center gap-x-12 gap-y-4">
          {[
            { value: '40+', label: 'sources scanned daily' },
            { value: '5+', label: 'orchestrated workflows' },
            { value: '< 30s', label: 'to a finished output' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
