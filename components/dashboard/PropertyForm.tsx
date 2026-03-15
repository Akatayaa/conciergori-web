'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  tenantId: string
  tenantSlug: string
  initial?: {
    id?: string
    name?: string
    address?: string
    base_price?: number
    max_guests?: number
    bedrooms?: number
    bathrooms?: number
    description?: string
    ical_url?: string
    airbnb_url?: string
    cover_image?: string
  }
}

export default function PropertyForm({ tenantId, tenantSlug, initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial?.id

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    base_price: String(initial?.base_price ?? ''),
    max_guests: String(initial?.max_guests ?? '2'),
    bedrooms: String(initial?.bedrooms ?? '1'),
    bathrooms: String(initial?.bathrooms ?? '1'),
    description: initial?.description ?? '',
    ical_url: initial?.ical_url ?? '',
    airbnb_url: initial?.airbnb_url ?? '',
    cover_image: initial?.cover_image ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      tenant_id: tenantId,
      base_price: form.base_price ? Number(form.base_price) : null,
      max_guests: Number(form.max_guests),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
    }

    const url = isEdit ? `/api/properties/${initial!.id}` : '/api/properties'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la sauvegarde')
      setSaving(false)
      return
    }

    router.push(`/${tenantSlug}/dashboard/logements`)
    router.refresh()
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2] transition-colors"
  const inputStyle = { borderColor: '#e8d8c0', color: '#4b4b4b', backgroundColor: 'white' }
  const labelCls = "block text-xs font-semibold mb-1.5"
  const labelStyle = { color: '#00243f' }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Nom */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0e8da' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: '#00243f' }}>📋 Informations générales</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>Nom du logement *</label>
            <input required value={form.name} onChange={set('name')} placeholder="Studio Le Moulin — Caen"
                   className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Adresse *</label>
            <input required value={form.address} onChange={set('address')} placeholder="12 rue de la Paix, 14000 Caen"
                   className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Description</label>
            <textarea rows={4} value={form.description} onChange={set('description')}
                      placeholder="Décrivez le logement : emplacement, style, points forts..."
                      className={inputCls + ' resize-y'} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Capacité & prix */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0e8da' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: '#00243f' }}>🛏 Capacité & tarif</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: 'base_price', label: 'Prix / nuit (€)', placeholder: '80', type: 'number' },
            { key: 'max_guests', label: 'Voyageurs max', placeholder: '4', type: 'number' },
            { key: 'bedrooms', label: 'Chambres', placeholder: '1', type: 'number' },
            { key: 'bathrooms', label: 'Salles de bain', placeholder: '1', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className={labelCls} style={labelStyle}>{f.label}</label>
              <input type={f.type} min={0} value={form[f.key as keyof typeof form]} onChange={set(f.key)}
                     placeholder={f.placeholder} className={inputCls} style={inputStyle} />
            </div>
          ))}
        </div>
      </div>

      {/* Liens & sync */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0e8da' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: '#00243f' }}>🔗 Liens & synchronisation</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls} style={labelStyle}>URL Airbnb</label>
            <input value={form.airbnb_url} onChange={set('airbnb_url')}
                   placeholder="https://www.airbnb.fr/rooms/..."
                   className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>URL iCal Airbnb (synchronisation calendrier)</label>
            <input value={form.ical_url} onChange={set('ical_url')}
                   placeholder="https://www.airbnb.fr/calendar/ical/..."
                   className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Photo de couverture (URL)</label>
            <input value={form.cover_image} onChange={set('cover_image')}
                   placeholder="https://..."
                   className={inputCls} style={inputStyle} />
            {form.cover_image && (
              <img src={form.cover_image} alt="aperçu" className="mt-2 h-32 rounded-xl object-cover" />
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => router.back()}
                className="flex-1 py-3.5 rounded-full font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#f0e8da', color: '#5a5a5a' }}>
          Annuler
        </button>
        <button type="submit" disabled={saving}
                className="flex-1 py-3.5 rounded-full text-white font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#0097b2' }}>
          {saving ? 'Enregistrement…' : isEdit ? '✓ Mettre à jour' : '+ Créer le logement'}
        </button>
      </div>
    </form>
  )
}
