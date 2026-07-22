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
      className="flex items-center gap-3 rounded-xl border px-5 py-4 mb-8 transition-all duration-150"
      style={{ borderColor: 'rgba(5,150,105,0.30)', background: 'rgba(5,150,105,0.06)', textDecoration: 'none' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
      <span className="text-sm font-medium" style={{ color: '#1C1A17' }}>Continue your workflow</span>
      <span className="text-sm ml-auto" style={{ color: '#059669' }}>→</span>
    </a>
  )
}
