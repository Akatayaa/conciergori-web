import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/dashboard/LogoutButton'
import ReservationsList from '@/components/dashboard/ReservationsList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ReservationsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params

  const { data: tenant } = await supabase
    .from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  const { data: properties } = await supabase
    .from('properties').select('id, name').eq('tenant_id', tenant.id)

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
              { href: `/${tenantSlug}/dashboard`, label: "🏠 Vue d'ensemble" },
              { href: `/${tenantSlug}/dashboard/logements`, label: '🛏 Logements' },
              { href: `/${tenantSlug}/dashboard/reservations`, label: '📅 Réservations', active: true },
              { href: `/${tenantSlug}/dashboard/pricing', label: '💰 Prix & règles' },
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

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>Réservations</h1>
                <p className="text-sm" style={{ color: '#979797' }}>{bookings?.length ?? 0} au total</p>
              </div>
            </div>

            <ReservationsList bookings={bookings ?? []} properties={propMap} />

          </div>
        </main>
      </div>
    </div>
  )
}
