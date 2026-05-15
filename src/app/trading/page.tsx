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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Trading Agent Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Run Analysis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ticker</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LLM Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                  placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Analysis Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
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

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Trade History</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {history.length === 0 && <p className="text-gray-400">No history yet.</p>}
              {history.map((item, idx) => (
                <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
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
          <div className="bg-black border border-gray-700 rounded-xl flex flex-col h-[700px]">
            <div className="bg-gray-800 px-4 py-2 rounded-t-xl border-b border-gray-700 flex justify-between items-center">
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
