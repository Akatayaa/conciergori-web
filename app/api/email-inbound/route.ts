/**
 * Webhook inbound email — Resend
 * Reçoit les emails forwardés depuis Oriane/clients
 * Parse les confirmations Airbnb/Booking et crée des réservations en DB
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { parseAirbnbEmail } from '@/lib/parse-airbnb-email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Payload Resend Inbound
    const { to, from, subject, text, html } = body

    if (!subject) return NextResponse.json({ ok: true })

    // Identifier le tenant depuis l'adresse de destination
    // ex: import+conciergori@conciergori.fr → slug = conciergori
    const toAddress = Array.isArray(to) ? to[0] : to
    const tenantSlugMatch = toAddress?.match(/import\+([a-z0-9-]+)@/)
    const tenantSlug = tenantSlugMatch?.[1] ?? 'conciergori'

    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', tenantSlug)
      .single()

    if (!tenant) {
      console.error('Tenant not found for slug:', tenantSlug)
      return NextResponse.json({ ok: true })
    }

    // Parser l'email
    const parsed = parseAirbnbEmail(subject, text ?? '', html)
    if (!parsed) {
      console.log('Email non pertinent, ignoré:', subject)
      return NextResponse.json({ ok: true })
    }

    // Trouver le logement correspondant par nom (fuzzy)
    let propertyId: string | null = null
    if (parsed.propertyName) {
      const { data: props } = await supabase
        .from('properties')
        .select('id, name')
        .eq('tenant_id', tenant.id)

      const normalized = (s: string) => s.toLowerCase().replace(/[^a-zà-ÿ0-9]/g, '')
      const needle = normalized(parsed.propertyName)
      const match = props?.find(p => {
        const haystack = normalized(p.name)
        return haystack.includes(needle) || needle.includes(haystack.slice(0, 15))
      })
      if (match) propertyId = match.id
    }

    // Vérifier doublon (même booking_ref déjà en DB)
    if (parsed.bookingRef) {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('external_ref', parsed.bookingRef)
        .single()
      if (existing) {
        console.log('Réservation déjà en DB:', parsed.bookingRef)
        return NextResponse.json({ ok: true, duplicate: true })
      }
    }

    // Créer la réservation
    if (parsed.checkIn && parsed.checkOut && parsed.guestName) {
      const { data: property } = propertyId
        ? await supabase.from('properties').select('base_price').eq('id', propertyId).single()
        : { data: null }

      const nights = Math.round(
        (new Date(parsed.checkOut).getTime() - new Date(parsed.checkIn).getTime()) / 86400000
      )

      await supabase.from('bookings').insert({
        tenant_id: tenant.id,
        property_id: propertyId,
        guest_name: parsed.guestName,
        guest_email: parsed.guestEmail,
        check_in: parsed.checkIn,
        check_out: parsed.checkOut,
        status: 'confirmed',
        source: parsed.source,
        external_ref: parsed.bookingRef,
        airbnb_profile_url: parsed.guestProfileUrl,
        total_price: parsed.totalAmount ?? (property?.base_price ? property.base_price * nights : null),
        notes: `Importé automatiquement depuis email ${parsed.source} — ${subject}`,
      })

      console.log(`✅ Réservation créée: ${parsed.guestName} ${parsed.checkIn}→${parsed.checkOut}`)
    }

    return NextResponse.json({ ok: true, parsed })
  } catch (err) {
    console.error('Email inbound error:', err)
    return NextResponse.json({ ok: true })
  }
}
