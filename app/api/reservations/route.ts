import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limiting : 5 réservations max / 10 min par IP
  const ip = getClientIp(req)
  const rl = rateLimit(`reservations:${ip}`, { maxRequests: 5, windowMs: 10 * 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans quelques minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  const supabase = await createClient()
  const body = await req.json()
  const { property_id, check_in, check_out, guest_name, guest_email, guest_phone, guests, airbnb_profile_url, notes } = body

  // Validation serveur
  if (!property_id || !check_in || !check_out || !guest_name || !guest_email) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }
  if (new Date(check_in) >= new Date(check_out)) {
    return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })
  }
  if (guest_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  // Vérifier les conflits avec les réservations confirmées
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('property_id', property_id)
    .in('status', ['confirmed', 'pending'])
    .or(`and(check_in.lt.${check_out},check_out.gt.${check_in})`)

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({ error: 'Ces dates sont déjà réservées' }, { status: 409 })
  }

  // Calculer le prix
  const { data: property } = await supabase.from('properties').select('base_price, tenant_id').eq('id', property_id).single()
  if (!property) return NextResponse.json({ error: 'Logement introuvable' }, { status: 404 })

  const nights = Math.round((new Date(check_out).getTime() - new Date(check_in).getTime()) / 86400000)
  let total_price = property.base_price * nights

  // Appliquer les règles de prix
  try {
    const pricingRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pricing?property_id=${property_id}&check_in=${check_in}&check_out=${check_out}`)
    if (pricingRes.ok) {
      const breakdown = await pricingRes.json()
      if (breakdown.finalPrice) total_price = breakdown.finalPrice
    }
  } catch {}

  const { data, error } = await supabase.from('bookings').insert({
    property_id,
    tenant_id: property.tenant_id,
    check_in, check_out,
    guest_name: guest_name.trim().slice(0, 100),
    guest_email: guest_email.trim().toLowerCase().slice(0, 200),
    guest_phone: guest_phone?.trim().slice(0, 20),
    guests: guests || 1,
    airbnb_profile_url: airbnb_profile_url?.trim().slice(0, 500),
    notes: notes?.trim().slice(0, 1000),
    status: 'pending',
    total_price,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
