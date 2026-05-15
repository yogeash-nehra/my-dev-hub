'use client'

import { useState, useEffect, useRef } from 'react'

export default function TradingDashboard() {
  const [ticker, setTicker] = useState('NVDA')
  const [date, setDate] = useState('2025-01-15')
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('gpt-4o')
  const [logs, setLogs] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/trading/history')
      const data = await res.json()
      if (data.history) {
        setHistory(data.history)
      }
    } catch (err) {
      console.error('Failed to fetch history', err)
    }
  }

  const startAnalysis = async () => {
    setLogs([])
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/trading/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, date, provider, model }),
      })

      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(Boolean)

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            setLogs(prev => [...prev, parsed])
          } catch {
            setLogs(prev => [...prev, { type: 'log', content: line }])
          }
        }
      }
    } catch (err) {
      setLogs(prev => [...prev, { type: 'error', content: String(err) }])
    } finally {
      setIsAnalyzing(false)
      fetchHistory()
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      {/* Explainer Section */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4 gradient-text">Trading Agent Firm</h1>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              This dashboard implements the <strong>TradingAgents</strong> framework—a multi-agent LLM financial system
              that mirrors a professional trading desk. Instead of a single prompt, your request triggers
              a collaborative workflow between specialized AI workers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <h3 className="text-blue-400 font-bold mb-1">Analyst Team</h3>
                <p className="text-xs text-slate-500">Fundamentals, Technicals, Sentiment, and News analysts pull real-time data from Alpha Vantage and YFinance.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <h3 className="text-emerald-400 font-bold mb-1">Researcher Debate</h3>
                <p className="text-xs text-slate-500">Bullish and Bearish researchers debate the analyst findings to surface hidden risks and opportunities.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <h3 className="text-amber-400 font-bold mb-1">Risk Management</h3>
                <p className="text-xs text-slate-500">Final proposals are vetted by a risk desk to ensure strategy alignment and portfolio safety.</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                <h3 className="text-purple-400 font-bold mb-1">Memory & Persistence</h3>
                <p className="text-xs text-slate-500">Agents remember past performance, reflecting on previous wins and losses to improve future decisions.</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Setup Instructions</h2>
            <div className="space-y-4 text-xs text-slate-300">
              <p>
                <strong className="text-white block mb-1">1. LLM Keys</strong>
                The system uses your existing <code className="text-blue-300">OPENAI_API_KEY</code> or <code className="text-blue-300">ANTHROPIC_API_KEY</code>.
              </p>
              <p>
                <strong className="text-white block mb-1">2. Market Data</strong>
                Set <code className="text-blue-300">ALPHA_VANTAGE_API_KEY</code> in your environment for high-quality data. Get a free key at <a href="https://www.alphavantage.co/support/#api-key" target="_blank" className="underline">alphavantage.co</a>.
              </p>
              <p>
                <strong className="text-white block mb-1">3. Backtesting</strong>
                To test performance, pick a date in the past. The agents will only see data available <em>up to that date</em>.
              </p>
              <p>
                <strong className="text-white block mb-1">4. Performance</strong>
                Check the <strong>Trade History</strong> after a few days to see the "Alpha vs SPY" outcome once real-world price data is settled.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#080D14] border border-white/5 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Run Analysis</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="ticker" className="block text-sm font-medium mb-1">Ticker</label>
                <input
                  type="text"
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full bg-[#030712] border border-white/10 rounded px-3 py-2 focus:border-blue-500/50 outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="provider" className="block text-sm font-medium mb-1">LLM Provider</label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 rounded px-3 py-2 focus:border-blue-500/50 outline-none transition"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 rounded px-3 py-2 focus:border-blue-500/50 outline-none transition"
                  placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">Analysis Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 rounded px-3 py-2 focus:border-blue-500/50 outline-none transition"
                />
              </div>
              <button
                onClick={startAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-2 rounded font-bold transition ${
                  isAnalyzing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Agent Analysis'}
              </button>
            </div>
          </div>

          <div className="bg-[#080D14] border border-white/5 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Trade History</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {history.length === 0 && <p className="text-gray-400">No history yet.</p>}
              {history.map((item, idx) => (
                <div key={idx} className="bg-gray-800/50 border border-white/5 p-3 rounded text-sm">
                  <div className="flex justify-between font-bold">
                    <span>{item.ticker}</span>
                    <span className={item.decision.includes('BUY') ? 'text-green-400' : 'text-red-400'}>
                      {item.decision}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{item.date}</div>
                  {item.rawReturn && (
                    <div className="mt-1 flex justify-between">
                      <span>Return: {item.rawReturn}</span>
                      <span className="text-blue-300">Alpha: {item.alpha}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main - Live Terminal */}
        <div className="lg:col-span-2">
          <div className="bg-black border border-white/10 rounded-xl flex flex-col h-[700px] shadow-2xl">
            <div className="bg-[#080D14] px-4 py-2 rounded-t-xl border-b border-white/10 flex justify-between items-center">
              <span className="font-mono text-sm text-gray-300">Agent Terminal</span>
              {isAnalyzing && (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2">
              {logs.length === 0 && !isAnalyzing && (
                <p className="text-gray-600 italic">Ready for input...</p>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className={`
                  ${log.type === 'status' ? 'text-blue-400' : ''}
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'result' ? 'text-green-400 font-bold' : ''}
                  ${log.type === 'log' ? 'text-gray-300' : ''}
                `}>
                  {log.type === 'log' ? (
                    <pre className="whitespace-pre-wrap">{log.content}</pre>
                  ) : (
                    <div>{typeof log.content === 'string' ? log.content : JSON.stringify(log)}</div>
                  )}
                  {log.type === 'result' && (
                    <div className="mt-4 p-4 border border-green-800 bg-green-900/20 rounded">
                      <div>DECISION: {log.decision}</div>
                      <div className="text-xs text-gray-400 mt-2">Log path: {log.final_state_path}</div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
