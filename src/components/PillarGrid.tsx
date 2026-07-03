const PILLARS = [
  {
    icon: '📡',
    color: '#F59E0B',
    title: 'AI Digest',
    description: 'Scanned overnight from 30+ primary sources, quality-gated against a rubric. Zero fluff.',
    href: '/digest',
    cta: 'Read today\'s digest',
  },
  {
    icon: '◈',
    color: '#10B981',
    title: 'Flow Builder',
    description: 'Chain skills into a saved workflow — input, agents, output. Build once, run again in one click.',
    href: '/flow',
    cta: 'Open Flow Builder',
  },
  {
    icon: '📚',
    color: '#3B82F6',
    title: 'Resources',
    description: 'The real agent system prompts, workflow docs, and prompt templates this hub runs on.',
    href: '/resources',
    cta: 'Browse resources',
  },
  {
    icon: '⚡',
    color: '#8B5CF6',
    title: 'Skills',
    description: 'A gallery of reusable Claude skills — browse, copy, or generate one for your own task.',
    href: '/skills',
    cta: 'Browse skills',
  },
]

export function PillarGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {PILLARS.map(pillar => (
        <a
          key={pillar.title}
          href={pillar.href}
          className="group rounded-2xl border p-6 flex flex-col transition-all duration-200"
          style={{ background: '#0D1117', borderColor: `${pillar.color}25`, textDecoration: 'none' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
            style={{ background: `${pillar.color}15`, border: `1px solid ${pillar.color}30` }}
          >
            {pillar.icon}
          </div>
          <h3 className="font-semibold text-slate-100 text-lg mb-2">{pillar.title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed flex-1">{pillar.description}</p>
          <span
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-150 group-hover:translate-x-0.5"
            style={{ color: pillar.color }}
          >
            {pillar.cta} →
          </span>
        </a>
      ))}
    </div>
  )
}
