import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id')
  const visibleOnly = req.nextUrl.searchParams.get('visible') !== 'false'
  if (!tenantId) return NextResponse.json({ error: 'tenant_id requis' }, { status: 400 })

  let q = supabase.from('testimonials').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
  if (visibleOnly) q = q.eq('visible', true)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tenant_id, author_name, author_location, text, rating, source } = body
  if (!tenant_id || !author_name || !text)
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const { data, error } = await supabase.from('testimonials')
    .insert({ tenant_id, author_name, author_location, text, rating: rating ?? 5, source: source ?? 'direct', visible: true })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
