import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  // Trouver l'owner par token
  const { data: owner, error: ownerErr } = await supabase
    .from('owners')
    .select('id, name, owner_commission, tenant_id')
    .eq('portal_token', token)
    .single()

  if (ownerErr || !owner) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  // Logements du propriétaire
  const { data: ownerProps } = await supabase
    .from('owner_properties')
    .select('property_id')
    .eq('owner_id', owner.id)

  const propertyIds = (ownerProps || []).map(op => op.property_id)

  if (propertyIds.length === 0) {
    return NextResponse.json({ owner: { name: owner.name }, properties: [] })
  }

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, cover_image')
    .in('id', propertyIds)

  // Réservations confirmées par logement
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, property_id, check_in, check_out, status, total_price')
    .in('property_id', propertyIds)
    .eq('status', 'confirmed')
    .order('check_in', { ascending: true })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const propertiesWithStats = (properties || []).map(prop => {
    const propBookings = (bookings || []).filter(b => b.property_id === prop.id)
    const confirmed    = propBookings // already filtered to confirmed

    // CA total
    const totalRevenue = confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0)
    const ownerTotal   = Math.round(totalRevenue * (owner.owner_commission / 100) * 100) / 100

    // CA ce mois
    const thisMonthBookings = confirmed.filter(b => b.check_in >= startOfMonth)
    const monthRevenue = thisMonthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)
    const ownerMonth   = Math.round(monthRevenue * (owner.owner_commission / 100) * 100) / 100

    // Nuits confirmées
    const totalNights = confirmed.reduce((sum, b) => {
      const nights = Math.round(
        (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000
      )
      return sum + nights
    }, 0)

    // Prochaines réservations (3 max, sans nom voyageur)
    const upcoming = confirmed
      .filter(b => new Date(b.check_out) >= now)
      .slice(0, 3)
      .map(b => ({
        check_in: b.check_in,
        check_out: b.check_out,
        status: b.status,
        nights: Math.round(
          (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000
        ),
      }))

    // Revenus mensuels 6 mois
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const dEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1)
      const label = d.toLocaleDateString('fr-FR', { month: 'short' })
      const value = confirmed
        .filter(b => new Date(b.check_in) >= d && new Date(b.check_in) < dEnd)
        .reduce((s, b) => s + (b.total_price || 0), 0)
      return { label, value: Math.round(value * (owner.owner_commission / 100)) }
    })

    return {
      id: prop.id,
      name: prop.name,
      cover_image: prop.cover_image,
      stats: { ownerMonth, ownerTotal, totalNights },
      upcoming,
      monthlyRevenue,
    }
  })

  return NextResponse.json({
    owner: { name: owner.name, owner_commission: owner.owner_commission },
    properties: propertiesWithStats,
  })
}
