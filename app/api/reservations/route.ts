import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { property_id, guest_name, guest_email, guest_phone, check_in, check_out, guests } = body

    // Validation basique
    if (!property_id || !guest_name || !guest_email || !check_in || !check_out) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    // Récupérer le logement + tenant
    const { data: property } = await supabase
      .from('properties')
      .select('*, tenants(name, branding_config)')
      .eq('id', property_id)
      .single()

    if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

    // Calculer le nb de nuits
    const checkInDate = new Date(check_in)
    const checkOutDate = new Date(check_out)
    const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })

    const totalPrice = property.base_price > 0 ? property.base_price * nights : null

    // Détecter repeat guest
    const { count: prevCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('guest_email', guest_email)
      .eq('status', 'confirmed')

    const isRepeatGuest = (prevCount ?? 0) > 0

    // Sauvegarder en base
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .insert({
        tenant_id: property.tenant_id,
        property_id,
        guest_name,
        guest_email,
        guest_phone: guest_phone || null,
        check_in,
        check_out,
        total_price: totalPrice,
        status: 'pending',
        source: 'direct'
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    // Envoyer email si Resend configuré
    const resendKey = process.env.RESEND_API_KEY
    const hostEmail = process.env.HOST_EMAIL || 'oriane@conciergori.fr'

    if (resendKey && resendKey !== 'RESEND_KEY_PLACEHOLDER') {
      const { Resend } = await import('resend')
      const resend = new Resend(resendKey)

      const checkInFr = checkInDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      const checkOutFr = checkOutDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

      // Email à l'équipe Concierg'ori
      await resend.emails.send({
        from: 'Concierg\'ori <onboarding@resend.dev>',
        to: hostEmail,
        subject: `📋 Nouvelle demande — ${property.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00243f;">Nouvelle demande de réservation</h2>
            <p><strong>Logement :</strong> ${property.name}</p>
            <hr style="border-color: #e8d8c0;" />
            <p><strong>Voyageur :</strong> ${guest_name}</p>
            <p><strong>Email :</strong> ${guest_email}</p>
            ${guest_phone ? `<p><strong>Téléphone :</strong> ${guest_phone}</p>` : ''}
            ${isRepeatGuest ? '<p style="color:#065f46;background:#d1fae5;padding:6px 12px;border-radius:8px;display:inline-block;">⭐ Client fidèle — a déjà réservé chez vous</p>' : ''}
            <p><strong>Arrivée :</strong> ${checkInFr}</p>
            <p><strong>Départ :</strong> ${checkOutFr}</p>
            <p><strong>Durée :</strong> ${nights} nuit${nights > 1 ? 's' : ''}</p>
            <p><strong>Voyageurs :</strong> ${guests}</p>
            ${totalPrice ? `<p><strong>Total estimé :</strong> ${totalPrice}€</p>` : ''}
            <hr style="border-color: #e8d8c0;" />
            <p style="color: #979797; font-size: 12px;">Répondre directement à cet email pour contacter le voyageur.</p>
          </div>
        `,
        replyTo: guest_email,
      })

      // Email de confirmation au voyageur (+ copie hôte en dev sans domaine vérifié)
      await resend.emails.send({
        from: 'Concierg\'ori <onboarding@resend.dev>',
        to: [guest_email, hostEmail],
        subject: `✅ Demande reçue — ${property.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00243f;">Votre demande a bien été reçue !</h2>
            <p>Bonjour ${guest_name},</p>
            <p>Nous avons bien reçu votre demande pour :</p>
            <div style="background: #fff2e0; padding: 16px; border-radius: 12px; margin: 16px 0;">
              <p style="margin: 0;"><strong>${property.name}</strong></p>
              <p style="margin: 8px 0 0; color: #4b4b4b;">Du ${checkInFr} au ${checkOutFr} · ${nights} nuit${nights > 1 ? 's' : ''}</p>
            </div>
            <p>Notre équipe vous contactera sous 24h pour confirmer votre réservation.</p>
            <p style="color: #979797; font-size: 12px;">Concierg'ori · Caen, Normandie</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, booking_id: booking.id })

  } catch (err) {
    console.error('Reservation error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
