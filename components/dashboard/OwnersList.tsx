'use client'

import { useState } from 'react'

interface Owner {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  owner_commission: number
  portal_token: string
  owner_properties?: { property_id: string }[]
}

interface Property {
  id: string
  name: string
}

interface OwnersListProps {
  initialOwners: Owner[]
  properties: Property[]
  tenantId: string
  tenantSlug: string
  appUrl: string
}

// ── Modale ────────────────────────────────────────────────────────────────────

function OwnerModal({
  owner,
  properties,
  onClose,
  onSave,
}: {
  owner?: Owner
  properties: Property[]
  onClose: () => void
  onSave: (owner: Owner) => void
}) {
  const isEdit = !!owner
  const [form, setForm] = useState({
    name:             owner?.name             ?? '',
    email:            owner?.email            ?? '',
    phone:            owner?.phone            ?? '',
    notes:            owner?.notes            ?? '',
    owner_commission: owner?.owner_commission ?? 80,
    property_ids:     owner?.owner_properties?.map(op => op.property_id) ?? [],
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const toggleProperty = (pid: string) =>
    setForm(f => ({
      ...f,
      property_ids: f.property_ids.includes(pid)
        ? f.property_ids.filter(id => id !== pid)
        : [...f.property_ids, pid],
    }))

  const submit = async () => {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setSaving(true); setError('')
    try {
      const res = isEdit
        ? await fetch(`/api/owners/${owner!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
        : await fetch('/api/owners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, tenant_id: (window as unknown as Record<string, string>).__TENANT_ID__ }),
          })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      onSave(isEdit ? { ...owner!, ...form, ...data } : data)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b" style={{ borderColor: '#e9e3da' }}>
          <h2 className="font-semibold text-lg" style={{ color: '#00243f' }}>
            {isEdit ? 'Modifier le propriétaire' : 'Ajouter un propriétaire'}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Champs texte */}
          {[
            { key: 'name',  label: 'Nom *',     type: 'text',  placeholder: 'Marie Dupont' },
            { key: 'email', label: 'Email',      type: 'email', placeholder: 'marie@email.com' },
            { key: 'phone', label: 'Téléphone',  type: 'tel',   placeholder: '+33 6 12 34 56 78' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">{label}</label>
              <input
                type={type}
                value={(form as Record<string, unknown>)[key] as string}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#e9e3da', color: '#00243f' }}
              />
            </div>
          ))}

          {/* % reversé */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">% reversé au propriétaire</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number" min={0} max={100} step={1}
                  value={form.owner_commission}
                  onChange={e => setForm(f => ({ ...f, owner_commission: parseFloat(e.target.value) }))}
                  className="border rounded-xl px-3 py-2.5 w-28 text-right pr-8 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e9e3da', color: '#00243f' }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
              </div>
              <span className="text-sm text-gray-500">du CA total des réservations</span>
            </div>
          </div>

          {/* Logements */}
          {properties.length > 0 && (
            <div>
              <label className="block text-xs font-medium mb-2 text-gray-500">Logements assignés</label>
              <div className="space-y-2">
                {properties.map(p => (
                  <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        borderColor: form.property_ids.includes(p.id) ? '#0097b2' : '#d1d5db',
                        backgroundColor: form.property_ids.includes(p.id) ? '#0097b2' : 'white',
                      }}
                      onClick={() => toggleProperty(p.id)}
                    >
                      {form.property_ids.includes(p.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm" style={{ color: '#00243f' }}>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-500">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Notes internes..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2"
              style={{ borderColor: '#e9e3da', color: '#00243f' }}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: '#e9e3da' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
            style={{ borderColor: '#e9e3da', color: '#666' }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#0097b2' }}
          >
            {saving ? 'Sauvegarde…' : isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OwnersList({
  initialOwners,
  properties,
  tenantId,
  tenantSlug,
  appUrl,
}: OwnersListProps) {
  const [owners,       setOwners]       = useState<Owner[]>(initialOwners)
  const [showModal,    setShowModal]    = useState(false)
  const [editingOwner, setEditingOwner] = useState<Owner | undefined>()
  const [copied,       setCopied]       = useState<string | null>(null)
  const [deleting,     setDeleting]     = useState<string | null>(null)

  // Injecter tenant_id pour la modale (sans passer en prop)
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, string>).__TENANT_ID__ = tenantId
  }

  const portalUrl = (token: string) =>
    `${appUrl}/${tenantSlug}/proprietaire?token=${token}`

  const copyLink = async (token: string, id: string) => {
    await navigator.clipboard.writeText(portalUrl(token))
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSave = (saved: Owner) => {
    setOwners(prev => {
      const exists = prev.find(o => o.id === saved.id)
      return exists ? prev.map(o => o.id === saved.id ? saved : o) : [saved, ...prev]
    })
  }

  const deleteOwner = async (id: string) => {
    if (!confirm('Supprimer ce propriétaire ?')) return
    setDeleting(id)
    await fetch(`/api/owners/${id}`, { method: 'DELETE' })
    setOwners(prev => prev.filter(o => o.id !== id))
    setDeleting(null)
  }

  const propMap = Object.fromEntries(properties.map(p => [p.id, p.name]))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: '#979797' }}>
          {owners.length} propriétaire{owners.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => { setEditingOwner(undefined); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#0097b2' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un propriétaire
        </button>
      </div>

      {/* Liste */}
      {owners.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-16 text-center" style={{ borderColor: '#e9e3da' }}>
          <p className="text-4xl mb-3">🏠</p>
          <p className="text-gray-400 text-sm">Aucun propriétaire pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {owners.map(owner => {
            const assignedProps = (owner.owner_properties || [])
              .map(op => propMap[op.property_id])
              .filter(Boolean)

            return (
              <div
                key={owner.id}
                className="bg-white rounded-2xl shadow-sm border p-5"
                style={{ borderColor: '#e9e3da' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ backgroundColor: '#00243f' }}
                  >
                    {owner.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold" style={{ color: '#00243f' }}>{owner.name}</h3>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#e0f7fa', color: '#0097b2' }}
                      >
                        {owner.owner_commission}% reversé
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      {owner.email && <span>📧 {owner.email}</span>}
                      {owner.phone && <span>📞 {owner.phone}</span>}
                    </div>
                    {assignedProps.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {assignedProps.map(name => (
                          <span
                            key={name}
                            className="text-xs px-2 py-0.5 rounded-lg"
                            style={{ backgroundColor: '#f8f4ee', color: '#00243f' }}
                          >
                            🛏 {name}
                          </span>
                        ))}
                      </div>
                    )}
                    {owner.notes && (
                      <p className="mt-2 text-xs text-gray-400 italic">{owner.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyLink(owner.portal_token, owner.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors hover:bg-[#f0fbfd]"
                      style={{ borderColor: '#0097b2', color: '#0097b2' }}
                      title="Copier le lien du portal"
                    >
                      {copied === owner.id ? (
                        <>✓ Copié !</>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"/>
                          </svg>
                          Copier lien
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setEditingOwner(owner); setShowModal(true) }}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteOwner(owner.id)}
                      disabled={deleting === owner.id}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modale */}
      {showModal && (
        <OwnerModal
          owner={editingOwner}
          properties={properties}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
