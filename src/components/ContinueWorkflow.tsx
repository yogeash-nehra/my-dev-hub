'use client'

import { useEffect, useState } from 'react'

export function ContinueWorkflow() {
  const [hasSavedFlow, setHasSavedFlow] = useState(false)

  useEffect(() => {
    setHasSavedFlow(!!localStorage.getItem('flow-nodes'))
  }, [])

  if (!hasSavedFlow) return null

  return (
    <a
      href="/flow"
      className="flex items-center gap-3 rounded-xl border px-5 py-4 mb-8 transition-all duration-150 hover:border-white/20"
      style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)', textDecoration: 'none' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
      <span className="text-sm text-slate-200 font-medium">Continue your workflow</span>
      <span className="text-sm text-emerald-400 ml-auto">→</span>
    </a>
  )
}
