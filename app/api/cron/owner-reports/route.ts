import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

const WRAPPER = (body: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fff2e0;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#00243f;padding:28px 36px;border-radius:12px 12px 0 0;text-align:center">
<span style="font-size:26px;font-weight:bold;color:white;font-family:Georgia,serif">Concierg<span style="color:#73c7d6">&apos;ori</span></span>
<p style="color:rgba(255,255,255,0.6);font-size:12px;margin:6px 0 0">Rapport mensuel propriétaire</p>
</td></tr>
<tr><td style="background:white;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e8d8c0;border-top:none">${body}</td></tr>
<tr><td style="padding:20px;text-align:center"><p style="font-size:11px;color:#aaa;margin:0">© Concierg&apos;ori</p></td></tr>
</table></td></tr></table></body></html>`

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const monthLabel = lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const { data: owners } = await supabase
    .from('owners')
    .select('id, name, email, owner_commission, tenant_id, portal_token')
    .not('email', 'is', null)

  if (!owners?.length) return NextResponse.json({ sent: 0 })

  let sent = 0

  for (const owner of owners) {
    const { data: ownerProps } = await supabase
      .from('owner_properties').select('property_id').eq('owner_id', owner.id)
    const propertyIds = (ownerProps ?? []).map((op: { property_id: string }) => op.property_id)
    if (!propertyIds.length) continue

    const { data: bookings } = await supabase
      .from('bookings')
      .select('property_id, check_in, check_out, total_price')
      .in('property_id', propertyIds)
      .eq('status', 'confirmed')
      .gte('check_in', lastMonth.toISOString())
      .lte('check_in', lastMonthEnd.toISOString())

    const totalRevenue = (bookings ?? []).reduce((s: number, b: { total_price: number | null }) => s + (b.total_price ?? 0), 0)
    const ownerRevenue = Math.round(totalRevenue * (owner.owner_commission / 100))
    const nbResas = (bookings ?? []).length
    const nbNights = (bookings ?? []).reduce((s: number, b: { check_in: string; check_out: string }) =>
      s + Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000), 0)

    const { data: props } = await supabase.from('properties').select('id, name').in('id', propertyIds)
    const propMap = Object.fromEntries((props ?? []).map((p: { id: string; name: string }) => [p.id, p.name]))

    const byProp = propertyIds.map((pid: string) => {
      const propBookings = (bookings ?? []).filter((b: { property_id: string }) => b.property_id === pid)
      const rev = propBookings.reduce((s: number, b: { total_price: number | null }) => s + (b.total_price ?? 0), 0)
      return { name: propMap[pid] ?? pid, rev: Math.round(rev * (owner.owner_commission / 100)), nb: propBookings.length }
    }).filter((p: { nb: number }) => p.nb > 0)

    const portalUrl = `https://conciergori.fr/conciergori/proprietaire?token=${owner.portal_token}`
    const fmt = (n: number) => n.toLocaleString('fr-FR') + ' €'

    const propRows = byProp.map((p: { name: string; nb: number; rev: number }) =>
      `<tr><td style="padding:10px;border-bottom:1px solid #f0e8da;color:#5a5a5a">${p.name}</td>
       <td style="padding:10px;border-bottom:1px solid #f0e8da;text-align:center;color:#5a5a5a">${p.nb}</td>
       <td style="padding:10px;border-bottom:1px solid #f0e8da;text-align:right;font-weight:bold;color:#0097b2">${fmt(p.rev)}</td></tr>`
    ).join('')

    const html = WRAPPER(`
      <h2 style="color:#00243f;font-family:Georgia,serif;margin-top:0">Bonjour ${owner.name.split(' ')[0]},</h2>
      <p style="color:#5a5a5a">Voici votre rapport pour <strong>${monthLabel}</strong>.</p>
      <div style="display:flex;gap:12px;margin:24px 0">
        <div style="flex:1;background:#e6f7fa;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#0097b2">${fmt(ownerRevenue)}</div>
          <div style="font-size:12px;color:#5a5a5a;margin-top:4px">Vos revenus</div>
        </div>
        <div style="flex:1;background:#f8f4ee;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#00243f">${nbResas}</div>
          <div style="font-size:12px;color:#5a5a5a;margin-top:4px">Réservations</div>
        </div>
        <div style="flex:1;background:#f8f4ee;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:24px;font-weight:bold;color:#00243f">${nbNights}</div>
          <div style="font-size:12px;color:#5a5a5a;margin-top:4px">Nuits</div>
        </div>
      </div>
      ${byProp.length > 1 ? `<table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr style="background:#f8f4ee">
          <th style="padding:10px;text-align:left;font-size:12px;color:#979797">Logement</th>
          <th style="padding:10px;font-size:12px;color:#979797">Résas</th>
          <th style="padding:10px;text-align:right;font-size:12px;color:#979797">Revenus</th>
        </tr>${propRows}</table>` : ''}
      <div style="text-align:center;margin:32px 0">
        <a href="${portalUrl}" style="display:inline-block;padding:14px 32px;background:#0097b2;color:white;text-decoration:none;border-radius:100px;font-weight:bold">Voir mon espace →</a>
      </div>
      <p style="color:#5a5a5a;font-size:14px">Votre virement sera effectué dans les prochains jours.</p>
      <p style="color:#5a5a5a;font-size:14px">Cordialement,<br><strong>Notre équipe</strong></p>
    `)

    await resend.emails.send({
      from: "Concierg'ori <notifications@conciergori.fr>",
      to: owner.email,
      subject: `📊 Votre rapport ${monthLabel} — Concierg'ori`,
      html,
    })
    sent++
  }

  return NextResponse.json({ sent, month: monthLabel })
}
