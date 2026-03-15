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
    setSaving(true); setSaved(false)
    await fetch('/api/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: prop.id, ...updates }),
    })
    setSaving(false); setSaved(true)
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
    <div className="px-4 py-4 md:px-6">
      {/* Ligne 1 : photo + nom + adresse */}
      <div className="flex items-center gap-3 mb-3">
        {prop.cover_image && (
          <img src={prop.cover_image} alt={prop.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug" style={{ color: '#00243f' }}>{prop.name}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: '#979797' }}>{prop.address}</p>
        </div>
      </div>

      {/* Ligne 2 : contrôles */}
      <div className="flex flex-wrap items-center gap-2 pl-0 md:pl-15">

        {/* Prix */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: '#979797' }}>Prix :</span>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            onBlur={handlePriceBlur} placeholder="—" min={0}
            className="w-16 px-2 py-1 text-sm rounded-lg border text-center focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0', color: '#00243f' }} />
          <span className="text-sm" style={{ color: '#979797' }}>€</span>
          {saving && <span className="text-xs" style={{ color: '#0097b2' }}>…</span>}
          {saved && <span className="text-xs font-semibold text-green-600">✓</span>}
        </div>

        {/* iCal */}
        {editIcal ? (
          <div className="flex items-center gap-1 w-full mt-1">
            <input type="text" value={ical} onChange={e => setIcal(e.target.value)}
              placeholder="https://www.airbnb.fr/calendar/ical/..."
              className="flex-1 px-2 py-1 text-xs rounded-lg border focus:outline-none focus:border-[#0097b2]"
              style={{ borderColor: '#0097b2' }} autoFocus />
            <button onClick={handleIcalSave}
              className="px-2 py-1 text-xs rounded-lg text-white flex-shrink-0" style={{ backgroundColor: '#0097b2' }}>✓</button>
            <button onClick={() => { setIcal(prop.ical_url ?? ''); setEditIcal(false) }}
              className="px-2 py-1 text-xs rounded-lg flex-shrink-0" style={{ backgroundColor: '#f0e8da', color: '#979797' }}>✗</button>
          </div>
        ) : (
          <button onClick={() => setEditIcal(true)}
            className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
            title={ical || "Cliquer pour ajouter l'URL iCal"}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ical ? 'bg-green-400' : 'bg-amber-300'}`} />
            <span style={{ color: '#979797' }}>{ical ? 'iCal ✓' : 'iCal'}</span>
          </button>
        )}

        {/* Export iCal */}
        <ExportIcalButton propertyId={prop.id} />

        {/* Règles */}
        <Link href="/conciergori/dashboard/pricing"
          className="text-xs px-2.5 py-1 rounded-lg font-medium hover:opacity-80"
          style={{ backgroundColor: '#fff2e0', color: '#0097b2' }}>
          💰 Règles
        </Link>
      </div>
    </div>
  )
}

// ── Export iCal button ──────────────────────────────────────────────────────
function ExportIcalButton({ propertyId }: { propertyId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://conciergori.fr'}/api/ical/${propertyId}`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy} title={`Copier l'URL iCal export : ${url}`}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium hover:opacity-80 transition-all"
      style={{ backgroundColor: copied ? '#d1fae5' : '#e6f7fa', color: copied ? '#065f46' : '#0097b2' }}>
      {copied ? '✓ Copié !' : '📤 Export iCal'}
    </button>
  )
}
