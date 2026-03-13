import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  // Valider le token
  const { data: owner, error } = await supabase
    .from('owners').select('*, properties(id, name, cover_image, base_price, owner_commission)').eq('portal_token', token).single()
  if (error || !owner) return NextResponse.json({ error: 'Token invalide' }, { status: 401 })

  // Stats par propriété
  const propertyIds = owner.properties?.map((p: { id: string }) => p.id) ?? []
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const { data: bookings } = await supabase
    .from('bookings')
    .select('property_id, check_in, check_out, total_price, status, guest_name')
    .in('property_id', propertyIds)
    .eq('status', 'confirmed')
    .order('check_in', { ascending: false })

  // Calculer revenus propriétaire (total_price × owner_commission / 100)
  const stats = owner.properties?.map((prop: { id: string; name: string; owner_commission: number; cover_image: string; base_price: number }) => {
    const propBookings = bookings?.filter(b => b.property_id === prop.id) ?? []
    const monthBookings = propBookings.filter(b => b.check_in >= startOfMonth)
    const totalRevenue = propBookings.reduce((s: number, b: { total_price: number | null }) => s + (b.total_price ?? 0), 0)
    const monthRevenue = monthBookings.reduce((s: number, b: { total_price: number | null }) => s + (b.total_price ?? 0), 0)
    const ownerRate = (prop.owner_commission ?? 80) / 100
    const upcomingBookings = propBookings.filter(b => b.check_in >= now.toISOString().split('T')[0]).slice(0, 3)

    return {
      property: prop,
      totalNights: propBookings.reduce((s: number, b: { check_in: string; check_out: string }) => {
        return s + Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000)
      }, 0),
      monthRevenue: Math.round(monthRevenue * ownerRate),
      totalRevenue: Math.round(totalRevenue * ownerRate),
      bookingsCount: propBookings.length,
      upcomingBookings,
    }
  })

  return NextResponse.json({ owner: { name: owner.name, email: owner.email }, stats })
}
