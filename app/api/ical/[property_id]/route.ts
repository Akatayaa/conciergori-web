/**
 * Export iCal de nos réservations confirmées
 * Airbnb/Booking importent cette URL pour bloquer les dates automatiquement
 * URL : /api/ical/[property_id]
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ property_id: string }> }
) {
  const { property_id } = await params

  if (!property_id || !/^[0-9a-f-]{36}$/.test(property_id)) {
    return new NextResponse('Invalid property_id', { status: 400 })
  }

  const { data: property } = await supabase
    .from('properties')
    .select('name, tenant_id')
    .eq('id', property_id)
    .single()

  if (!property) return new NextResponse('Property not found', { status: 404 })

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, created_at')
    .eq('property_id', property_id)
    .eq('status', 'confirmed')
    .order('check_in', { ascending: true })

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://conciergori.fr'

  const events = (bookings ?? []).map(b => {
    const dtstart = b.check_in.replace(/-/g, '')
    const dtend = b.check_out.replace(/-/g, '')
    const uid = `${b.id}@${new URL(appUrl).hostname}`
    const dtstamp = new Date(b.created_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    return [
      'BEGIN:VEVENT',
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:Réservé`,
      `UID:${uid}`,
      'END:VEVENT',
    ].join('\r\n')
  })

  const ical = [
    'BEGIN:VCALENDAR',
    'PRODID:-//Conciergori//Booking Calendar 1.0//FR',
    'CALSCALE:GREGORIAN',
    'VERSION:2.0',
    `X-WR-CALNAME:${property.name}`,
    `X-WR-CALDESC:Réservations confirmées — ${property.name}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="conciergori-${property_id}.ics"`,
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
