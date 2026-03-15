'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FIELDS = [
  { key: 'welcome_message', label: '👋 Message de bienvenue', placeholder: 'Bienvenue dans notre appartement ! Nous espérons que...', rows: 3 },
  { key: 'wifi_name', label: '📶 Nom du réseau WiFi', placeholder: 'MonWifi_5G', rows: 1 },
  { key: 'wifi_password', label: '🔑 Mot de passe WiFi', placeholder: 'motdepasse123', rows: 1 },
  { key: 'checkin_instructions', label: '🔓 Instructions d\'arrivée', placeholder: 'La clé est dans la boîte à clés au numéro 1234. Le digicode de l\'entrée est...', rows: 4 },
  { key: 'checkout_instructions', label: '🔒 Instructions de départ', placeholder: 'Merci de laisser les clés sur le bureau, sortir les poubelles...', rows: 3 },
  { key: 'house_rules', label: '📜 Règlement intérieur', placeholder: '- Pas de fête\n- Non-fumeur\n- Respect des voisins après 22h\n- Animaux non admis', rows: 5 },
  { key: 'local_tips', label: '🗺️ Bons plans & recommandations', placeholder: 'Restaurants :\n- Le Bouchon : 12 rue...  \n\nSupermarchés :\n- Carrefour City à 200m...', rows: 6 },
  { key: 'emergency_contact', label: '🆘 Contact d\'urgence', placeholder: 'Oriane : 06 XX XX XX XX\nPlombier urgence : 06 XX XX XX XX\nSAMU : 15 | Police : 17 | Pompiers : 18', rows: 3 },
]

export default function EditLivretPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string>>({})
  const [propertyName, setPropertyName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('properties')
      .select('name, welcome_message, wifi_name, wifi_password, checkin_instructions, checkout_instructions, house_rules, local_tips, emergency_contact')
      .eq('id', params.propertyId as string)
      .single()
      .then(({ data }) => {
        if (data) {
          setPropertyName(data.name)
          const { name: _, ...rest } = data
          setForm(Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v ?? ''])))
        }
      })
  }, [params.propertyId])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('properties').update(form).eq('id', params.propertyId as string)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 hover:opacity-70"
                style={{ color: '#5a5a5a' }}>
          ← Retour
        </button>
        <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
          Livret d&apos;accueil
        </h1>
        <p className="text-sm mb-8" style={{ color: '#979797' }}>{propertyName}</p>

        <div className="space-y-5">
          {FIELDS.map(({ key, label, placeholder, rows }) => (
            <div key={key} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #f0e8da' }}>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#00243f' }}>{label}</label>
              {rows === 1 ? (
                <input
                  type="text" value={form[key] ?? ''} placeholder={placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                  style={{ borderColor: '#e8d8c0', color: '#4b4b4b' }}
                />
              ) : (
                <textarea
                  rows={rows} value={form[key] ?? ''} placeholder={placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2] resize-y"
                  style={{ borderColor: '#e8d8c0', color: '#4b4b4b' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3.5 rounded-full text-white font-semibold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: '#0097b2' }}>
            {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Enregistrer'}
          </button>
          <a href={`../../livrets/${params.propertyId}/print`} target="_blank"
             className="px-6 py-3.5 rounded-full font-semibold hover:opacity-80 transition-opacity"
             style={{ backgroundColor: '#fff2e0', color: '#00243f' }}>
            🖨️ Imprimer
          </a>
        </div>
      </div>
    </div>
  )
}
