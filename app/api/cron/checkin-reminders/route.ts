import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toLocaleDateString('sv-SE')
  const in2days = new Date()
  in2days.setDate(in2days.getDate() + 2)
  const in2daysStr = in2days.toLocaleDateString('sv-SE')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, properties(name, address)')
    .eq('status', 'confirmed')
    .in('check_in', [tomorrowStr, in2daysStr])

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Aucune arrivée à venir' })
  }

  const tomorrow_b = bookings.filter(b => b.check_in === tomorrowStr)
  const in2days_b = bookings.filter(b => b.check_in === in2daysStr)

  const fmtRow = (b: Record<string, unknown>) => {
    const prop = b.properties as { name: string } | null
    const n = Math.round((new Date(b.check_out as string).getTime() - new Date(b.check_in as string).getTime()) / 86400000)
    return `<tr style="border-bottom:1px solid #f0e8da">
      <td style="padding:10px 16px;font-weight:600;color:#00243f">${prop?.name ?? '—'}</td>
      <td style="padding:10px 16px">${b.guest_name}</td>
      <td style="padding:10px 16px">${n} nuit${n > 1 ? 's' : ''} → ${new Date(b.check_out as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</td>
      <td style="padding:10px 16px">${b.guest_phone ? `<a href="tel:${b.guest_phone}">${b.guest_phone}</a>` : '—'}</td>
      <td style="padding:10px 16px;font-weight:600">${b.total_price ? `${b.total_price}€` : '—'}</td>
    </tr>`
  }

  const thead = `<tr style="background:#fff2e0"><th style="padding:8px 16px;text-align:left;font-size:11px;color:#979797">LOGEMENT</th><th style="padding:8px 16px;text-align:left;font-size:11px;color:#979797">VOYAGEUR</th><th style="padding:8px 16px;text-align:left;font-size:11px;color:#979797">SÉJOUR</th><th style="padding:8px 16px;text-align:left;font-size:11px;color:#979797">TÉL</th><th style="padding:8px 16px;text-align:left;font-size:11px;color:#979797">TOTAL</th></tr>`

  let html = `<div style="font-family:sans-serif;max-width:640px;margin:0 auto">
    <div style="background:#00243f;padding:24px 32px;border-radius:16px 16px 0 0">
      <h1 style="color:#fff;margin:0;font-size:18px">🌅 Récap arrivées — ${tomorrow.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h1>
    </div>
    <div style="padding:24px 32px;background:#fff;border:1px solid #e8d8c0;border-top:none">`

  if (tomorrow_b.length > 0) html += `
    <h2 style="color:#00243f;font-size:15px">✈️ Demain — ${tomorrow_b.length} arrivée${tomorrow_b.length > 1 ? 's' : ''}</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff8f0;border-radius:8px;overflow:hidden;margin-bottom:20px">
      <thead>${thead}</thead><tbody>${tomorrow_b.map(fmtRow).join('')}</tbody></table>`

  if (in2days_b.length > 0) html += `
    <h2 style="color:#00243f;font-size:15px">📅 Après-demain — ${in2days_b.length} arrivée${in2days_b.length > 1 ? 's' : ''}</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff8f0;border-radius:8px;overflow:hidden">
      <thead>${thead}</thead><tbody>${in2days_b.map(fmtRow).join('')}</tbody></table>`

  html += `
    <div style="text-align:center;margin-top:24px">
      <a href="https://conciergori-web.vercel.app/conciergori/dashboard/reservations"
        style="background:#00243f;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">
        Voir le dashboard →
      </a>
    </div></div>
    <div style="padding:12px 32px;background:#f8f4ee;text-align:center;border-radius:0 0 16px 16px">
      <p style="font-size:11px;color:#979797;margin:0">Concierg'ori — envoi automatique chaque matin à 8h</p>
    </div></div>`

  await resend.emails.send({
    from: "Concierg'ori <onboarding@resend.dev>",
    to: 'conciergori@outlook.fr',
    subject: `🌅 ${tomorrow_b.length + in2days_b.length} arrivée${tomorrow_b.length + in2days_b.length > 1 ? 's' : ''} — ${tomorrow.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
    html,
  })

  return NextResponse.json({ sent: bookings.length, tomorrow: tomorrow_b.length, in2days: in2days_b.length })
}
