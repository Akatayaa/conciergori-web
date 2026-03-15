import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const WRAPPER = (body: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fff2e0;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#00243f;padding:28px 36px;border-radius:12px 12px 0 0;text-align:center">
<span style="font-size:26px;font-weight:bold;color:white;font-family:Georgia,serif">Concierg<span style="color:#73c7d6">'ori</span></span>
<p style="color:rgba(255,255,255,0.6);font-size:12px;margin:6px 0 0">Conciergerie · Caen, Normandie</p>
</td></tr>
<tr><td style="background:white;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e8d8c0;border-top:none">${body}</td></tr>
<tr><td style="padding:20px;text-align:center"><p style="font-size:11px;color:#aaa;margin:0">© Concierg'ori · <a href="https://conciergori.fr" style="color:#0097b2">conciergori.fr</a></p></td></tr>
</table></td></tr></table></body></html>`

export async function sendBookingStatusEmail(bookingId: string, newStatus: 'confirmed' | 'cancelled') {
  const { data: b } = await supabase
    .from('bookings')
    .select('guest_name, guest_email, check_in, check_out, guests, total_price, tenant_id, property_id')
    .eq('id', bookingId).single()
  if (!b?.guest_email) return

  const { data: prop } = await supabase.from('properties').select('name').eq('id', b.property_id).single()
  const propName = prop?.name ?? 'votre logement'

  const ci = new Date(b.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const co = new Date(b.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (newStatus === 'confirmed') {
    await resend.emails.send({
      from: process.env.RESEND_FROM || "Concierg'ori <notifications@conciergori.fr>",
      to: b.guest_email,
      subject: `✅ Réservation confirmée — ${propName}`,
      html: WRAPPER(`
        <h2 style="color:#00243f;font-family:Georgia,serif">Bonne nouvelle, ${b.guest_name} ! 🎉</h2>
        <p style="color:#5a5a5a">Votre réservation est officiellement <strong style="color:#16a34a">confirmée</strong>.</p>
        <table style="border-collapse:collapse;width:100%;margin:20px 0">
          <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f;width:140px">Logement</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">${propName}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f">Arrivée</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">${ci}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f">Départ</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">${co}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f">Voyageurs</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">${b.guests} personne(s)</td></tr>
          ${b.total_price ? `<tr><td style="padding:10px;font-weight:bold;color:#00243f">Total</td><td style="padding:10px;font-weight:bold;color:#0097b2">${b.total_price} €</td></tr>` : ''}
        </table>
        <p style="color:#5a5a5a">Nous vous enverrons les instructions d'accès quelques jours avant votre arrivée. En attendant, n'hésitez pas à nous contacter si vous avez des questions.</p>
        <p style="margin-top:32px;color:#5a5a5a">À très bientôt en Normandie,<br><strong>Notre équipe</strong></p>
      `),
    })
  } else {
    await resend.emails.send({
      from: process.env.RESEND_FROM || "Concierg'ori <notifications@conciergori.fr>",
      to: b.guest_email,
      subject: `Votre demande de réservation — ${propName}`,
      html: WRAPPER(`
        <h2 style="color:#00243f;font-family:Georgia,serif">Bonjour ${b.guest_name},</h2>
        <p style="color:#5a5a5a">Nous sommes désolés de vous informer que nous ne pouvons pas donner suite à votre demande de réservation pour <strong>${propName}</strong> du <strong>${ci}</strong> au <strong>${co}</strong>.</p>
        <p style="color:#5a5a5a">Les raisons peuvent être diverses : logement déjà réservé sur d'autres plateformes, dates indisponibles, etc.</p>
        <p style="color:#5a5a5a">N'hésitez pas à consulter nos autres logements disponibles ou à nous contacter directement.</p>
        <div style="margin:24px 0;text-align:center">
          <a href='https://conciergori.fr/logements' style="display:inline-block;padding:12px 28px;background:#0097b2;color:white;text-decoration:none;border-radius:100px;font-weight:bold">Voir d'autres logements</a>
        </div>
        <p style="color:#5a5a5a">Cordialement,<br><strong>Notre équipe</strong></p>
      `),
    })
  }
}
