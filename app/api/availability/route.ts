import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchBlockedDates, getBlockedDateStrings } from '@/lib/ical'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Rate limiting : 60 req / min par IP
  const ip = getClientIp(req)
  const rl = rateLimit(`availability:${ip}`, { maxRequests: 60, windowMs: 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const propertyId = req.nextUrl.searchParams.get('property_id')
  if (!propertyId || !/^[0-9a-f-]{36}$/.test(propertyId)) {
    return NextResponse.json({ error: 'property_id invalide' }, { status: 400 })
  }

  const { data: property } = await supabase
    .from('properties').select('ical_url').eq('id', propertyId).single()

  let icalDates: string[] = []
  const hasIcal = !!property?.ical_url
  if (hasIcal) {
    const blocked = await fetchBlockedDates(property.ical_url!)
    icalDates = getBlockedDateStrings(blocked)
  }

  const { data: confirmedBookings } = await supabase
    .from('bookings')
    .select('check_in, check_out')
    .eq('property_id', propertyId)
    .eq('status', 'confirmed')

  const bookedDates: string[] = []
  for (const booking of confirmedBookings ?? []) {
    const d = new Date(booking.check_in)
    const end = new Date(booking.check_out)
    while (d < end) {
      bookedDates.push(d.toISOString().split('T')[0])
      d.setDate(d.getDate() + 1)
    }
  }

  const allBlocked = [...new Set([...icalDates, ...bookedDates])]

  return NextResponse.json({ blocked: allBlocked, hasIcal }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' }
  })
}
