const features = [
  {
    icon: '⚡',
    name: 'Dev Agent',
    description: 'Specialist for all code work. Reads before it edits. Tests after it changes.',
    bullets: ['Code review with file:line citations', 'Debug root cause analysis', 'Test generation & scaffolding'],
    color: '#3B82F6',
  },
  {
    icon: '🔬',
    name: 'Research Agent',
    description: 'Deep information work. Reads primary sources, never fabricates citations.',
    bullets: ['Tech evaluation & comparison', 'Competitive landscape analysis', 'arXiv & GitHub release monitoring'],
    color: '#8B5CF6',
  },
  {
    icon: '✍️',
    name: 'Ops Agent',
    description: 'Professional business writing. Direct, polished, draft-first always.',
    bullets: ['Client proposals & invoices', 'Email drafting & status reports', 'Meeting notes & action items'],
    color: '#10B981',
  },
  {
    icon: '📡',
    name: 'AI News Digest',
    description: 'Daily scan of real AI developer news. Quality-gated. Zero fluff.',
    bullets: ['Tier-1 sources only (labs, GitHub)', 'Scoring rubric filters noise', 'Auto-committed to your repo daily'],
    color: '#F59E0B',
  },
  {
    icon: '🔄',
    name: 'Workflows',
    description: 'Multi-step recipes that orchestrate agents in parallel and sequence.',
    bullets: ['Daily brief & weekly digest', 'PR review & new project scaffold', 'Client proposal pipeline'],
    color: '#EC4899',
  },
  {
    icon: '🧠',
    name: 'Memory System',
    description: 'Persistent context that builds across sessions. Agents remember what matters.',
    bullets: ['User profile & preferences', 'Active project context', 'Feedback & learned conventions'],
    color: '#06B6D4',
  },
]

export function Features() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-purple-400 tracking-widest uppercase mb-3">Under the hood</p>
          <h2 className="text-4xl font-bold text-slate-50">Powered by specialized agents</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Each agent is purpose-built with its own system prompt, tools, and output standards.
            They collaborate — you get finished work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div
              key={f.name}
              className="gradient-border rounded-xl p-6 bg-surface transition-all duration-200 group"
              style={{ background: '#0D1117' }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 transition-all duration-200"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{f.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{f.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {f.bullets.map(b => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: f.color }} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
