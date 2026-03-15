'use client'

interface DataPoint { label: string; value: number }

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const H = 120
  const W = 100 / data.length

  return (
    <div>
      {/* Barres */}
      <div className="flex items-end gap-2 h-32 mb-2">
        {data.map((d, i) => {
          const pct = Math.round((d.value / max) * 100)
          const isLast = i === data.length - 1
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              {d.value > 0 && (
                <span className="text-[10px] font-semibold" style={{ color: isLast ? '#0097b2' : '#979797' }}>
                  {d.value >= 1000 ? `${Math.round(d.value / 100) / 10}k` : d.value}€
                </span>
              )}
              <div className="w-full rounded-t-lg transition-all duration-500"
                   style={{
                     height: `${Math.max(pct, 4)}%`,
                     backgroundColor: isLast ? '#0097b2' : '#e6f7fa',
                     minHeight: '4px',
                   }} />
            </div>
          )
        })}
      </div>
      {/* Labels */}
      <div className="flex gap-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 text-center text-[11px] capitalize"
               style={{ color: i === data.length - 1 ? '#0097b2' : '#979797', fontWeight: i === data.length - 1 ? 600 : 400 }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
