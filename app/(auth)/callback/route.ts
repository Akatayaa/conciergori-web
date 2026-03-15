import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: Supabase auth callback — exchange code for session
  const tenantSlug = process.env.TENANT_SLUG || 'conciergori'
  return NextResponse.redirect(new URL(`/${tenantSlug}/dashboard`, req.url))
}
