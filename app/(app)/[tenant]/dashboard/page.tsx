import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import BookingsList from '@/components/dashboard/BookingsList'
import PropertyRow from '@/components/dashboard/PropertyRow'
import RevenueChart from '@/components/dashboard/RevenueChart'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function nightsBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export default async function DashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: properties } = await supabase
    .from('properties').select('*').eq('tenant_id', tenant.id).order('name')

  const { data: allBookings } = await supabase
    .from('bookings').select('*').eq('tenant_id', tenant.id)
    .in('status', ['confirmed', 'pending']).order('check_in')

  const propMap = Object.fromEntries((properties ?? []).map(p => [p.id, p]))
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const startOfMonth = new Date(y, m, 1)
  const startOfLastMonth = new Date(y, m - 1, 1)
  const endOfLastMonth = new Date(y, m, 0, 23, 59, 59)

  const bookings = allBookings ?? []

  // ── KPIs globaux ──────────────────────────────────────────────────────────
  const thisMonthBookings = bookings.filter(b => new Date(b.check_in) >= startOfMonth && new Date(b.check_in) < new Date(y, m + 1, 1))
  const lastMonthBookings = bookings.filter(b => new Date(b.check_in) >= startOfLastMonth && new Date(b.check_in) <= endOfLastMonth)

  const caThisMonth = thisMonthBookings.reduce((s, b) => s + (b.total_price ?? 0), 0)
  const caLastMonth = lastMonthBookings.reduce((s, b) => s + (b.total_price ?? 0), 0)
  const caEvol = caLastMonth > 0 ? Math.round(((caThisMonth - caLastMonth) / caLastMonth) * 100) : null

  const nbResasThisMonth = thisMonthBookings.length
  const nbResasLastMonth = lastMonthBookings.length

  // Taux d'occupation global ce mois (nuits réservées / nuits dispo)
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const totalNightsDispo = (properties?.length ?? 0) * daysInMonth
  const nightsBooked = thisMonthBookings.reduce((s, b) => {
    const ci = new Date(b.check_in) < startOfMonth ? startOfMonth : new Date(b.check_in)
    const co = new Date(b.check_out) > new Date(y, m + 1, 1) ? new Date(y, m + 1, 1) : new Date(b.check_out)
    return s + Math.max(0, nightsBetween(ci.toISOString(), co.toISOString()))
  }, 0)
  const tauxOccup = totalNightsDispo > 0 ? Math.round((nightsBooked / totalNightsDispo) * 100) : 0

  // Revenu moyen par nuit (toutes résas confirmées)
  const totalNightsAll = bookings.reduce((s, b) => s + Math.max(0, nightsBetween(b.check_in, b.check_out)), 0)
  const totalRevAll = bookings.reduce((s, b) => s + (b.total_price ?? 0), 0)
  const revParNuit = totalNightsAll > 0 ? Math.round(totalRevAll / totalNightsAll) : 0

  // ── Check-ins à venir (7 jours) ──────────────────────────────────────────
  const in7days = new Date(now); in7days.setDate(in7days.getDate() + 7)
  const upcomingCheckins = bookings
    .filter(b => new Date(b.check_in) >= now && new Date(b.check_in) <= in7days)
    .slice(0, 6)

  // ── Top logements ce mois ────────────────────────────────────────────────
  const revenueByProp: Record<string, number> = {}
  thisMonthBookings.forEach(b => {
    revenueByProp[b.property_id] = (revenueByProp[b.property_id] ?? 0) + (b.total_price ?? 0)
  })
  const topProps = Object.entries(revenueByProp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxPropRevenue = topProps[0]?.[1] ?? 1

  // ── Graphe 6 mois ────────────────────────────────────────────────────────
  const monthlyRevenue: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const mo = new Date(y, m - i, 1)
    const moEnd = new Date(y, m - i + 1, 1)
    const label = mo.toLocaleDateString('fr-FR', { month: 'short' })
    const value = bookings
      .filter(b => new Date(b.check_in) >= mo && new Date(b.check_in) < moEnd)
      .reduce((s, b) => s + (b.total_price ?? 0), 0)
    monthlyRevenue.push({ label, value })
  }

  // ── Demandes pending ─────────────────────────────────────────────────────
  const { data: pendingBookings } = await supabase
    .from('bookings').select('*').eq('tenant_id', tenant.id)
    .eq('status', 'pending').order('created_at', { ascending: false }).limit(10)

  const propNameMap = Object.fromEntries((properties ?? []).map(p => [p.id, p.name]))

  const MONTH_FR = new Date(y, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>Bonjour 👋</h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Tableau de bord · {tenant.name} · {MONTH_FR}
          </p>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: '💰', label: 'CA ce mois',
              value: `${caThisMonth.toLocaleString('fr-FR')} €`,
              sub: caEvol !== null
                ? (caEvol >= 0 ? `▲ +${caEvol}%` : `▼ ${caEvol}%`)
                : 'vs mois précédent',
              subColor: caEvol === null ? '#979797' : caEvol >= 0 ? '#16a34a' : '#dc2626',
            },
            {
              icon: '📅', label: 'Réservations ce mois',
              value: nbResasThisMonth,
              sub: nbResasLastMonth > 0 ? `${nbResasLastMonth} le mois dernier` : 'aucune le mois dernier',
              subColor: '#979797',
            },
            {
              icon: '📊', label: "Taux d'occupation",
              value: `${tauxOccup}%`,
              sub: `${nightsBooked} nuits / ${totalNightsDispo}`,
              subColor: '#979797',
            },
            {
              icon: '🏷️', label: 'Revenu moyen / nuit',
              value: `${revParNuit} €`,
              sub: 'toutes résas',
              subColor: '#979797',
            },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #f0e8da' }}>
              <div className="text-2xl mb-2">{k.icon}</div>
              <div className="font-[var(--font-suez)] text-2xl mb-1" style={{ color: '#00243f' }}>{k.value}</div>
              <div className="text-xs mb-1" style={{ color: '#979797' }}>{k.label}</div>
              <div className="text-xs font-semibold" style={{ color: k.subColor }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Graphe + Top logements ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Graphe 6 mois */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #f0e8da' }}>
            <h2 className="font-semibold text-base mb-4" style={{ color: '#00243f' }}>CA mensuel (6 derniers mois)</h2>
            <RevenueChart data={monthlyRevenue} />
          </div>

          {/* Top logements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #f0e8da' }}>
            <h2 className="font-semibold text-base mb-4" style={{ color: '#00243f' }}>Top logements ce mois</h2>
            {topProps.length === 0 ? (
              <p className="text-sm" style={{ color: '#979797' }}>Aucune réservation ce mois.</p>
            ) : (
              <div className="space-y-4">
                {topProps.map(([propId, rev]) => (
                  <div key={propId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate max-w-[160px] font-medium" style={{ color: '#00243f' }}>
                        {propMap[propId]?.name ?? '—'}
                      </span>
                      <span className="font-bold" style={{ color: '#0097b2' }}>{rev.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: '#f0e8da' }}>
                      <div className="h-2 rounded-full transition-all" style={{
                        width: `${Math.round((rev / maxPropRevenue) * 100)}%`,
                        backgroundColor: '#0097b2',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Check-ins à venir ── */}
        {upcomingCheckins.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm mb-8" style={{ border: '1px solid #f0e8da' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
              <h2 className="font-semibold text-base" style={{ color: '#00243f' }}>🔑 Check-ins à venir (7 jours)</h2>
              <span className="text-xs px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#0097b2' }}>
                {upcomingCheckins.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: '#f0e8da' }}>
              {upcomingCheckins.map(b => {
                const daysUntil = Math.round((new Date(b.check_in).getTime() - now.getTime()) / 86400000)
                return (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                         style={{ backgroundColor: daysUntil === 0 ? '#dc2626' : daysUntil <= 2 ? '#f59e0b' : '#0097b2' }}>
                      <span className="text-lg font-bold leading-none">{new Date(b.check_in).getDate()}</span>
                      <span className="text-[10px] uppercase">{new Date(b.check_in).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#00243f' }}>{b.guest_name}</p>
                      <p className="text-xs truncate" style={{ color: '#979797' }}>
                        {propNameMap[b.property_id] ?? '—'} · {nightsBetween(b.check_in, b.check_out)} nuits · {b.guests} pers.
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold" style={{ color: daysUntil === 0 ? '#dc2626' : '#0097b2' }}>
                        {daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? 'Demain' : `Dans ${daysUntil}j`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Logements avec prix éditables ── */}
        <div className="rounded-2xl bg-white shadow-sm mb-8" style={{ border: '1px solid #f0e8da' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
            <h2 className="font-semibold text-base" style={{ color: '#00243f' }}>🏠 Logements</h2>
            <Link href="./dashboard/logements" className="text-xs font-semibold transition-colors hover:opacity-70"
                  style={{ color: '#0097b2' }}>Voir tous →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#f0e8da' }}>
            {(properties ?? []).map(prop => (
              <PropertyRow key={prop.id} property={prop} />
            ))}
          </div>
        </div>

        {/* ── Demandes en attente ── */}
        <div className="rounded-2xl bg-white shadow-sm" style={{ border: '1px solid #f0e8da' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
            <h2 className="font-semibold text-base" style={{ color: '#00243f' }}>📋 Demandes en attente</h2>
            {(pendingBookings?.length ?? 0) > 0 && (
              <span className="text-xs px-3 py-1 rounded-full text-white" style={{ backgroundColor: '#0097b2' }}>
                {pendingBookings!.length}
              </span>
            )}
          </div>
          <BookingsList bookings={pendingBookings ?? []} properties={propNameMap} />
        </div>

      </div>
    </div>
  )
}
