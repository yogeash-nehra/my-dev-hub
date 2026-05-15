import { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'

const KV_KEY = 'portfolio:positions'

interface Position {
  id: string
  ticker: string
  shares: number
  avgCost: number
  addedDate: string
}

export async function GET() {
  try {
    const positions = await kv.get<Position[]>(KV_KEY)
    return Response.json({ positions: positions ?? [], source: 'kv' })
  } catch (err) {
    // KV not configured — client will fall back to localStorage
    console.error('KV load failed:', err)
    return Response.json({ positions: null, source: 'error', error: 'KV not configured' })
  }
}

export async function PUT(req: NextRequest) {
  const { positions } = await req.json()
  if (!Array.isArray(positions)) {
    return Response.json({ error: 'positions must be an array' }, { status: 400 })
  }
  try {
    await kv.set(KV_KEY, positions)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('KV save failed:', err)
    return Response.json({ error: 'KV not configured' }, { status: 500 })
  }
}
