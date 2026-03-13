import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })
  const { data, error } = await sb.from('cleaners').select('*').eq('tenant_id', tenantId).eq('active', true).order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { tenant_id, name, email, phone } = await req.json()
  if (!tenant_id || !name) return NextResponse.json({ error: 'tenant_id and name required' }, { status: 400 })
  const { data, error } = await sb.from('cleaners').insert({ tenant_id, name, email, phone }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
