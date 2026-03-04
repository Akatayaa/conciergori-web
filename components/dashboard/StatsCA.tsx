'use client'

interface Booking {
  id: string
  check_in: string
  check_out: string
  status: string
  total_price: number | null
  property_name?: string
}

interface StatsCaProps {
  bookings: Booking[]
  basePrice: Record<string, number> // property_id → base_price
  propNames: Record<string, string>
}

function nights(checkIn: string, checkOut: string) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
}

function estimateRevenue(b: Booking, basePrice: Record<string, string | number>) {
  if (b.total_price) return b.total_price
  // Fallback: base_price × nuits (si pas encore de total stocké)
  return 0
}

export default function StatsCA({ bookings, basePrice, propNames }: StatsCaProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30)
  const in90 = new Date(today); in90.setDate(in90.getDate() + 90)

  const confirmed = bookings.filter(b => b.status === 'confirmed')

  // Nuits totales à venir (confirmées)
  const upcomingNights = confirmed
    .filter(b => new Date(b.check_in) >= today)
    .reduce((s, b) => s + nights(b.check_in, b.check_out), 0)

  // Revenus confirmés à venir (30j)
  const revenue30 = confirmed
    .filter(b => new Date(b.check_in) >= today && new Date(b.check_in) <= in30)
    .reduce((s, b) => s + (b.total_price ?? 0), 0)

  // Revenus confirmés à venir (90j)
  const revenue90 = confirmed
    .filter(b => new Date(b.check_in) >= today && new Date(b.check_in) <= in90)
    .reduce((s, b) => s + (b.total_price ?? 0), 0)

  // Revenus du mois en cours (check_in ce mois)
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const revenueThisMonth = confirmed
    .filter(b => new Date(b.check_in) >= thisMonth && new Date(b.check_in) < nextMonth)
    .reduce((s, b) => s + (b.total_price ?? 0), 0)

  // Prochaines arrivées
  const nextArrivals = confirmed
    .filter(b => new Date(b.check_in) >= today)
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())
    .slice(0, 5)

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  const stats = [
    { label: 'CA ce mois', value: revenueThisMonth > 0 ? `${revenueThisMonth}€` : '—', icon: '📅', sub: new Date().toLocaleString('fr-FR', { month: 'long' }) },
    { label: 'CA 30 prochains jours', value: revenue30 > 0 ? `${revenue30}€` : '—', icon: '📈', sub: `${confirmed.filter(b => new Date(b.check_in) >= today && new Date(b.check_in) <= in30).length} résa` },
    { label: 'CA 90 prochains jours', value: revenue90 > 0 ? `${revenue90}€` : '—', icon: '🔭', sub: `${confirmed.filter(b => new Date(b.check_in) >= today && new Date(b.check_in) <= in90).length} résa` },
    { label: 'Nuits confirmées à venir', value: `${upcomingNights}`, icon: '🌙', sub: 'toutes dates' },
  ]

  return (
    <div className="space-y-6">
      {/* Grille stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 bg-white shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-bold font-[var(--font-suez)]" style={{ color: '#00243f' }}>{s.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#4b4b4b' }}>{s.label}</p>
            <p className="text-xs mt-0.5" style={{ color: '#979797' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Prochaines arrivées */}
      {nextArrivals.length > 0 && (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#00243f' }}>✈️ Prochaines arrivées</h3>
          </div>
          <div className="divide-y" style={{ borderColor: '#f9f6f1' }}>
            {nextArrivals.map(b => {
              const n = nights(b.check_in, b.check_out)
              const daysUntil = Math.round((new Date(b.check_in).getTime() - today.getTime()) / 86400000)
              return (
                <div key={b.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#00243f' }}>
                      {propNames[b.id] ?? b.property_name ?? '—'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#979797' }}>
                      {fmt(b.check_in)} → {fmt(b.check_out)} · {n} nuit{n > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    {b.total_price ? (
                      <p className="text-sm font-bold" style={{ color: '#00243f' }}>{b.total_price}€</p>
                    ) : null}
                    <p className="text-xs" style={{ color: daysUntil <= 3 ? '#dc2626' : daysUntil <= 7 ? '#f59e0b' : '#979797' }}>
                      {daysUntil === 0 ? "Aujourd'hui !" : daysUntil === 1 ? 'Demain' : `Dans ${daysUntil}j`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
