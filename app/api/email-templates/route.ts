import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const { tenantId, type, subject, body_html } = await req.json()
  if (!tenantId || !type || !subject || !body_html)
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const { error } = await supabase.from('email_templates')
    .upsert({ tenant_id: tenantId, type, subject, body_html, updated_at: new Date().toISOString() },
             { onConflict: 'tenant_id,type' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
