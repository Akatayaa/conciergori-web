import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const WRAPPER = (body: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#fff2e0;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
<tr><td style="background:#00243f;padding:28px 36px;border-radius:12px 12px 0 0;text-align:center">
<span style="font-size:26px;font-weight:bold;color:white;font-family:Georgia,serif">Concierg<span style="color:#73c7d6">'ori</span></span>
<p style="color:rgba(255,255,255,0.6);font-size:12px;margin:6px 0 0">TEST — Conciergerie · Caen</p>
</td></tr>
<tr><td style="background:white;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e8d8c0;border-top:none">${body}</td></tr>
</table></td></tr></table></body></html>`

export async function POST(req: NextRequest) {
  const { subject, body_html, to } = await req.json()
  if (!subject || !body_html || !to)
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const previewBody = body_html
    .replace(/\{\{guest_name\}\}/g, 'Sophie Martin (TEST)')
    .replace(/\{\{property_name\}\}/g, 'Studio Le Moulin — Caen')
    .replace(/\{\{checkin_date\}\}/g, '28 mars 2025')
    .replace(/\{\{checkout_date\}\}/g, '2 avril 2025')
    .replace(/\{\{guests\}\}/g, '2')
    .replace(/\{\{total_price\}\}/g, '420')

  try {
    await resend.emails.send({
      from: "Concierg'ori <notifications@conciergori.fr>",
      to,
      subject: `[TEST] ${subject.replace(/\{\{property_name\}\}/g, 'Studio Le Moulin')}`,
      html: WRAPPER(previewBody),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
