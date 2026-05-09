'use client'

import { useEffect, useState } from 'react'

const roles = [
  'developers',
  'founders',
  'business analysts',
  'QA engineers',
  'IT teams',
  'social creators',
  'architects',
]

export function Hero() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % roles.length)
        setVisible(true)
      }, 300)
    }, 2200)
    return () => clearInterval(id)
  }, [])

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
        Multi-agent AI workspace
      </div>

      {/* Headline */}
      <h1 className="relative text-center font-bold tracking-tight leading-[1.08]" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
        <span className="text-slate-50">AI that actually</span>
        <br />
        <span className="gradient-text">does the work.</span>
      </h1>

      {/* Cycling role */}
      <p className="relative mt-6 text-center text-slate-400" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)' }}>
        For{' '}
        <span
          className="font-semibold text-slate-200"
          style={{
            display: 'inline-block',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-8px)',
          }}
        >
          {roles[index]}.
        </span>
      </p>

      {/* Sub copy */}
      <p className="relative mt-4 text-center text-slate-500 max-w-xl leading-relaxed" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)' }}>
        Skip the back-and-forth. Describe what you need — code review, test plan, proposal,
        research brief — and specialized agents deliver a finished output in seconds.
      </p>

      {/* CTAs */}
      <div className="relative mt-10 flex flex-wrap gap-4 justify-center">
        <a
          href="#demo"
          className="px-7 py-3 rounded-lg font-semibold text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
            boxShadow: '0 0 24px -4px rgba(124,58,237,0.5)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 32px -4px rgba(124,58,237,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px -4px rgba(124,58,237,0.5)')}
        >
          Try it free →
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
