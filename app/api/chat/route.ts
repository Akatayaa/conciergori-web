import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, tenantId } = await req.json()
  // TODO: Appel LLM avec contexte tenant (biens, FAQ, règles...)
  return NextResponse.json({ reply: `Echo [${tenantId}]: ${message}` })
}
