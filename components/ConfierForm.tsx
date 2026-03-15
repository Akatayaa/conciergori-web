'use client'

import { useState } from 'react'

export default function ConfierForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', nb_properties: '1', message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16 px-6 rounded-2xl bg-white" style={{ border: '1px solid #e8d8c0' }}>
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-[var(--font-suez)] text-2xl mb-3" style={{ color: '#00243f' }}>
          Message envoyé !
        </h3>
        <p style={{ color: '#5a5a5a' }}>
          On revient vers vous sous 48h pour discuter de votre projet.
        </p>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: '1px solid #e8d8c0', fontSize: '14px', outline: 'none',
    backgroundColor: 'white', color: '#00243f',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-2xl"
          style={{ border: '1px solid #e8d8c0', boxShadow: '0 4px 24px rgba(0,36,63,0.06)' }}>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Nom complet *</label>
          <input name="name" required value={form.name} onChange={handleChange}
                 placeholder="Jean Dupont" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Email *</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange}
                 placeholder="jean@exemple.com" style={inputStyle} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Téléphone</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                 placeholder="06 12 34 56 78" style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Nb de logements</label>
          <select name="nb_properties" value={form.nb_properties} onChange={handleChange} style={inputStyle}>
            <option value="1">1 logement</option>
            <option value="2">2 logements</option>
            <option value="3">3 logements</option>
            <option value="4+">4 logements ou plus</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Adresse du bien *</label>
        <input name="address" required value={form.address} onChange={handleChange}
               placeholder="12 rue de la Paix, Caen" style={inputStyle} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#00243f' }}>Votre message</label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                  placeholder="Décrivez votre bien, votre situation actuelle, vos attentes..."
                  style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600 text-center">Une erreur est survenue. Réessayez ou écrivez-nous directement.</p>
      )}

      <button type="submit" disabled={status === 'loading'}
              className="w-full py-3.5 rounded-full text-white font-semibold transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#0097b2', fontSize: '15px' }}>
        {status === 'loading' ? 'Envoi en cours…' : 'Envoyer ma demande →'}
      </button>

      <p className="text-xs text-center" style={{ color: '#979797' }}>
        Réponse garantie sous 48h · Aucun engagement
      </p>
    </form>
  )
}
