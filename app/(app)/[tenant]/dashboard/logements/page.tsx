import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PropertyRow from '@/components/dashboard/PropertyRow'
import PropertyKpis from '@/components/dashboard/PropertyKpis'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function nightsBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export default async function LogementsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: properties } = await supabase
    .from('properties').select('*').eq('tenant_id', tenant.id).order('name')

  const { data: bookings } = await supabase
    .from('bookings').select('id, property_id, check_in, check_out, total_price, status')
    .eq('tenant_id', tenant.id).in('status', ['confirmed', 'pending'])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  // Calcul stats par logement
  const statsByProp: Record<string, {
    caMonth: number; nbResasMonth: number; tauxOccup: number; nextCheckin: string | null
  }> = {}

  for (const p of (properties ?? [])) {
    const propBookings = (bookings ?? []).filter(b => b.property_id === p.id)
    const monthBookings = propBookings.filter(b =>
      new Date(b.check_in) >= startOfMonth && new Date(b.check_in) < endOfMonth
    )
    const caMonth = monthBookings.reduce((s, b) => s + (b.total_price ?? 0), 0)
    const nbResasMonth = monthBookings.length

    // Taux occupation ce mois
    const nightsBooked = monthBookings.reduce((s, b) => {
      const ci = new Date(b.check_in) < startOfMonth ? startOfMonth : new Date(b.check_in)
      const co = new Date(b.check_out) > endOfMonth ? endOfMonth : new Date(b.check_out)
      return s + Math.max(0, nightsBetween(ci.toISOString(), co.toISOString()))
    }, 0)
    const tauxOccup = Math.round((nightsBooked / daysInMonth) * 100)

    // Prochain check-in
    const upcoming = propBookings
      .filter(b => new Date(b.check_in) >= now)
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())[0]
    const nextCheckin = upcoming?.check_in ?? null

    statsByProp[p.id] = { caMonth, nbResasMonth, tauxOccup, nextCheckin }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>Logements</h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            {properties?.length ?? 0} logement{(properties?.length ?? 0) > 1 ? 's' : ''} — stats de{' '}
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
          <Link href="./logements/nouveau"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0097b2' }}>
            + Nouveau logement
          </Link>
        </div>

        <div className="space-y-4">
          {(properties ?? []).map(property => (
            <div key={property.id} className="rounded-2xl bg-white shadow-sm overflow-hidden"
                 style={{ border: '1px solid #f0e8da' }}>
              <PropertyRow property={property} />
              <div className="border-t px-4 py-3" style={{ borderColor: '#f0e8da', backgroundColor: '#fafaf8' }}>
                <PropertyKpis {...statsByProp[property.id]} />
              </div>
            </div>
          ))}
          {(!properties || properties.length === 0) && (
            <p className="text-center py-12 text-sm" style={{ color: '#979797' }}>Aucun logement configuré.</p>
          )}
        </div>
      </div>
    </div>
  )
}
