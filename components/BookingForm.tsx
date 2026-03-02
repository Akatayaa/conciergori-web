'use client'

import { useState } from 'react'

interface BookingFormProps {
  propertyId: string
  maxGuests: number
  basePrice: number
}

export default function BookingForm({ propertyId, maxGuests, basePrice }: BookingFormProps) {
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', check_in: '', check_out: '', guests: '1'
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const nights = form.check_in && form.check_out
    ? Math.max(0, Math.round((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000))
    : 0

  const total = basePrice > 0 && nights > 0 ? basePrice * nights : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (status === 'success') {
    return (
      <div className="rounded-3xl p-8 shadow-lg bg-white text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-bold text-lg mb-2" style={{ color: '#00243f' }}>Demande envoyée !</h3>
        <p className="text-sm" style={{ color: '#4b4b4b' }}>
          Oriane vous contactera sous 24h pour confirmer.
        </p>
        <p className="text-xs mt-3" style={{ color: '#979797' }}>
          Un email de confirmation vous a été envoyé.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 shadow-lg bg-white" id="reserver">
      {/* Prix */}
      <div className="mb-4">
        {basePrice > 0 ? (
          <><span className="text-3xl font-bold" style={{ color: '#00243f' }}>{basePrice}€</span>
          <span className="text-sm ml-1" style={{ color: '#979797' }}>/nuit</span></>
        ) : (
          <span className="text-lg font-semibold" style={{ color: '#00243f' }}>Prix sur demande</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Arrivée</label>
            <input type="date" min={today} required
              value={form.check_in}
              onChange={e => setForm(f => ({ ...f, check_in: e.target.value, check_out: '' }))}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
              style={{ borderColor: '#e8d8c0' }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Départ</label>
            <input type="date" min={form.check_in || today} required
              value={form.check_out}
              onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
              style={{ borderColor: '#e8d8c0' }} />
          </div>
        </div>

        {/* Résumé nuits + prix */}
        {nights > 0 && (
          <div className="px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: '#fff2e0' }}>
            {nights} nuit{nights > 1 ? 's' : ''}
            {total ? <span className="float-right font-bold" style={{ color: '#00243f' }}>{total}€</span> : null}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Voyageurs</label>
          <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }}>
            {Array.from({ length: maxGuests }, (_, i) => (
              <option key={i+1} value={i+1}>{i+1} voyageur{i+1 > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Votre nom</label>
          <input type="text" placeholder="Prénom Nom" required
            value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0' }} />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Email</label>
          <input type="email" placeholder="vous@email.com" required
            value={form.guest_email} onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0' }} />
        </div>

        {status === 'error' && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}

        <button type="submit" disabled={status === 'loading'}
          className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#0097b2' }}>
          {status === 'loading' ? 'Envoi en cours…' : 'Envoyer une demande'}
        </button>
        <p className="text-xs text-center" style={{ color: '#979797' }}>
          Sans engagement · Confirmation sous 24h
        </p>
      </form>
    </div>
  )
}
