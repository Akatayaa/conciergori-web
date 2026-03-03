import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
  const { property_id, base_price, ical_url } = await req.json()
  if (!property_id) return NextResponse.json({ error: 'property_id requis' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (base_price !== undefined) updates.base_price = base_price
  if (ical_url !== undefined) updates.ical_url = ical_url

  const { error } = await supabase.from('properties').update(updates).eq('id', property_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
