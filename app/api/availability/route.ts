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

  if (!property?.ical_url) {
    return NextResponse.json({ blocked: [], hasIcal: false })
  }

  const blocked = await fetchBlockedDates(property.ical_url)
  const blockedDates = getBlockedDateStrings(blocked)

  return NextResponse.json({ blocked: blockedDates, hasIcal: true }, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate' }
  })
}
