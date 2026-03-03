import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calculatePrice } from '@/lib/pricing'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const propertyId = searchParams.get('property_id')
  const checkIn = searchParams.get('check_in')
  const checkOut = searchParams.get('check_out')

  if (!propertyId || !checkIn || !checkOut)
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const [{ data: property }, { data: rules }] = await Promise.all([
    supabase.from('properties').select('base_price').eq('id', propertyId).single(),
    supabase.from('pricing_rules').select('*').eq('property_id', propertyId).eq('enabled', true),
  ])

  if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

  const breakdown = calculatePrice(
    property.base_price ?? 0,
    new Date(checkIn),
    new Date(checkOut),
    rules ?? []
  )

  return NextResponse.json(breakdown)
}
