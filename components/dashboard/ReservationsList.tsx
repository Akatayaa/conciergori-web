'use client'
import GuestMemo from './GuestMemo'

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
  guests?: number
  guest_phone?: string
  guest_airbnb_url?: string
  host_rating?: number | null
  host_memo?: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'En attente',  color: '#b45309', bg: '#fef3c7' },
  confirmed: { label: 'Confirmée',   color: '#065f46', bg: '#d1fae5' },
  cancelled: { label: 'Annulée',     color: '#991b1b', bg: '#fee2e2' },
}

export default function ReservationsList({
  bookings,
  properties,
}: {
  bookings: Booking[]
  properties: Record<string, string>
}) {
  const [list, setList] = useState(bookings)
  const [filter, setFilter] = useState<string>('all')
  const [propFilter, setPropFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await fetch('/api/bookings/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setList(l => l.map(b => b.id === id ? { ...b, status } : b))
    setUpdating(null)
  }

  const filtered = list.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    if (propFilter !== 'all' && b.property_id !== propFilter) return false
    if (search && !b.guest_name.toLowerCase().includes(search.toLowerCase()) &&
        !b.guest_email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    all: list.length,
    pending: list.filter(b => b.status === 'pending').length,
    confirmed: list.filter(b => b.status === 'confirmed').length,
    cancelled: list.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div>
      {/* Barre recherche */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#979797' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
          style={{ borderColor: '#e8d8c0', color: '#4b4b4b' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
        )}
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all', label: `Toutes (${counts.all})` },
          { key: 'pending', label: `En attente (${counts.pending})` },
          { key: 'confirmed', label: `Confirmées (${counts.confirmed})` },
          { key: 'cancelled', label: `Annulées (${counts.cancelled})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={filter === f.key
              ? { backgroundColor: '#00243f', color: 'white' }
              : { backgroundColor: '#f0e8da', color: '#979797' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Filtre logement */}
      <div className="mb-6">
        <select value={propFilter} onChange={e => setPropFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border" style={{ borderColor: '#e8d8c0', color: '#4b4b4b' }}>
          <option value="all">Tous les logements</option>
          {Object.entries(properties).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center" style={{ color: '#979797' }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">Aucune réservation dans cette catégorie</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#f0e8da' }}>
            {filtered.map(b => {
              const nights = Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000)
              const checkIn = new Date(b.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
              const checkOut = new Date(b.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
              const createdAt = new Date(b.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              const st = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending

              return (
                <div key={b.id} className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Ligne 1: nom + statut */}
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm" style={{ color: '#00243f' }}>{b.guest_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      {/* Ligne 2: logement + dates */}
                      <p className="text-xs mb-1" style={{ color: '#4b4b4b' }}>
                        {properties[b.property_id] ?? 'Logement inconnu'}
                      </p>
                      <p className="text-xs" style={{ color: '#979797' }}>
                        📅 {checkIn} → {checkOut} · {nights} nuit{nights > 1 ? 's' : ''}
                        {b.guests ? ` · ${b.guests} voyageur${Number(b.guests) > 1 ? 's' : ''}` : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <a href={`mailto:${b.guest_email}`}
                          className="text-xs hover:underline" style={{ color: '#0097b2' }}>
                          {b.guest_email}
                        </a>
                        {b.guest_phone && (
                          <>
                            <span className="text-xs" style={{ color: '#e8d8c0' }}>·</span>
                            <a href={`tel:${b.guest_phone}`} className="text-xs hover:underline" style={{ color: '#0097b2' }}>
                              {b.guest_phone}
                            </a>
                          </>
                        )}
                        <span className="text-xs" style={{ color: '#e8d8c0' }}>·</span>
                        <span className="text-xs" style={{ color: '#979797' }}>Reçu le {createdAt}</span>
                      </div>
                    </div>

                    {/* Prix + actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {b.total_price && (
                        <p className="font-bold text-base" style={{ color: '#00243f' }}>{b.total_price}€</p>
                      )}
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
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
                      )}
                    </div>
                  </div>
                  {/* Mémo hôte — visible sur toutes les résa */}
                  <GuestMemo
                    bookingId={b.id}
                    initialRating={b.host_rating ?? null}
                    initialMemo={b.host_memo ?? null}
                    airbnbUrl={b.guest_airbnb_url ?? null}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
