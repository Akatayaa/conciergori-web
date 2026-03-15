'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileLine {
  description: string
  quantity: number
  unit_price: number
}

interface InvoiceProfile {
  id: string
  property_id: string
  name: string
  lines: ProfileLine[]
}

interface Property {
  id: string
  name: string
}

interface InvoiceProfilesProps {
  initialProfiles: InvoiceProfile[]
  properties: Property[]
  tenantId: string
}

// ─── Profile Form ─────────────────────────────────────────────────────────────

function ProfileForm({
  initial,
  properties,
  tenantId,
  onSave,
  onCancel,
}: {
  initial?: InvoiceProfile
  properties: Property[]
  tenantId: string
  onSave: (p: InvoiceProfile) => void
  onCancel: () => void
}) {
  const isEdit = !!initial
  const [propertyId, setPropertyId] = useState(initial?.property_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [lines, setLines] = useState<ProfileLine[]>(
    initial?.lines?.length
      ? initial.lines
      : [{ description: '', quantity: 1, unit_price: 0 }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateLine = (i: number, patch: Partial<ProfileLine>) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l))

  const addLine = () =>
    setLines(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])

  const removeLine = (i: number) =>
    setLines(prev => prev.filter((_, idx) => idx !== i))

  const total = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0)

  const submit = async () => {
    if (!name.trim()) { setError('Le nom est requis'); return }
    setSaving(true); setError('')
    try {
      const body = { property_id: propertyId || null, tenant_id: tenantId, name, lines }
      const res = isEdit
        ? await fetch(`/api/invoice-profiles/${initial!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/invoice-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(await res.text())
      onSave(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: '#e9e3da' }}>
      <h3 className="font-semibold" style={{ color: '#00243f' }}>
        {isEdit ? 'Modifier le profil' : 'Nouveau profil'}
      </h3>

      {/* Logement + Nom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">Logement (optionnel)</label>
          <select
            value={propertyId}
            onChange={e => setPropertyId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2"
            style={{ borderColor: '#e9e3da', color: '#00243f' }}
          >
            <option value="">— Tous les logements —</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-500">Nom du profil *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex : Profil Standard — Studio Cosy"
            className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: '#e9e3da', color: '#00243f' }}
          />
        </div>
      </div>

      {/* Lignes */}
      <div>
        <label className="block text-xs font-medium mb-2 text-gray-500">Lignes de facturation</label>

        {/* En-tête colonnes */}
        <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 mb-1.5 px-1">
          {['Description', 'Qté', 'P.U. (€)', ''].map(h => (
            <span key={h} className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{h}</span>
          ))}
        </div>

        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center">
              <input
                type="text"
                value={line.description}
                onChange={e => updateLine(i, { description: e.target.value })}
                placeholder="Description…"
                className="border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: '#e9e3da', color: '#00243f' }}
              />
              <input
                type="number"
                min={0}
                step={1}
                value={line.quantity}
                onChange={e => updateLine(i, { quantity: parseFloat(e.target.value) || 0 })}
                className="border rounded-lg px-2.5 py-2 text-sm text-right focus:outline-none focus:ring-1"
                style={{ borderColor: '#e9e3da', color: '#00243f' }}
              />
              <input
                type="number"
                min={0}
                step={0.5}
                value={line.unit_price}
                onChange={e => updateLine(i, { unit_price: parseFloat(e.target.value) || 0 })}
                className="border rounded-lg px-2.5 py-2 text-sm text-right focus:outline-none focus:ring-1"
                style={{ borderColor: '#e9e3da', color: '#00243f' }}
              />
              <button
                onClick={() => removeLine(i)}
                disabled={lines.length === 1}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          <button
            onClick={addLine}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: '#0097b2' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Ajouter une ligne
          </button>
          <span className="text-sm font-semibold" style={{ color: '#00243f' }}>
            Total : {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-gray-50"
          style={{ borderColor: '#e9e3da', color: '#666' }}
        >
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#0097b2' }}
        >
          {saving ? 'Sauvegarde…' : isEdit ? 'Enregistrer' : 'Créer le profil'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoiceProfiles({ initialProfiles, properties, tenantId }: InvoiceProfilesProps) {
  const [profiles, setProfiles] = useState<InvoiceProfile[]>(initialProfiles)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const propMap = Object.fromEntries(properties.map(p => [p.id, p.name]))

  const handleSave = (saved: InvoiceProfile) => {
    setProfiles(prev => {
      const exists = prev.find(p => p.id === saved.id)
      return exists ? prev.map(p => p.id === saved.id ? saved : p) : [saved, ...prev]
    })
    setCreating(false)
    setEditingId(null)
  }

  const deleteProfile = async (id: string) => {
    if (!confirm('Supprimer ce profil ?')) return
    setDeleting(id)
    await fetch(`/api/invoice-profiles/${id}`, { method: 'DELETE' })
    setProfiles(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm" style={{ color: '#979797' }}>
          {profiles.length} profil{profiles.length !== 1 ? 's' : ''}
        </p>
        {!creating && (
          <button
            onClick={() => { setCreating(true); setEditingId(null) }}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0097b2' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Nouveau profil
          </button>
        )}
      </div>

      {/* Formulaire création */}
      {creating && (
        <ProfileForm
          properties={properties}
          tenantId={tenantId}
          onSave={handleSave}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Liste */}
      {profiles.length === 0 && !creating ? (
        <div className="bg-white rounded-2xl border p-16 text-center" style={{ borderColor: '#e9e3da' }}>
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-gray-400">Aucun profil de facturation pour le moment</p>
        </div>
      ) : (
        profiles.map(profile => (
          <div key={profile.id}>
            {editingId === profile.id ? (
              <ProfileForm
                initial={profile}
                properties={properties}
                tenantId={tenantId}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                className="bg-white rounded-2xl border p-5 flex items-start justify-between gap-4"
                style={{ borderColor: '#e9e3da' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{ color: '#00243f' }}>{profile.name}</p>
                    {profile.property_id && propMap[profile.property_id] && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ backgroundColor: '#f8f4ee', color: '#00243f' }}
                      >
                        🛏 {propMap[profile.property_id]}
                      </span>
                    )}
                    {!profile.property_id && (
                      <span className="text-xs px-2 py-0.5 rounded-lg text-gray-400" style={{ backgroundColor: '#f3f4f6' }}>
                        Tous logements
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {profile.lines.length} ligne{profile.lines.length !== 1 ? 's' : ''} ·{' '}
                    Total {profile.lines.reduce((s, l) => s + l.quantity * l.unit_price, 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                  {/* Aperçu lignes */}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    {profile.lines.slice(0, 3).map((l, i) => (
                      <span key={i} className="text-xs text-gray-500">
                        {l.description || 'Ligne'} × {l.quantity} — {(l.quantity * l.unit_price).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    ))}
                    {profile.lines.length > 3 && (
                      <span className="text-xs text-gray-400">+{profile.lines.length - 3} autre{profile.lines.length - 3 > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setEditingId(profile.id); setCreating(false) }}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteProfile(profile.id)}
                    disabled={deleting === profile.id}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
