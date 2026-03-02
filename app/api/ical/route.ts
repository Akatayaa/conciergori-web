import { NextRequest, NextResponse } from 'next/server'
import { parseIcalUrl } from '@/lib/ical'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  const events = await parseIcalUrl(url)
  return NextResponse.json({ events })
}
