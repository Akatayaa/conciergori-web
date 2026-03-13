import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { property_ids, ...ownerFields } = body

  // Mettre à jour les champs owner
  if (Object.keys(ownerFields).length > 0) {
    const { error } = await supabase.from('owners').update(ownerFields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sync des logements assignés
  if (property_ids !== undefined) {
    await supabase.from('owner_properties').delete().eq('owner_id', id)
    if (property_ids.length > 0) {
      await supabase.from('owner_properties').insert(
        property_ids.map((pid: string) => ({ owner_id: id, property_id: pid }))
      )
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Cascade : owner_properties supprimés par FK ou manuellement
  await supabase.from('owner_properties').delete().eq('owner_id', id)
  const { error } = await supabase.from('owners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
