import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tenantId = searchParams.get('tenant_id')
  const date = searchParams.get('date') // filtre par date (YYYY-MM)
  if (!tenantId) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

  let query = sb.from('cleaning_tasks')
    .select('*, properties(name, cover_image, address), cleaners(name, phone), bookings(guest_name, check_in, check_out)')
    .eq('tenant_id', tenantId)
    .order('scheduled_date', { ascending: true })

  if (date) {
    query = query.gte('scheduled_date', `${date}-01`).lte('scheduled_date', `${date}-31`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tenant_id, property_id, booking_id, scheduled_date, cleaner_id, notes } = body
  if (!tenant_id || !property_id || !scheduled_date) {
    return NextResponse.json({ error: 'tenant_id, property_id, scheduled_date required' }, { status: 400 })
  }
  const { data, error } = await sb.from('cleaning_tasks').insert({ tenant_id, property_id, booking_id, scheduled_date, cleaner_id, notes }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
