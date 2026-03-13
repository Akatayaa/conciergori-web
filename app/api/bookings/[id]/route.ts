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

  const { data: booking, error } = await supabase
    .from('bookings').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Créer automatiquement une tâche de ménage quand une réservation est confirmée
  if (body.status === 'confirmed' && booking) {
    const existingTask = await supabase
      .from('cleaning_tasks')
      .select('id')
      .eq('booking_id', id)
      .single()

    if (!existingTask.data) {
      await supabase.from('cleaning_tasks').insert({
        tenant_id: booking.tenant_id,
        property_id: booking.property_id,
        booking_id: id,
        scheduled_date: booking.check_out, // ménage le jour du départ
      })
    }
  }

  return NextResponse.json({ success: true })
}
