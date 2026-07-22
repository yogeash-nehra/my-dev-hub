import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'
import { CookieBanner } from '@/components/CookieBanner'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dev Hub — Signal, not noise. Built for developers.',
  description: 'A daily-curated AI digest for developers, plus a visual workflow builder, a dev agent, and real reusable agent/workflow resources. Filtered from 30+ primary sources against a published quality rubric. Zero fluff.',
  openGraph: {
    title: 'Dev Hub — Signal, not noise. Built for developers.',
    description: 'Daily-curated AI signal, filtered from 30+ sources. Build your own agent workflows on top of it.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav
          style={{
            height: 48,
            background: 'rgba(250,249,246,0.85)',
            borderBottom: '1px solid rgba(30,27,22,0.09)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 24,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#1C1A17',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="3.5" width="14" height="1.7" rx="0.85" fill="#7C3AED" />
              <rect x="1" y="10.8" width="9" height="1.7" rx="0.85" fill="#2563EB" />
            </svg>
            Dev Hub
          </Link>
          <div style={{ width: 1, height: 20, background: 'rgba(30,27,22,0.10)' }} />
          <Link
            href="/digest"
            style={{
              fontSize: 13,
              color: '#57534E',
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
          <Link
            href="/flow"
            style={{
              fontSize: 13,
              color: '#57534E',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>◈</span>
            Flow Builder
          </Link>
          <Link
            href="/resources"
            style={{
              fontSize: 13,
              color: '#57534E',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>📚</span>
            Resources
          </Link>
          <Link
            href="/skills"
            style={{
              fontSize: 13,
              color: '#57534E',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>⚡</span>
            Skills
          </Link>
        </nav>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  )
}
