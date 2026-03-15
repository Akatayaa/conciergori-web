import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: Supabase auth callback — exchange code for session
  return NextResponse.redirect(new URL('/conciergori/dashboard', req.url))
}
