'use client'

import { useState } from 'react'

interface GuestMemoProps {
  bookingId: string
  initialRating: number | null
  initialMemo: string | null
  airbnbUrl: string | null
}

export default function GuestMemo({ bookingId, initialRating, initialMemo, airbnbUrl }: GuestMemoProps) {
  const [rating, setRating] = useState<number>(initialRating ?? 0)
  const [memo, setMemo] = useState<string>(initialMemo ?? '')
  const [hover, setHover] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch('/api/bookings/' + bookingId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host_rating: rating || null, host_memo: memo || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f0e8da' }}>
      <div className="flex items-start gap-4 flex-wrap">

        {/* Profil Airbnb */}
        {airbnbUrl && (
          <a href={airbnbUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: '#fff2e0', color: '#0097b2' }}>
            🔗 Voir profil Airbnb
          </a>
        )}

        {/* Étoiles */}
        <div className="flex items-center gap-1">
          <span className="text-xs mr-1" style={{ color: '#979797' }}>Note perso :</span>
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star}
              onClick={() => setRating(star === rating ? 0 : star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="text-lg transition-transform hover:scale-110"
              title={`${star} étoile${star > 1 ? 's' : ''}`}>
              <span style={{ color: star <= (hover || rating) ? '#f59e0b' : '#e8d8c0' }}>★</span>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs ml-1" style={{ color: '#979797' }}>
              {['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent'][rating]}
            </span>
          )}
        </div>

        {/* Mémo */}
        <div className="flex-1 min-w-48">
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            onBlur={save}
            placeholder="Mémo privé… (ex: client difficile, très propre, à recontacter)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border text-xs resize-none focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0', color: '#4b4b4b' }}
          />
        </div>

        {/* Sauvegarde manuelle étoiles */}
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 text-xs rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#0097b2' }}>
            {saving ? '…' : 'Sauvegarder'}
          </button>
          {saved && <span className="text-xs text-green-600 font-semibold">✓</span>}
        </div>
      </div>
    </div>
  )
}
