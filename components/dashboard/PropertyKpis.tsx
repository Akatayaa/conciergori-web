interface Props {
  caMonth: number
  nbResasMonth: number
  tauxOccup: number
  nextCheckin: string | null
}

export default function PropertyKpis({ caMonth, nbResasMonth, tauxOccup, nextCheckin }: Props) {
  const nextCheckinLabel = nextCheckin
    ? new Date(nextCheckin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '—'

  const daysUntil = nextCheckin
    ? Math.round((new Date(nextCheckin).getTime() - new Date().getTime()) / 86400000)
    : null

  const nextLabel = daysUntil === null ? '—'
    : daysUntil === 0 ? "Aujourd'hui"
    : daysUntil === 1 ? 'Demain'
    : `${nextCheckinLabel} (${daysUntil}j)`

  return (
    <div className="flex flex-wrap gap-4 text-xs">
      <Kpi icon="💰" label="CA ce mois" value={`${caMonth.toLocaleString('fr-FR')} €`} />
      <Kpi icon="📅" label="Résas ce mois" value={String(nbResasMonth)} />
      <Kpi icon="📊" label="Taux occupation" value={`${tauxOccup}%`}
           color={tauxOccup >= 70 ? '#16a34a' : tauxOccup >= 40 ? '#f59e0b' : '#dc2626'} />
      <Kpi icon="🔑" label="Prochain check-in" value={nextLabel}
           color={daysUntil !== null && daysUntil <= 2 ? '#dc2626' : '#00243f'} />
    </div>
  )
}

function Kpi({ icon, label, value, color = '#00243f' }: { icon: string; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#f0e8da' }}>
      <span>{icon}</span>
      <span style={{ color: '#979797' }}>{label} :</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  )
}
