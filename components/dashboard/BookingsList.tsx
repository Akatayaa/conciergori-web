'use client'

import { useState } from 'react'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  check_in: string
  check_out: string
  total_price: number | null
  status: string
  created_at: string
  property_id: string
}

interface BookingsListProps {
  bookings: Booking[]
  properties: Record<string, string>
}

export default function BookingsList({ bookings, properties }: BookingsListProps) {
  const [list, setList] = useState(bookings)
  const [updating, setUpdating] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch('/api/bookings/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setList(l => l.map(b => b.id === id ? { ...b, status } : b).filter(b => b.status === 'pending'))
    setUpdating(null)
  }

  if (!list.length) return (
    <div className="px-6 py-10 text-center" style={{ color: '#979797' }}>
      <p className="text-4xl mb-3">📭</p>
      <p className="text-sm">Aucune demande en attente</p>
    </div>
  )

  return (
    <div className="divide-y" style={{ borderColor: '#f0e8da' }}>
      {list.map(b => {
        const nights = Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000)
        const checkIn = new Date(b.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        const checkOut = new Date(b.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        return (
          <div key={b.id} className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm" style={{ color: '#00243f' }}>{b.guest_name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fff2e0', color: '#979797' }}>
                  {nights} nuit{nights > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#979797' }}>
                {checkIn} → {checkOut} · {properties[b.property_id] ?? 'Logement'}
              </p>
              <a href={`mailto:${b.guest_email}`} className="text-xs hover:underline" style={{ color: '#0097b2' }}>
                {b.guest_email}
              </a>
            </div>
            {b.total_price && (
              <p className="font-bold flex-shrink-0" style={{ color: '#00243f' }}>{b.total_price}€</p>
            )}
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => updateStatus(b.id, 'confirmed')}
                disabled={updating === b.id}
                className="px-3 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-50"
                style={{ backgroundColor: '#0097b2' }}>
                ✓ Confirmer
              </button>
              <button onClick={() => updateStatus(b.id, 'cancelled')}
                disabled={updating === b.id}
                className="px-3 py-1.5 text-xs rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: '#f0e8da', color: '#979797' }}>
                ✗ Refuser
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
