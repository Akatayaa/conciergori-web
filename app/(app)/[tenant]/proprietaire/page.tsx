import { notFound } from 'next/navigation'

interface UpcomingBooking {
  check_in: string
  check_out: string
  status: string
  nights: number
}

interface PropertyWithStats {
  id: string
  name: string
  cover_image?: string
  stats: {
    ownerMonth: number
    ownerTotal: number
    totalNights: number
  }
  upcoming: UpcomingBooking[]
}

interface PortalData {
  owner: { name: string; owner_commission: number }
  properties: PropertyWithStats[]
}

async function getPortalData(token: string, appUrl: string): Promise<PortalData | null> {
  try {
    const res = await fetch(`${appUrl}/api/owner-portal?token=${token}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ProprietairePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const [{ tenant: tenantSlug }, { token }] = await Promise.all([params, searchParams])

  if (!token) return notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const data = await getPortalData(token, appUrl)
  if (!data) return notFound()

  const { owner, properties } = data
  const totalOwnerRevenue = properties.reduce((s, p) => s + p.stats.ownerTotal, 0)
  const totalNights        = properties.reduce((s, p) => s + p.stats.totalNights, 0)

  const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff2e0' }}>

      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10" style={{ borderColor: '#e9e3da' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Concierg'ori" className="h-8 w-8" />
            <div>
              <p className="font-[var(--font-suez)] text-sm leading-tight" style={{ color: '#00243f' }}>
                Concierg&apos;ori
              </p>
              <p className="text-xs text-gray-400">Espace propriétaire</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm" style={{ color: '#00243f' }}>{owner.name}</p>
            <p className="text-xs text-gray-400">{owner.owner_commission}% reversé</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* Résumé global */}
        <section>
          <h2 className="font-[var(--font-suez)] text-2xl mb-5" style={{ color: '#00243f' }}>
            Bonjour, {owner.name.split(' ')[0]} 👋
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Revenus ce mois',  value: fmt(properties.reduce((s, p) => s + p.stats.ownerMonth, 0)), icon: '📅' },
              { label: 'Revenus totaux',   value: fmt(totalOwnerRevenue), icon: '💰' },
              { label: 'Nuits confirmées', value: `${totalNights} nuit${totalNights !== 1 ? 's' : ''}`, icon: '🌙' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: '#e9e3da' }}>
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-xl font-bold" style={{ color: '#00243f' }}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Logements */}
        <section className="space-y-5">
          <h3 className="font-semibold text-base" style={{ color: '#00243f' }}>
            Vos logements
          </h3>

          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border" style={{ borderColor: '#e9e3da' }}>
              <p className="text-gray-400 text-sm">Aucun logement assigné pour le moment</p>
            </div>
          ) : (
            properties.map(prop => (
              <div key={prop.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9e3da' }}>
                {/* Cover */}
                {prop.cover_image ? (
                  <div className="h-40 w-full overflow-hidden">
                    <img src={prop.cover_image} alt={prop.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center" style={{ backgroundColor: '#f8f4ee' }}>
                    <span className="text-3xl">🏠</span>
                  </div>
                )}

                <div className="p-5">
                  <h4 className="font-semibold text-lg mb-4" style={{ color: '#00243f' }}>{prop.name}</h4>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Ce mois',     value: fmt(prop.stats.ownerMonth) },
                      { label: 'Total',        value: fmt(prop.stats.ownerTotal) },
                      { label: 'Nuits conf.', value: `${prop.stats.totalNights}` },
                    ].map(s => (
                      <div key={s.label} className="text-center rounded-xl py-3 px-2" style={{ backgroundColor: '#f8f4ee' }}>
                        <p className="font-bold text-base" style={{ color: '#00243f' }}>{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Prochaines réservations */}
                  {prop.upcoming.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                        Prochaines réservations
                      </p>
                      <div className="space-y-2">
                        {prop.upcoming.map((b, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm"
                            style={{ backgroundColor: '#f8f4ee' }}
                          >
                            <div className="flex items-center gap-2 text-gray-600">
                              <span>📅</span>
                              <span>
                                {new Date(b.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                {' → '}
                                {new Date(b.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className="text-xs text-gray-400">
                                {b.nights} nuit{b.nights !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: '#d1fae5', color: '#065f46' }}
                            >
                              Confirmée
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prop.upcoming.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Aucune réservation à venir</p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 text-center" style={{ borderColor: '#e9e3da' }}>
        <p className="text-xs text-gray-400">
          Propulsé par{' '}
          <a href="https://conciergori.fr" className="font-semibold hover:underline" style={{ color: '#0097b2' }}>
            Concierg&apos;ori
          </a>
        </p>
      </footer>

    </div>
  )
}
