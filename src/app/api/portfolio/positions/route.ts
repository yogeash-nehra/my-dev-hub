import { NextRequest } from 'next/server'
import { put, list } from '@vercel/blob'

const BLOB_PATH = 'portfolio/positions.json'
const BLOB_TOKEN = process.env['BLOB2_READ_WRITE_TOKEN'] ?? process.env['BLOB_READ_WRITE_TOKEN']

interface Position {
  id: string
  ticker: string
  shares: number
  avgCost: number
  addedDate: string
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1, token: BLOB_TOKEN })
    if (!blobs.length) return Response.json({ positions: [], source: 'blob' })

    const res = await fetch(blobs[0].url)
    if (!res.ok) return Response.json({ positions: [], source: 'blob' })

    const positions = await res.json() as Position[]
    return Response.json({ positions, source: 'blob' })
  } catch (err) {
    // Blob not configured — client falls back to localStorage
    console.error('Blob load failed:', err)
    return Response.json({ positions: null, source: 'error', error: 'Blob not configured' })
  }
}

export async function PUT(req: NextRequest) {
  const { positions } = await req.json()
  if (!Array.isArray(positions)) {
    return Response.json({ error: 'positions must be an array' }, { status: 400 })
  }
  try {
    await put(BLOB_PATH, JSON.stringify(positions), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      token: BLOB_TOKEN,
    })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Blob save failed:', err)
    return Response.json({ error: 'Blob not configured' }, { status: 500 })
  }
}
