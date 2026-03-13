import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service role pour bypasser RLS sur les routes API
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tenant_id, booking_id, additional_fees = [] } = body

  if (!tenant_id || !booking_id) {
    return NextResponse.json({ error: 'tenant_id and booking_id required' }, { status: 400 })
  }

  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .select('*, properties(name)')
    .eq('id', booking_id)
    .single()
  if (bErr || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { data: settings } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('tenant_id', tenant_id)
    .single()

  const concierge_rate = settings?.concierge_rate ?? 20
  const invoice_prefix = settings?.invoice_prefix ?? 'FAC'

  const checkIn = new Date(booking.check_in)
  const checkOut = new Date(booking.check_out)
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)
  const nightly_total = booking.total_price ?? (booking.base_price * nights)
  const concierge_fee = Math.round((nightly_total * concierge_rate) / 100 * 100) / 100
  const fees_total = additional_fees.reduce((sum: number, f: { amount: number; enabled?: boolean }) =>
    f.enabled !== false ? sum + (f.amount || 0) : sum, 0)
  const total = concierge_fee + fees_total

  const { data: settingsRow } = await supabase
    .from('invoice_settings')
    .select('next_invoice_number')
    .eq('tenant_id', tenant_id)
    .single()
  const num = settingsRow?.next_invoice_number ?? 1
  const invoice_number = `${invoice_prefix}-${String(num).padStart(4, '0')}`

  await supabase
    .from('invoice_settings')
    .update({ next_invoice_number: num + 1 })
    .eq('tenant_id', tenant_id)

  const { data: invoice, error: iErr } = await supabase
    .from('invoices')
    .insert({
      tenant_id,
      booking_id,
      invoice_number,
      guest_name: booking.guest_name,
      property_name: booking.properties?.name ?? '',
      check_in: booking.check_in,
      check_out: booking.check_out,
      nights,
      nightly_total,
      concierge_rate,
      concierge_fee,
      additional_fees,
      total,
      status: 'draft',
    })
    .select()
    .single()

  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 })
  return NextResponse.json(invoice, { status: 201 })
}
