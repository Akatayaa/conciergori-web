import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PropertyRow from '@/components/dashboard/PropertyRow'
import BookingsList from '@/components/dashboard/BookingsList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params

  const { data: tenant } = await supabase
    .from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: properties } = await supabase
    .from('properties').select('*').eq('tenant_id', tenant.id).order('name')

  const { data: bookings } = await supabase
    .from('bookings').select('*').eq('tenant_id', tenant.id)
    .eq('status', 'pending').order('created_at', { ascending: false }).limit(10)

  const totalProps = properties?.length ?? 0
  const pendingBookings = bookings?.length ?? 0

  // Map id → name pour BookingsList
  const propMap = Object.fromEntries((properties ?? []).map(p => [p.id, p.name]))

    return (
    <div className="p-6 md:p-10">
<div className="max-w-5xl mx-auto">

            <div className="mb-8">
              <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>Bonjour 👋</h1>
              <p className="text-sm" style={{ color: '#979797' }}>Tableau de bord · {tenant.name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Logements', value: totalProps, icon: '🏠', color: '#00243f' },
                { label: 'Demandes en attente', value: pendingBookings, icon: '📋', color: '#0097b2' },
                { label: 'Règles actives', value: 0, icon: '⚙️', color: '#73c7d6' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-6 bg-white shadow-sm">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-sm" style={{ color: '#979797' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Logements avec prix éditables */}
            <div className="rounded-2xl bg-white shadow-sm mb-8">
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
                <div>
                  <h2 className="font-[var(--font-alkatra)] text-lg font-bold" style={{ color: '#00243f' }}>
                    Vos logements
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#979797' }}>
                    Cliquez sur un prix pour le modifier · Cliquez sur iCal pour ajouter l'URL Airbnb
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#0097b2' }}>
                  {totalProps} biens
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: '#f0e8da' }}>
                {(properties ?? []).map(prop => (
                  <PropertyRow key={prop.id} property={prop} />
                ))}
              </div>
            </div>

            {/* Demandes de réservation */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
                <h2 className="font-[var(--font-alkatra)] text-lg font-bold" style={{ color: '#00243f' }}>
                  Demandes de réservation
                </h2>
                {pendingBookings > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#0097b2' }}>
                    {pendingBookings} en attente
                  </span>
                )}
              </div>
              <BookingsList bookings={bookings ?? []} properties={propMap} />
            </div>

          </div>
    </div>
  )
}
