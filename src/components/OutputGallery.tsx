'use client'

const active = {
  id: 'developer',
  emoji: '⚡',
  label: 'Developer',
  color: '#3B82F6',
  agentLabel: 'Dev Agent',
  prompt: 'Review this for bugs, edge cases, and security issues:\n\nasync function getUser(id) {\n  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`)\n  return user.rows[0]\n}',
}

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

function go() {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function OutputGallery() {
  return (
    <section className="py-28 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-purple-400 tracking-widest uppercase mb-3">Real outputs</p>
          <h2 className="text-4xl font-bold text-slate-50">Not feature bullets. An actual deliverable.</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            This is what the Dev Agent produces — typed exactly once. No back-and-forth. No cleanup needed.
          </p>
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
              <DevOutput />
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
              onClick={go}
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
