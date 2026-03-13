import { createClient as createSupabaseClient } from '@supabase/supabase-js'
const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url)
  const tenantId = searchParams.get('tenant_id')
  if (!tenantId) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('invoice_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error && error.code === 'PGRST116') {
    return NextResponse.json({
      tenant_id: tenantId,
      concierge_rate: 20,
      fees: [
        { name: 'Ménage', amount: 50, enabled: true },
        { name: 'Linge', amount: 15, enabled: true },
        { name: 'Animaux', amount: 25, enabled: false },
      ],
      invoice_prefix: 'FAC',
      company_name: '',
      company_address: '',
      company_siret: '',
      company_email: '',
      company_phone: '',
    })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  
  const body = await req.json()
  const { tenant_id, ...settings } = body
  if (!tenant_id) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('invoice_settings')
    .upsert({ tenant_id, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
