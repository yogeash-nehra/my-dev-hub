const steps = [
  {
    number: '01',
    title: 'You bring a task',
    description: 'Pick your role and describe what you need — or choose from curated examples tuned for your field.',
    icon: '🎯',
  },
  {
    number: '02',
    title: 'Agents collaborate',
    description: 'Specialized agents spin up in parallel or sequence depending on the task. Each reads, reasons, and writes.',
    icon: '🤝',
  },
  {
    number: '03',
    title: 'You get a deliverable',
    description: 'Not a chat reply — a finished output. Proposal, test plan, code review, research brief. Ready to use.',
    icon: '✅',
  },
]

export function HowItWorks() {
  return (
    <section className="py-28 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-400 tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-slate-50">Three steps to a finished output.</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">
            No prompt engineering. No chain of thought wrangling. Pick your role, describe the task, get the deliverable.
          </p>
        </div>

        {/* Steps with connector */}
        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-0 items-start">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col lg:flex-row items-start lg:items-center flex-1">
              {/* Step card */}
              <div className="relative flex-1 rounded-xl border border-white/8 p-7 bg-surface text-center"
                style={{ background: '#0D1117' }}>
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="text-xs font-mono text-purple-500 mb-2 tracking-widest">{step.number}</div>
                <h3 className="font-semibold text-slate-100 text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>

              {/* Connector (between cards, not after last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center w-16 flex-shrink-0">
                  <div className="relative w-12 h-px bg-white/10">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500 flow-dot"
                      style={{ position: 'absolute' }}
                    />
                    <svg className="absolute right-0 top-1/2 -translate-y-1/2" width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M0 4H7M7 4L4 1M7 4L4 7" stroke="#6D28D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '7', label: 'Specialized roles' },
            { value: '4', label: 'AI agents' },
            { value: '5+', label: 'Workflows' },
            { value: '<30s', label: 'Time to output' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
