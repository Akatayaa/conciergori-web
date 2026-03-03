import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get('property_id')
  const query = supabase.from('pricing_rules').select('*').order('priority')
  if (propertyId) query.eq('property_id', propertyId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const tenantId = '67b8314e-ce88-467a-9246-cb0558402e34'
  const { data, error } = await supabase
    .from('pricing_rules')
    .insert({ ...body, tenant_id: tenantId })
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
