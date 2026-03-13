import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('owners')
    .select('*, owner_properties(property_id)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tenant_id, name, email, phone, notes, owner_commission = 80, property_ids = [] } = body

  if (!tenant_id || !name) return NextResponse.json({ error: 'tenant_id and name required' }, { status: 400 })

  // Générer un token sécurisé pour le portal
  const portal_token = randomBytes(32).toString('hex')

  const { data: owner, error } = await supabase
    .from('owners')
    .insert({ tenant_id, name, email, phone, notes, owner_commission, portal_token })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Assigner les logements
  if (property_ids.length > 0) {
    await supabase.from('owner_properties').insert(
      property_ids.map((pid: string) => ({ owner_id: owner.id, property_id: pid }))
    )
  }

  return NextResponse.json(owner, { status: 201 })
}
