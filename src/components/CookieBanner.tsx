'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const CLARITY_ID = 'wqnx26dkgw'
const STORAGE_KEY = 'cookie_consent'

type Status = 'loading' | 'pending' | 'accepted' | 'declined'

export function CookieBanner() {
  const [status, setStatus] = useState<Status>('loading')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'accepted') setStatus('accepted')
    else if (saved === 'declined') setStatus('declined')
    else setStatus('pending')
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setStatus('accepted')
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
    setTimeout(() => setStatus('declined'), 300)
  }

  return (
    <>
      {/* Load Clarity only after consent */}
      {status === 'accepted' && (
        <Script id="clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `}</Script>
      )}

      {/* Banner — only when pending */}
      {status === 'pending' && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9000,
            padding: '0 24px 20px',
            pointerEvents: 'none',
            transform: visible ? 'translateY(0)' : 'translateY(110%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            style={{
              maxWidth: 780,
              margin: '0 auto',
              background: 'rgba(13, 17, 23, 0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              pointerEvents: 'all',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🍪
            </div>

            {/* Copy */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>
                om nom nom.{' '}
              </span>
              <span style={{ fontSize: 13, color: '#475569' }}>
                we eat cookies because cookie good. that&apos;s literally it.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <button
                onClick={decline}
                style={{
                  padding: '7px 14px',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 8,
                  color: '#475569',
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.color = '#94A3B8'
                  el.style.borderColor = 'rgba(255,255,255,0.18)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.color = '#475569'
                  el.style.borderColor = 'rgba(255,255,255,0.09)'
                }}
              >
                i&apos;m on a diet
              </button>
              <button
                onClick={accept}
                style={{
                  padding: '7px 16px',
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 12px rgba(124,58,237,0.3)',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                have one from me 🍪
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
