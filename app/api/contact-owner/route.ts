import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, address, nb_properties, message } = await req.json()
    if (!name || !email || !address) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM || "Concierg'ori <notifications@conciergori.fr>",
      to: process.env.HOST_EMAIL || 'conciergori@outlook.fr',
      replyTo: email,
      subject: `Nouvelle demande propriétaire — ${name}`,
      html: `
        <h2>Nouvelle demande de partenariat</h2>
        <table style="border-collapse:collapse; width:100%">
          <tr><td style="padding:8px; font-weight:bold; color:#00243f">Nom</td><td style="padding:8px">${name}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#00243f">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#00243f">Téléphone</td><td style="padding:8px">${phone || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#00243f">Adresse du bien</td><td style="padding:8px">${address}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#00243f">Nb logements</td><td style="padding:8px">${nb_properties}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#00243f">Message</td><td style="padding:8px">${message || 'Aucun message'}</td></tr>
        </table>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('contact-owner error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
