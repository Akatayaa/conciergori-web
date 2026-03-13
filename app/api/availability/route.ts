import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchIcalEvents, getBlockedDateStrings } from '@/lib/ical'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`availability:${ip}`, { maxRequests: 60, windowMs: 60 * 1000 })
  if (!rl.allowed) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

  const propertyId = req.nextUrl.searchParams.get('property_id')
  if (!propertyId || !/^[0-9a-f-]{36}$/.test(propertyId)) {
    return NextResponse.json({ error: 'property_id invalide' }, { status: 400 })
  }

  const { data: property } = await supabase
    .from('properties').select('ical_url').eq('id', propertyId).single()

  // Événements iCal enrichis
  let icalEvents: Awaited<ReturnType<typeof fetchIcalEvents>> = []
  const hasIcal = !!property?.ical_url
  if (hasIcal) {
    icalEvents = await fetchIcalEvents(property.ical_url!)
  }

  const icalDates = getBlockedDateStrings(icalEvents.map(e => ({ start: e.start, end: e.end })))

  // Réservations confirmées en DB
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

  // Réservations iCal (pour le calendrier dashboard)
  const reservations = icalEvents
    .filter(e => e.isReservation)
    .map(e => ({
      check_in: e.start.toISOString().split('T')[0],
      check_out: e.end.toISOString().split('T')[0],
      source: e.source ?? 'airbnb',
      booking_ref: e.bookingRef,
      phone4: e.phone4,
      summary: e.summary,
    }))

  return NextResponse.json({ blocked: allBlocked, hasIcal, reservations }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate' }
  })
}
