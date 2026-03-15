'use client'

import { useState } from 'react'

interface Testimonial {
  id: string
  author_name: string
  author_location?: string
  text: string
  rating: number
  visible: boolean
  source: string
}

const SOURCE_LABELS: Record<string, string> = {
  airbnb: '🏠 Airbnb',
  booking: '🌐 Booking',
  google: '🔍 Google',
  direct: '✉️ Direct',
}

export default function TestimonialsManager({ tenantId, initial }: { tenantId: string; initial: Testimonial[] }) {
  const [list, setList] = useState<Testimonial[]>(initial)
  const [adding, setAdding] = useState(false)
  const [newForm, setNewForm] = useState({ author_name: '', author_location: '', text: '', source: 'direct' })
  const [saving, setSaving] = useState(false)

  const toggleVisible = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !t.visible }),
    })
    setList(l => l.map(x => x.id === t.id ? { ...x, visible: !x.visible } : x))
  }

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Supprimer cet avis ?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    setList(l => l.filter(x => x.id !== id))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newForm, tenant_id: tenantId, rating: 5 }),
    })
    const data = await res.json()
    setList(l => [data, ...l])
    setNewForm({ author_name: '', author_location: '', text: '', source: 'direct' })
    setAdding(false)
    setSaving(false)
  }

  const visible = list.filter(t => t.visible).length

  return (
    <div className="space-y-4">
      {/* Header stats + bouton ajouter */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#979797' }}>
          {visible} avis visibles sur {list.length}
        </p>
        <button onClick={() => setAdding(a => !a)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#0097b2' }}>
          {adding ? '✕ Annuler' : '+ Ajouter un avis'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 space-y-4" style={{ border: '2px solid #0097b2' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#00243f' }}>Nouvel avis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Nom *</label>
              <input required value={newForm.author_name} onChange={e => setNewForm(p => ({ ...p, author_name: e.target.value }))}
                     placeholder="Sophie M." className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                     style={{ borderColor: '#e8d8c0' }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Ville</label>
              <input value={newForm.author_location} onChange={e => setNewForm(p => ({ ...p, author_location: e.target.value }))}
                     placeholder="Paris" className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                     style={{ borderColor: '#e8d8c0' }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Avis *</label>
            <textarea required rows={3} value={newForm.text} onChange={e => setNewForm(p => ({ ...p, text: e.target.value }))}
                      placeholder="Texte de l'avis..." className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2] resize-y"
                      style={{ borderColor: '#e8d8c0' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Source</label>
            <select value={newForm.source} onChange={e => setNewForm(p => ({ ...p, source: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                    style={{ borderColor: '#e8d8c0' }}>
              {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-full text-white font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#0097b2' }}>
            {saving ? 'Enregistrement…' : 'Ajouter l\'avis'}
          </button>
        </form>
      )}

      {/* Liste des avis */}
      <div className="space-y-3">
        {list.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-5 transition-opacity"
               style={{ border: '1px solid #f0e8da', opacity: t.visible ? 1 : 0.55 }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: '#00243f' }}>{t.author_name}</span>
                  {t.author_location && (
                    <span className="text-xs" style={{ color: '#979797' }}>📍 {t.author_location}</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f0e8da', color: '#979797' }}>
                    {SOURCE_LABELS[t.source] ?? t.source}
                  </span>
                  <span className="text-xs" style={{ color: '#0097b2' }}>{'★'.repeat(t.rating ?? 5)}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>{t.text}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleVisible(t)} title={t.visible ? 'Masquer' : 'Afficher'}
                        className="p-2 rounded-lg transition-all hover:opacity-80"
                        style={{ backgroundColor: t.visible ? '#d1fae5' : '#f0e8da' }}>
                  {t.visible ? '👁️' : '🙈'}
                </button>
                <button onClick={() => deleteTestimonial(t.id)} title="Supprimer"
                        className="p-2 rounded-lg hover:bg-red-50 transition-all">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
