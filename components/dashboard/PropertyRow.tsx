'use client'
import Link from 'next/link'
import { useState } from 'react'

interface PropertyRowProps {
  property: {
    id: string
    name: string
    address: string
    cover_image: string | null
    base_price: number | null
    ical_url: string | null
  }
}

export default function PropertyRow({ property: prop }: PropertyRowProps) {
  const [price, setPrice] = useState<string>(prop.base_price?.toString() ?? '')
  const [ical, setIcal] = useState<string>(prop.ical_url ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editIcal, setEditIcal] = useState(false)

  const save = async (updates: { base_price?: number; ical_url?: string }) => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: prop.id, ...updates }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePriceBlur = () => {
    const val = parseFloat(price)
    if (!isNaN(val) && val > 0 && val !== prop.base_price) save({ base_price: val })
  }

  const handleIcalSave = () => {
    if (ical !== prop.ical_url) save({ ical_url: ical })
    setEditIcal(false)
  }

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      {prop.cover_image && (
        <img src={prop.cover_image} alt={prop.name}
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: '#00243f' }}>{prop.name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#979797' }}>{prop.address}</p>
      </div>

      {/* Prix + iCal sur une même ligne */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Prix */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: '#979797' }}>Prix :</span>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            onBlur={handlePriceBlur}
            placeholder="—"
            min={0}
            className="w-20 px-2 py-1 text-sm rounded-lg border text-center transition-colors focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0', color: '#00243f' }}
          />
          <span className="text-sm font-medium" style={{ color: '#979797' }}>€</span>
          {saving && <span className="text-xs" style={{ color: '#0097b2' }}>…</span>}
          {saved && <span className="text-xs font-semibold text-green-600">✓</span>}
        </div>

        <span style={{ color: '#e8d8c0' }}>|</span>

        {/* iCal */}
        {editIcal ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={ical}
              onChange={e => setIcal(e.target.value)}
              placeholder="https://www.airbnb.fr/calendar/ical/..."
              className="w-48 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:border-[#0097b2]"
              style={{ borderColor: '#0097b2' }}
              autoFocus
            />
            <button onClick={handleIcalSave}
              className="px-2 py-1 text-xs rounded-lg text-white" style={{ backgroundColor: '#0097b2' }}>✓</button>
            <button onClick={() => { setIcal(prop.ical_url ?? ''); setEditIcal(false) }}
              className="px-2 py-1 text-xs rounded-lg" style={{ backgroundColor: '#f0e8da', color: '#979797' }}>✗</button>
          </div>
        ) : (
          <button onClick={() => setEditIcal(true)}
            className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
            title={ical || "Cliquer pour ajouter l'URL iCal"}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ical ? 'bg-green-400' : 'bg-amber-300'}`} />
            <span style={{ color: '#979797' }}>{ical ? 'iCal ✓' : 'Ajouter iCal'}</span>
          </button>
        )}
        <Link href="/conciergori/dashboard/pricing"
          className="ml-3 text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80"
          style={{ backgroundColor: '#fff2e0', color: '#0097b2' }}>
          💰 Règles de prix
        </Link>
      </div>
    </div>
  )
}
