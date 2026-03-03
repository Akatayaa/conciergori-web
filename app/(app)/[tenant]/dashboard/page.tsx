import LogoutButton from '@/components/dashboard/LogoutButton'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    <div className="min-h-screen" style={{ backgroundColor: '#f8f4ee', color: '#4b4b4b' }}>
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col" style={{ backgroundColor: '#00243f' }}>
          <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden bg-white p-1 flex-shrink-0">
                <img src="/logo.svg" alt="Concierg'ori" className="h-10 w-10 object-cover" />
              </div>
              <div>
                <p className="text-white font-[var(--font-suez)] text-base leading-tight">Concierg'ori</p>
                <p className="text-white/40 text-xs">Dashboard</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {[
              { href: `/${tenantSlug}/dashboard`, label: '🏠 Vue d\'ensemble', active: true },
              { href: `/${tenantSlug}/dashboard/logements`, label: '🛏 Logements' },
              { href: `/${tenantSlug}/dashboard/reservations`, label: '📅 Réservations' },
              { href: `/${tenantSlug}/dashboard/regles`, label: '⚙️ Règles de prix' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-white/40">{tenant.name}</p>
            <Link href="/" className="text-xs text-[#73c7d6] hover:underline mt-1 block">← Voir le site</Link>
            <LogoutButton />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
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
        </main>
      </div>
    </div>
  )
}
