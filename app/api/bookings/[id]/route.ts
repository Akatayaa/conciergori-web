import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (body.status !== undefined) updates.status = body.status
  if (body.host_rating !== undefined) updates.host_rating = body.host_rating
  if (body.host_memo !== undefined) updates.host_memo = body.host_memo
  const { error } = await supabase.from('bookings').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
