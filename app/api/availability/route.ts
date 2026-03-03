import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchBlockedDates, getBlockedDateStrings } from '@/lib/ical'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get('property_id')
  if (!propertyId) return NextResponse.json({ error: 'property_id requis' }, { status: 400 })

  const { data: property } = await supabase
    .from('properties').select('ical_url').eq('id', propertyId).single()

  // Dates bloquées depuis Airbnb (iCal)
  let icalDates: string[] = []
  const hasIcal = !!property?.ical_url
  if (hasIcal) {
    const blocked = await fetchBlockedDates(property.ical_url!)
    icalDates = getBlockedDateStrings(blocked)
  }

  // Dates bloquées par nos propres réservations confirmées
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
