import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/invoice-profiles?property_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const property_id = searchParams.get('property_id')
  if (!property_id) {
    return NextResponse.json({ error: 'property_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('invoice_profiles')
    .select('*')
    .eq('property_id', property_id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/invoice-profiles — { property_id, tenant_id, name?, lines }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { property_id, tenant_id, name = 'Profil par défaut', lines } = body

  if (!property_id || !tenant_id || !Array.isArray(lines)) {
    return NextResponse.json(
      { error: 'property_id, tenant_id and lines (array) are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('invoice_profiles')
    .insert({ property_id, tenant_id, name, lines })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
