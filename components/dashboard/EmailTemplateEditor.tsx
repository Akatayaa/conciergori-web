'use client'

import { useState } from 'react'

interface Template {
  id?: string
  subject: string
  body_html: string
}

interface Props {
  tenantId: string
  type: string
  label: string
  description: string
  initial: Template | null
}

const DEFAULT_BODY = `<h2>Bonjour {{guest_name}},</h2>
<p>Votre réservation est bien confirmée ! 🎉</p>

<table style="border-collapse:collapse;width:100%;margin:20px 0">
  <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f;width:140px">Logement</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">{{property_name}}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f">Arrivée</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">{{checkin_date}}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f">Départ</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">{{checkout_date}}</td></tr>
  <tr><td style="padding:10px;border-bottom:1px solid #e8d8c0;font-weight:bold;color:#00243f">Voyageurs</td><td style="padding:10px;border-bottom:1px solid #e8d8c0">{{guests}} personne(s)</td></tr>
  <tr><td style="padding:10px;font-weight:bold;color:#00243f">Total</td><td style="padding:10px;font-weight:bold;color:#0097b2">{{total_price}} €</td></tr>
</table>

<p>Nous vous enverrons les instructions d'accès quelques jours avant votre arrivée.</p>

<p style="margin-top:32px">À très bientôt en Normandie,<br><strong>Notre équipe</strong></p>`

export default function EmailTemplateEditor({ tenantId, type, label, description, initial }: Props) {
  const [subject, setSubject] = useState(initial?.subject ?? 'Votre réservation est confirmée — {{property_name}}')
  const [body, setBody] = useState(initial?.body_html ?? DEFAULT_BODY)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testSent, setTestSent] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/email-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, type, subject, body_html: body }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleTestSend = async () => {
    if (!testEmail) return
    setSendingTest(true)
    await fetch('/api/email-templates/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, type, subject, body_html: body, to: testEmail }),
    })
    setSendingTest(false)
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  // Preview : remplacer les variables par des valeurs de démo
  const previewHtml = body
    .replace(/\{\{guest_name\}\}/g, 'Sophie Martin')
    .replace(/\{\{property_name\}\}/g, 'Studio Le Moulin — Caen')
    .replace(/\{\{checkin_date\}\}/g, '28 mars 2025')
    .replace(/\{\{checkout_date\}\}/g, '2 avril 2025')
    .replace(/\{\{guests\}\}/g, '2')
    .replace(/\{\{total_price\}\}/g, '420')

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #f0e8da' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#f0e8da' }}>
        <h2 className="font-semibold text-base" style={{ color: '#00243f' }}>{label}</h2>
        <p className="text-xs mt-0.5" style={{ color: '#979797' }}>{description}</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Objet */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Objet de l&apos;email</label>
          <input value={subject} onChange={e => setSubject(e.target.value)}
                 className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                 style={{ borderColor: '#e8d8c0', color: '#4b4b4b' }} />
        </div>

        {/* Tabs edit/preview */}
        <div>
          <div className="flex gap-2 mb-3">
            {(['edit', 'preview'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={tab === t
                        ? { backgroundColor: '#0097b2', color: 'white' }
                        : { backgroundColor: '#f0e8da', color: '#5a5a5a' }}>
                {t === 'edit' ? '✏️ Éditer' : '👁️ Aperçu'}
              </button>
            ))}
          </div>

          {tab === 'edit' ? (
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={16}
                      className="w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-[#0097b2] resize-y"
                      style={{ borderColor: '#e8d8c0', color: '#4b4b4b', lineHeight: 1.7 }} />
          ) : (
            <div className="rounded-xl border p-6 text-sm" style={{ borderColor: '#e8d8c0', minHeight: '300px' }}
                 dangerouslySetInnerHTML={{ __html: previewHtml }} />
          )}
        </div>

        {/* Envoi test */}
        <div className="flex gap-2">
          <input value={testEmail} onChange={e => setTestEmail(e.target.value)}
                 type="email" placeholder="email@test.com"
                 className="flex-1 px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
                 style={{ borderColor: '#e8d8c0' }} />
          <button onClick={handleTestSend} disabled={sendingTest || !testEmail}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40 whitespace-nowrap"
                  style={{ backgroundColor: '#fff2e0', color: '#00243f' }}>
            {testSent ? '✓ Envoyé !' : sendingTest ? '…' : '📤 Tester'}
          </button>
        </div>

        {/* Enregistrer */}
        <button onClick={handleSave} disabled={saving}
                className="w-full py-3.5 rounded-full text-white font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#0097b2' }}>
          {saving ? 'Enregistrement…' : saved ? '✓ Template sauvegardé !' : 'Enregistrer le template'}
        </button>
      </div>
    </div>
  )
}
