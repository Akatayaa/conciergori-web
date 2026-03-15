import { notFound } from 'next/navigation'

interface MonthData { label: string; value: number }

interface UpcomingBooking {
  check_in: string; check_out: string; status: string; nights: number
}

interface PropertyWithStats {
  id: string; name: string; cover_image?: string
  stats: { ownerMonth: number; ownerTotal: number; totalNights: number }
  upcoming: UpcomingBooking[]
  monthlyRevenue: MonthData[]
}

interface PortalData {
  owner: { name: string; owner_commission: number }
  properties: PropertyWithStats[]
}

async function getPortalData(token: string, appUrl: string): Promise<PortalData | null> {
  try {
    const res = await fetch(`${appUrl}/api/owner-portal?token=${token}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

function MiniChart({ data }: { data: MonthData[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-20 mt-4">
      {data.map((d, i) => {
        const isLast = i === data.length - 1
        const pct = Math.max(Math.round((d.value / max) * 100), 4)
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md" style={{
              height: `${pct}%`, minHeight: '4px',
              backgroundColor: isLast ? '#0097b2' : '#e6f7fa',
            }} />
            <span className="text-[10px] capitalize" style={{ color: isLast ? '#0097b2' : '#979797' }}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export default async function ProprietairePage({
  params, searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const [, { token }] = await Promise.all([params, searchParams])
  if (!token) return notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const data = await getPortalData(token, appUrl)
  if (!data) return notFound()

  const { owner, properties } = data
  const totalOwnerMonth = properties.reduce((s, p) => s + p.stats.ownerMonth, 0)
  const totalOwnerTotal = properties.reduce((s, p) => s + p.stats.ownerTotal, 0)
  const totalNights = properties.reduce((s, p) => s + p.stats.totalNights, 0)
  const monthNow = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen font-[var(--font-quicksand)]" style={{ backgroundColor: '#fff2e0' }}>

      {/* Header */}
      <header className="sticky top-0 z-10" style={{ backgroundColor: '#00243f' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-[var(--font-suez)] text-xl text-white">
              Concierg<span style={{ color: '#73c7d6' }}>&apos;ori</span>
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Espace propriétaire</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm text-white">{owner.name}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{owner.owner_commission}% reversé</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Titre */}
        <div>
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Bonjour, {owner.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>Tableau de bord · {monthNow}</p>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '📅', label: 'Ce mois (vous)', value: fmt(totalOwnerMonth) },
            { icon: '💰', label: 'Total cumulé', value: fmt(totalOwnerTotal) },
            { icon: '🌙', label: 'Nuits confirmées', value: `${totalNights}` },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-4 text-center"
                 style={{ border: '1px solid #e8d8c0', boxShadow: '0 2px 8px rgba(0,36,63,0.06)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="font-[var(--font-suez)] text-xl mb-1" style={{ color: '#00243f' }}>{k.value}</div>
              <div className="text-xs" style={{ color: '#979797' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Rappel commission */}
        <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#e6f7fa', border: '1px solid #b2e4ed' }}>
          <span style={{ color: '#00243f' }}>ℹ️ </span>
          <span style={{ color: '#5a5a5a' }}>
            Vous percevez <strong style={{ color: '#0097b2' }}>{owner.owner_commission}%</strong> des revenus générés par vos logements.
            Les virements sont effectués chaque mois.
          </span>
        </div>

        {/* Logements */}
        {properties.map(prop => (
          <div key={prop.id} className="bg-white rounded-2xl overflow-hidden"
               style={{ border: '1px solid #e8d8c0', boxShadow: '0 2px 12px rgba(0,36,63,0.06)' }}>

            {/* Photo */}
            {prop.cover_image ? (
              <div className="h-44 overflow-hidden">
                <img src={prop.cover_image} alt={prop.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-4xl"
                   style={{ backgroundColor: '#e6f7fa' }}>🏠</div>
            )}

            <div className="p-5">
              <h2 className="font-semibold text-lg mb-4" style={{ color: '#00243f' }}>{prop.name}</h2>

              {/* Stats logement */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Ce mois', value: fmt(prop.stats.ownerMonth) },
                  { label: 'Total', value: fmt(prop.stats.ownerTotal) },
                  { label: 'Nuits', value: `${prop.stats.totalNights}` },
                ].map(s => (
                  <div key={s.label} className="text-center py-3 rounded-xl"
                       style={{ backgroundColor: '#f8f4ee' }}>
                    <p className="font-bold text-base" style={{ color: '#00243f' }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#979797' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Graphe 6 mois */}
              {prop.monthlyRevenue && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#979797' }}>
                    Vos revenus — 6 derniers mois
                  </p>
                  <MiniChart data={prop.monthlyRevenue} />
                </>
              )}

              {/* Séparateur */}
              <div className="border-t my-5" style={{ borderColor: '#f0e8da' }} />

              {/* Prochaines réservations */}
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#979797' }}>
                Prochaines réservations
              </p>
              {prop.upcoming.length === 0 ? (
                <p className="text-sm italic" style={{ color: '#979797' }}>Aucune réservation à venir</p>
              ) : (
                <div className="space-y-2">
                  {prop.upcoming.map((b, i) => {
                    const daysUntil = Math.round((new Date(b.check_in).getTime() - Date.now()) / 86400000)
                    return (
                      <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3"
                           style={{ backgroundColor: '#f8f4ee' }}>
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#5a5a5a' }}>
                          <span>📅</span>
                          <span>
                            {new Date(b.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            {' → '}
                            {new Date(b.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-xs" style={{ color: '#979797' }}>{b.nights} nuit{b.nights > 1 ? 's' : ''}</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: daysUntil <= 3 ? '#fef3c7' : '#d1fae5',
                                color: daysUntil <= 3 ? '#92400e' : '#065f46',
                              }}>
                          {daysUntil === 0 ? "Auj." : daysUntil === 1 ? 'Demain' : `Dans ${daysUntil}j`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: '1px solid #e8d8c0', marginTop: '40px' }}>
        <p className="text-xs" style={{ color: '#979797' }}>
          Propulsé par{' '}
          <a href="https://conciergori.fr" style={{ color: '#0097b2', fontWeight: 600 }}>Concierg&apos;ori</a>
          {' '}· Caen, Normandie
        </p>
      </footer>
    </div>
  )
}
