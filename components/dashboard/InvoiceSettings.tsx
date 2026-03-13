'use client'

import { useState } from 'react'

interface Fee {
  name: string
  amount: number
  enabled: boolean
}

interface Settings {
  tenant_id: string
  concierge_rate: number
  fees: Fee[]
  invoice_prefix: string
  company_name: string
  company_address: string
  company_siret: string
  company_email: string
  company_phone: string
}

export default function InvoiceSettings({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState<Settings>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // ── Handlers ──────────────────────────────────────────────────────────────

  const updateField = (key: keyof Settings, value: unknown) =>
    setSettings(s => ({ ...s, [key]: value }))

  const updateFee = (i: number, patch: Partial<Fee>) =>
    setSettings(s => ({ ...s, fees: s.fees.map((f, idx) => idx === i ? { ...f, ...patch } : f) }))

  const addFee = () =>
    setSettings(s => ({ ...s, fees: [...s.fees, { name: '', amount: 0, enabled: true }] }))

  const removeFee = (i: number) =>
    setSettings(s => ({ ...s, fees: s.fees.filter((_, idx) => idx !== i) }))

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/invoice-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Taux de conciergerie */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: '#e9e3da' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#00243f' }}>Commission conciergerie</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={settings.concierge_rate}
              onChange={e => updateField('concierge_rate', parseFloat(e.target.value))}
              className="border rounded-xl px-4 py-2.5 w-28 text-right pr-8 focus:outline-none focus:ring-2"
              style={{ borderColor: '#e9e3da', color: '#00243f' }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
          </div>
          <span className="text-sm text-gray-500">du montant total de la réservation</span>
        </div>
      </section>

      {/* Frais additionnels */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: '#e9e3da' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#00243f' }}>Frais additionnels</h3>
        <div className="space-y-2 mb-4">
          {settings.fees.map((fee, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Toggle */}
              <button
                onClick={() => updateFee(i, { enabled: !fee.enabled })}
                className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                style={{ backgroundColor: fee.enabled ? '#0097b2' : '#e5e7eb' }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                  style={{ transform: fee.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>

              {/* Nom */}
              <input
                type="text"
                value={fee.name}
                onChange={e => updateFee(i, { name: e.target.value })}
                placeholder="Nom du frais"
                className="border rounded-xl px-3 py-2 flex-1 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#e9e3da', color: '#00243f', opacity: fee.enabled ? 1 : 0.5 }}
              />

              {/* Montant */}
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={fee.amount}
                  onChange={e => updateFee(i, { amount: parseFloat(e.target.value) })}
                  className="border rounded-xl px-3 py-2 w-24 text-right pr-6 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e9e3da', color: '#00243f', opacity: fee.enabled ? 1 : 0.5 }}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
              </div>

              {/* Supprimer */}
              <button
                onClick={() => removeFee(i)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addFee}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: '#0097b2' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un frais
        </button>
      </section>

      {/* Infos entreprise */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: '#e9e3da' }}>
        <h3 className="font-semibold mb-4" style={{ color: '#00243f' }}>Informations entreprise</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'company_name',    label: 'Nom / Raison sociale',  col: '2' },
            { key: 'company_address', label: 'Adresse',               col: '2' },
            { key: 'company_siret',   label: 'SIRET',                  col: '1' },
            { key: 'invoice_prefix',  label: 'Préfixe facture (ex: FAC)', col: '1' },
            { key: 'company_email',   label: 'Email',                  col: '1' },
            { key: 'company_phone',   label: 'Téléphone',              col: '1' },
          ].map(({ key, label, col }) => (
            <div key={key} className={col === '2' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">{label}</label>
              <input
                type="text"
                value={(settings as unknown as Record<string, string>)[key] ?? ''}
                onChange={e => updateField(key as keyof Settings, e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#e9e3da', color: '#00243f' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Sauvegarder */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#0097b2' }}
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        {saved && <span className="text-sm text-emerald-600 font-medium">✓ Paramètres sauvegardés</span>}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

    </div>
  )
}
