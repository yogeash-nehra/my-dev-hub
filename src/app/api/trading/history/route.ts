import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET(req: NextRequest) {
  const memoryPath = process.env.TRADINGAGENTS_MEMORY_LOG_PATH ||
                     path.join(os.homedir(), '.tradingagents', 'memory', 'trading_memory.md');

  if (!fs.existsSync(memoryPath)) {
    return new Response(JSON.stringify({ history: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const content = fs.readFileSync(memoryPath, 'utf-8');
    // Basic parsing of the markdown table
    // Header format: | Ticker | Date | Decision | Raw Return | Alpha vs Benchmark | Holding Days | Reflection |
    const lines = content.split('\n').filter(line => line.startsWith('|') && !line.includes('---'));

    // Skip header
    const dataLines = lines.slice(1);

    const history = dataLines.map(line => {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length < 3) return null;
      return {
        ticker: parts[0] || 'Unknown',
        date: parts[1] || 'Unknown',
        decision: parts[2] || 'NONE',
        rawReturn: parts[3] || 'N/A',
        alpha: parts[4] || 'N/A',
        holdingDays: parts[5] || '0',
        reflection: parts[6] || '',
      };
    }).filter(Boolean);

    return new Response(JSON.stringify({ history }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read history' }), { status: 500 });
  }
}
