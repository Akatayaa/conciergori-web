import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface BookingEmailData {
  tenantId: string
  guestName: string
  guestEmail: string
  propertyName: string
  checkinDate: string
  checkoutDate: string
  guests: number
  totalPrice: number
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

const EMAIL_WRAPPER = (body: string) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fff2e0;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff2e0;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <!-- Header -->
        <tr><td style="background:#00243f;padding:28px 36px;border-radius:12px 12px 0 0;text-align:center">
          <span style="font-size:26px;font-weight:bold;color:white;font-family:Georgia,serif">
            Concierg<span style="color:#73c7d6">'ori</span>
          </span>
          <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:6px 0 0">Conciergerie · Caen, Normandie</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:white;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e8d8c0;border-top:none">
          ${body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px;text-align:center">
          <p style="font-size:11px;color:#aaa;margin:0">
            © Concierg'ori · Caen, Normandie · 
            <a href="https://conciergori.fr" style="color:#0097b2">conciergori.fr</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

export async function sendBookingConfirmation(data: BookingEmailData) {
  // Récupérer le template depuis la DB
  const { data: tpl } = await supabase
    .from('email_templates')
    .select('subject, body_html')
    .eq('tenant_id', data.tenantId)
    .eq('type', 'booking_confirmation')
    .single()

  if (!tpl) {
    console.warn('[sendBookingConfirmation] Aucun template trouvé pour tenant', data.tenantId)
    return
  }

  const vars: Record<string, string> = {
    guest_name: data.guestName,
    property_name: data.propertyName,
    checkin_date: data.checkinDate,
    checkout_date: data.checkoutDate,
    guests: String(data.guests),
    total_price: String(data.totalPrice),
  }

  const subject = interpolate(tpl.subject, vars)
  const bodyHtml = interpolate(tpl.body_html, vars)
  const html = EMAIL_WRAPPER(bodyHtml)

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || "Concierg'ori <notifications@conciergori.fr>",
      to: data.guestEmail,
      subject,
      html,
    })
    console.log('[sendBookingConfirmation] Email envoyé à', data.guestEmail)
  } catch (err) {
    console.error('[sendBookingConfirmation] Erreur Resend:', err)
  }
}
