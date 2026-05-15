import { Hero } from '@/components/Hero'
import { ScenarioStrip } from '@/components/ScenarioStrip'
import { RoleDemo } from '@/components/RoleDemo'
import { OutputGallery } from '@/components/OutputGallery'
import { HowItWorks } from '@/components/HowItWorks'
import { AutomationStrip } from '@/components/AutomationStrip'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#030712' }}>
      <Hero />
      <ScenarioStrip />

      {/* Trading Section */}
      <section className="py-24 px-6 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs font-medium text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              New: Financial Agents
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-50 leading-tight">
              Trade with a <span className="gradient-text">multi-agent firm.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Deploy a specialized team of LLM agents: Fundamental Analysts, Sentiment Experts,
              Technical Analysts, and Risk Managers. They debate, refine, and decide on trades
              based on real-time market data.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/trading"
                className="px-6 py-2.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
              >
                Launch Trading Desk →
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="space-y-4 font-mono text-xs">
              <div className="flex gap-3 text-blue-400">
                <span>[System]</span>
                <span>Spawning Analyst Team...</span>
              </div>
              <div className="flex gap-3 text-slate-300">
                <span className="text-emerald-400">[Analyst]</span>
                <span>NVDA Technicals: RSI 62, MACD Crossover bullish.</span>
              </div>
              <div className="flex gap-3 text-slate-300">
                <span className="text-amber-400">[Sentiment]</span>
                <span>News flow is 85% positive on Blackwell demand.</span>
              </div>
              <div className="flex gap-3 text-slate-300">
                <span className="text-red-400">[Bearish]</span>
                <span>Wait—valuation at 42x forward P/E is historically high.</span>
              </div>
              <div className="flex gap-3 text-slate-500 animate-pulse">
                <span>_</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RoleDemo />
      <OutputGallery />
      <HowItWorks />
      <AutomationStrip />
      <Footer />
    </main>
  )
}
