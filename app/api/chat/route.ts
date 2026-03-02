import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // TODO: Connect to AI agent (OpenAI / Anthropic)
  const { message } = await req.json()
  return NextResponse.json({ reply: `Echo: ${message}` })
}
