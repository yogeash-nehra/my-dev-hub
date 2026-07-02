'use client'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-28 grid-bg overflow-hidden">
      {/* Glow blobs */}
      <div
        className="hero-glow absolute pointer-events-none"
        style={{
          top: '10%', right: '5%', width: 500, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="hero-glow absolute pointer-events-none"
        style={{
          bottom: '15%', left: '0%', width: 400, height: 300,
          background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.14) 0%, transparent 70%)',
          animationDelay: '3s',
        }}
      />

      {/* Badge */}
      <div className="relative mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        The AI digest for developers
      </div>

      {/* Headline */}
      <h1 className="relative text-center font-bold tracking-tight leading-[1.08]" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
        <span className="text-slate-50">Signal, not</span>
        <br />
        <span className="gradient-text">noise.</span>
      </h1>

      {/* Sub copy */}
      <p className="relative mt-6 text-center text-slate-400 max-w-xl leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)' }}>
        A daily-curated AI digest built for developers — filtered from 30+ primary sources
        against a published quality rubric, zero fluff. Then build your own agent
        workflows and lean on a dev agent for review, debugging, and test generation.
      </p>

      {/* CTAs */}
      <div className="relative mt-10 flex flex-wrap gap-4 justify-center">
        <a
          href="/digest"
          className="px-7 py-3 rounded-lg font-semibold text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
            boxShadow: '0 0 24px -4px rgba(124,58,237,0.5)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px -4px rgba(124,58,237,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px -4px rgba(124,58,237,0.5)')}
        >
          Read today's digest →
        </a>
        <a
          href="https://github.com/yogeash-nehra/my-dev-hub"
          target="_blank"
          rel="noopener noreferrer"
          className="px-7 py-3 rounded-lg font-semibold text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        >
          GitHub ↗
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 flex flex-col items-center gap-1.5 text-slate-500 text-xs">
        <span className="tracking-widest uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.12em' }}>scroll to explore</span>
        <svg
          className="animate-bounce"
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ color: 'rgba(148,163,184,0.6)' }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
