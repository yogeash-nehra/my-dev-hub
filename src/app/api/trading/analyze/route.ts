import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  const { ticker, date, provider, model } = await req.json();

  if (!ticker || !date) {
    return new Response(JSON.stringify({ error: 'Ticker and date are required' }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const pythonScript = path.join(process.cwd(), 'src/lib/trading_bridge.py');

  const stream = new ReadableStream({
    start(controller) {
      const pythonProcess = spawn('python3', [
        pythonScript,
        ticker,
        date,
        provider || 'openai',
        model || 'gpt-4o',
      ]);

      pythonProcess.stdout.on('data', (data) => {
        // Data might contain multiple lines or partial lines
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            controller.enqueue(encoder.encode(line + '\n'));
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'log', content: data.toString() }) + '\n'));
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', content: `Process exited with code ${code}` }) + '\n'));
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
