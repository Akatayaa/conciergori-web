'use client'

import { useState } from 'react'

type RuleType = 'last_minute' | 'period' | 'long_stay' | 'floor_price'

interface PricingRule {
  id: string
  name: string
  rule_type: RuleType
  params: Record<string, unknown>
  discount_pct: number | null
  markup_pct: number | null
  floor_price: number | null
  priority: number
  enabled: boolean
}

interface PricingRulesProps {
  propertyId: string
  propertyName: string
  initialRules: PricingRule[]
}

const RULE_LABELS: Record<RuleType, { label: string; icon: string; desc: string }> = {
  last_minute: { label: 'Dernière minute', icon: '⚡', desc: 'Réduction si la réservation est faite peu avant le séjour' },
  period:       { label: 'Période',         icon: '📅', desc: 'Supplément ou réduction sur une période de dates' },
  long_stay:    { label: 'Séjour long',     icon: '🌙', desc: 'Réduction à partir d\'un certain nombre de nuits' },
  floor_price:  { label: 'Prix plancher',   icon: '🔒', desc: 'Prix minimum en dessous duquel le tarif ne peut pas descendre' },
}

const emptyForm = {
  name: '',
  rule_type: 'last_minute' as RuleType,
  days_before: 3,
  discount_pct: 15,
  markup_pct: 0,
  floor_price: 0,
  date_from: '',
  date_to: '',
  min_nights: 7,
  priority: 5,
}

export default function PricingRules({ propertyId, propertyName, initialRules }: PricingRulesProps) {
  const [rules, setRules] = useState<PricingRule[]>(initialRules)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const buildRule = () => {
    const base = {
      property_id: propertyId,
      name: form.name || RULE_LABELS[form.rule_type].label,
      rule_type: form.rule_type,
      priority: form.priority,
      enabled: true,
      params: {} as Record<string, unknown>,
      discount_pct: null as number | null,
      markup_pct: null as number | null,
      floor_price: null as number | null,
    }
    if (form.rule_type === 'last_minute') {
      base.params = { days_before: form.days_before }
      base.discount_pct = form.discount_pct
    } else if (form.rule_type === 'period') {
      base.params = { date_from: form.date_from, date_to: form.date_to }
      if (form.markup_pct > 0) base.markup_pct = form.markup_pct
      else base.discount_pct = form.discount_pct
    } else if (form.rule_type === 'long_stay') {
      base.params = { min_nights: form.min_nights }
      base.discount_pct = form.discount_pct
    } else if (form.rule_type === 'floor_price') {
      base.floor_price = form.floor_price
    }
    return base
  }

  const saveRule = async () => {
    setSaving(true)
    const rule = buildRule()
    const res = await fetch('/api/pricing-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    })
    const saved = await res.json()
    setRules(r => [...r, saved])
    setShowForm(false)
    setForm(emptyForm)
    setSaving(false)
  }

  const toggleRule = async (id: string, enabled: boolean) => {
    setRules(r => r.map(rule => rule.id === id ? { ...rule, enabled } : rule))
    await fetch(`/api/pricing-rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })
  }

  const deleteRule = async (id: string) => {
    if (!confirm('Supprimer cette règle ?')) return
    setRules(r => r.filter(rule => rule.id !== id))
    await fetch(`/api/pricing-rules/${id}`, { method: 'DELETE' })
  }

  const describeRule = (r: PricingRule) => {
    if (r.rule_type === 'last_minute')
      return `−${r.discount_pct}% si réservation ≤ ${(r.params.days_before as number)} jours avant`
    if (r.rule_type === 'period') {
      const from = r.params.date_from as string
      const to = r.params.date_to as string
      const val = r.markup_pct ? `+${r.markup_pct}%` : `−${r.discount_pct}%`
      return `${val} du ${from} au ${to}`
    }
    if (r.rule_type === 'long_stay')
      return `−${r.discount_pct}% à partir de ${(r.params.min_nights as number)} nuits`
    if (r.rule_type === 'floor_price')
      return `Prix minimum : ${r.floor_price}€/nuit`
    return ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[var(--font-alkatra)] text-lg font-bold" style={{ color: '#00243f' }}>
          Règles de prix — <span className="font-normal text-base" style={{ color: '#979797' }}>{propertyName}</span>
        </h3>
        <button onClick={() => setShowForm(s => !s)}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: '#0097b2' }}>
          + Ajouter une règle
        </button>
      </div>

      {/* Liste des règles */}
      {rules.length === 0 && !showForm && (
        <p className="text-sm py-4 text-center" style={{ color: '#979797' }}>
          Aucune règle configurée. Cliquez sur "+ Ajouter" pour commencer.
        </p>
      )}

      <div className="space-y-2 mb-4">
        {rules.map(r => (
          <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl border"
            style={{ borderColor: '#e8d8c0', backgroundColor: r.enabled ? '#fff' : '#f9f6f1', opacity: r.enabled ? 1 : 0.6 }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{RULE_LABELS[r.rule_type]?.icon ?? '📌'}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#00243f' }}>{r.name}</p>
                <p className="text-xs" style={{ color: '#979797' }}>{describeRule(r)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleRule(r.id, !r.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.enabled ? 'bg-[#0097b2]' : 'bg-gray-300'}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${r.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
              <button onClick={() => deleteRule(r.id)}
                className="text-xs px-2 py-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="p-5 rounded-2xl border" style={{ borderColor: '#e8d8c0', backgroundColor: '#fff8f0' }}>
          <h4 className="font-semibold mb-4 text-sm" style={{ color: '#00243f' }}>Nouvelle règle</h4>

          {/* Type */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(Object.entries(RULE_LABELS) as [RuleType, typeof RULE_LABELS[RuleType]][]).map(([type, info]) => (
              <button key={type} onClick={() => set('rule_type', type)}
                className={`flex items-start gap-2 p-3 rounded-xl border text-left text-xs transition-all ${form.rule_type === type ? 'border-[#0097b2] bg-white' : 'border-transparent bg-white/60'}`}
                style={{ borderColor: form.rule_type === type ? '#0097b2' : '#e8d8c0' }}>
                <span className="text-lg">{info.icon}</span>
                <div>
                  <p className="font-semibold" style={{ color: '#00243f' }}>{info.label}</p>
                  <p style={{ color: '#979797' }}>{info.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Nom (optionnel) */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>
              Nom <span style={{ color: '#979797' }}>(optionnel)</span>
            </label>
            <input type="text" placeholder={RULE_LABELS[form.rule_type].label}
              value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
              style={{ borderColor: '#e8d8c0' }} />
          </div>

          {/* Champs selon le type */}
          {form.rule_type === 'last_minute' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Délai (jours avant)</label>
                <input type="number" min={1} max={30} value={form.days_before}
                  onChange={e => set('days_before', +e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                  style={{ borderColor: '#e8d8c0' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Réduction (%)</label>
                <input type="number" min={1} max={80} value={form.discount_pct}
                  onChange={e => set('discount_pct', +e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                  style={{ borderColor: '#e8d8c0' }} />
              </div>
            </div>
          )}

          {form.rule_type === 'period' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Du</label>
                  <input type="date" value={form.date_from} onChange={e => set('date_from', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                    style={{ borderColor: '#e8d8c0' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Au</label>
                  <input type="date" value={form.date_to} onChange={e => set('date_to', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                    style={{ borderColor: '#e8d8c0' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Supplément (%)</label>
                  <input type="number" min={0} max={300} value={form.markup_pct}
                    onChange={e => set('markup_pct', +e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                    style={{ borderColor: '#e8d8c0' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>OU Réduction (%)</label>
                  <input type="number" min={0} max={80} value={form.discount_pct}
                    onChange={e => set('discount_pct', +e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                    style={{ borderColor: '#e8d8c0' }} />
                </div>
              </div>
            </div>
          )}

          {form.rule_type === 'long_stay' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>À partir de (nuits)</label>
                <input type="number" min={2} max={30} value={form.min_nights}
                  onChange={e => set('min_nights', +e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                  style={{ borderColor: '#e8d8c0' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Réduction (%)</label>
                <input type="number" min={1} max={50} value={form.discount_pct}
                  onChange={e => set('discount_pct', +e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                  style={{ borderColor: '#e8d8c0' }} />
              </div>
            </div>
          )}

          {form.rule_type === 'floor_price' && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Prix minimum (€/nuit)</label>
              <input type="number" min={1} value={form.floor_price}
                onChange={e => set('floor_price', +e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                style={{ borderColor: '#e8d8c0' }} />
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button onClick={saveRule} disabled={saving}
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: '#00243f' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer la règle'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm) }}
              className="px-4 py-2 rounded-xl text-sm"
              style={{ color: '#979797' }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
