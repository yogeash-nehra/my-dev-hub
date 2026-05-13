import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { CookieBanner } from '@/components/CookieBanner'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dev Hub — AI that actually does the work',
  description: 'A multi-agent AI workspace for developers, founders, analysts, and everyone in between. Pick your role. Get real outputs in seconds.',
  openGraph: {
    title: 'Dev Hub — AI that actually does the work',
    description: 'Pick your role. Get real AI-produced outputs in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav
          style={{
            height: 48,
            background: 'rgba(8,13,20,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 24,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#F1F5F9',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>⚡</span>
            Dev Hub
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <Link
            href="/flow"
            style={{
              fontSize: 13,
              color: '#64748B',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 0.15s',
            }}
            onMouseEnter={undefined}
          >
            <span style={{ fontSize: 14 }}>◈</span>
            Flow Builder
          </Link>
          <Link
            href="/digest"
            style={{
              fontSize: 13,
              color: '#64748B',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>📡</span>
            AI Digest
          </Link>
        </nav>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
