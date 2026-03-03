'use client'

import { useState, useEffect, useRef } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'
import 'react-day-picker/style.css'

interface BookingFormProps {
  propertyId: string
  maxGuests: number
  basePrice: number
}

export default function BookingForm({ propertyId, maxGuests, basePrice }: BookingFormProps) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState('1')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestAirbnb, setGuestAirbnb] = useState('')
  const [conflictError, setConflictError] = useState<string | null>(null)
  const [pricingRules, setPricingRules] = useState<Array<{
    rule_type: string; params: Record<string,unknown>;
    discount_pct: number|null; markup_pct: number|null; enabled: boolean
  }>>([])
  const [breakdown, setBreakdown] = useState<{
    nights: number; basePrice: number; subtotal: number; finalPrice: number; pricePerNight: number;
    appliedRules: { name: string; effect: string; delta: number }[];
    totalDiscount: number; totalMarkup: number;
  } | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [hasIcal, setHasIcal] = useState(false)
  const [showCal, setShowCal] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/availability?property_id=${propertyId}`)
      .then(r => r.json())
      .then(data => {
        const dates = (data.blocked ?? []).map((s: string) => new Date(s + 'T12:00:00'))
        setBlockedDates(dates)
        setHasIcal(data.hasIcal ?? false)
      })
  }, [propertyId])

  // Fermer le calendrier si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setShowCal(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Charger les règles de prix pour affichage dans le calendrier
  useEffect(() => {
    fetch(`/api/pricing-rules?property_id=${propertyId}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setPricingRules(d.filter((r:{enabled:boolean}) => r.enabled)) : null)
      .catch(() => null)
  }, [propertyId])

  // Calcul du prix d'une nuit selon les règles de période
  const getDayPrice = (day: Date): number | null => {
    if (basePrice <= 0) return null
    let pct = 0
    for (const r of pricingRules) {
      if (r.rule_type === 'period') {
        const from = new Date(r.params.date_from as string)
        const to = new Date(r.params.date_to as string)
        if (day >= from && day <= to) {
          if (r.markup_pct) pct += r.markup_pct
          else if (r.discount_pct) pct -= r.discount_pct
        }
      }
    }
    if (pct === 0) return null // pas de règle → on n'affiche rien (évite le bruit)
    return Math.round(basePrice * (1 + pct / 100))
  }

  // Valider que le range ne contient pas de dates bloquées
  useEffect(() => {
    if (!range?.from || !range?.to) { setConflictError(null); return }
    const blocked = blockedDates.map(d => d.toDateString())
    const current = new Date(range.from)
    current.setDate(current.getDate() + 1) // on exclut check-in et check-out (jours de transition)
    while (current < range.to) {
      if (blocked.includes(current.toDateString())) {
        setConflictError("Ces dates incluent des jours déjà réservés. Veuillez choisir d'autres dates.")
        return
      }
      current.setDate(current.getDate() + 1)
    }
    setConflictError(null)
  }, [range, blockedDates])

  // Calcul du prix dynamique avec règles tarifaires
  useEffect(() => {
    if (!range?.from || !range?.to) { setBreakdown(null); return }
    const checkIn = range.from.toLocaleDateString('sv-SE') // YYYY-MM-DD en local
    const checkOut = range.to.toLocaleDateString('sv-SE')
    fetch(`/api/pricing?property_id=${propertyId}&check_in=${checkIn}&check_out=${checkOut}`)
      .then(r => r.json())
      .then(d => setBreakdown(d.basePrice !== undefined ? d : null))
      .catch(() => setBreakdown(null))
  }, [range, propertyId])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nights = range?.from && range?.to
    ? Math.round((range.to.getTime() - range.from.getTime()) / 86400000)
    : 0
  const total = basePrice > 0 && nights > 0 ? basePrice * nights : null

  const fmt = (d?: Date) => d
    ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!range?.from || !range?.to) return
    setStatus('loading')
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          guest_name: guestName,
          guest_email: guestEmail,
          check_in: range.from.toISOString().split('T')[0],
          check_out: range.to.toISOString().split('T')[0],
          guests,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl p-8 shadow-lg bg-white text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-bold text-lg mb-2" style={{ color: '#00243f' }}>Demande envoyée !</h3>
        <p className="text-sm" style={{ color: '#4b4b4b' }}>Notre équipe vous contactera sous 24h pour confirmer.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl p-6 shadow-lg bg-white" id="reserver">
      {/* Prix */}
      <div className="mb-3">
        {basePrice > 0 ? (
          <>
            {!breakdown && <span className="text-xs font-medium mb-0.5 block" style={{ color: '#979797' }}>À partir de</span>}
            <span className="text-3xl font-bold" style={{ color: '#00243f' }}>{breakdown ? breakdown.pricePerNight : basePrice}€</span>
            <span className="text-sm ml-1" style={{ color: '#979797' }}>/nuit</span>
          </>
        ) : (
          <span className="text-lg font-semibold" style={{ color: '#00243f' }}>Prix sur demande</span>
        )}
      </div>

      {hasIcal && (
        <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: '#979797' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          Disponibilités synchronisées avec Airbnb
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Sélecteur de dates custom */}
        <div className="relative" ref={calRef}>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Dates</label>
          <button type="button"
            onClick={() => setShowCal(!showCal)}
            className="w-full px-3 py-2 rounded-xl border text-sm text-left flex items-center justify-between"
            style={{ borderColor: showCal ? '#0097b2' : '#e8d8c0' }}>
            <span style={{ color: range?.from ? '#00243f' : '#979797' }}>
              {range?.from
                ? range.to
                  ? `${fmt(range.from)} → ${fmt(range.to)}`
                  : `${fmt(range.from)} → …`
                : 'Sélectionner les dates'}
            </span>
            <span style={{ color: '#979797' }}>📅</span>
          </button>

          {showCal && (
            <div className="absolute z-50 left-0 mt-2 rounded-2xl shadow-2xl bg-white border overflow-hidden"
              style={{ borderColor: '#e8d8c0', minWidth: 300 }}>
              <style>{`
                .rdp { --rdp-accent-color: #0097b2; --rdp-accent-background-color: #e0f5f9; font-family: inherit; }
                .rdp-root { padding: 16px; }
                .rdp-month { padding-top: 8px; }
                .rdp-month_caption { padding: 0 0 8px 0; }
                .rdp-nav { padding: 0 4px; }
                .rdp-day_button { border-radius: 50%; }
                .rdp-selected .rdp-day_button { background: #0097b2 !important; color: white; }
                .rdp-range_middle .rdp-day_button { background: #e0f5f9 !important; color: #00243f; border-radius: 0; }
                .rdp-range_start .rdp-day_button, .rdp-range_end .rdp-day_button { background: #0097b2 !important; color: white; }
                .rdp-disabled .rdp-day_button {
                  color: #e07070 !important;
                  text-decoration: line-through;
                  text-decoration-color: #e07070;
                  background: #fff0f0 !important;
                  cursor: not-allowed;
                  opacity: 1 !important;
                  font-weight: 500;
                }
              `}</style>
              <DayPicker
                locale={fr}
                mode="range"
                selected={range}
                onSelect={(r) => {
                  setRange(r)
                  // Fermer uniquement quand les deux dates sont sélectionnées
                  // et que ce n'est pas juste un reset (même date from/to)
                  if (r?.from && r?.to && r.from.getTime() !== r.to.getTime()) {
                    setTimeout(() => setShowCal(false), 150)
                  }
                }}
                components={{
                  Day: ({ day, modifiers, ...props }) => {
                    const price = getDayPrice(day.date)
                    const isBlocked = modifiers.disabled
                    const isSelected = modifiers.selected
                    const isRange = modifiers.range_middle
                    return (
                      <td {...props} className={props.className}>
                        <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[2.5rem]">
                          <span className={`text-sm ${isBlocked ? 'line-through opacity-40' : ''}`}>
                            {day.date.getDate()}
                          </span>
                          {price && !isBlocked && (
                            <span className="text-[9px] leading-tight font-medium"
                              style={{ color: isSelected || isRange ? 'rgba(255,255,255,0.85)' : price > basePrice ? '#dc2626' : '#16a34a' }}>
                              {price}€
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  }
                }}
                disabled={[
                  { before: today },
                  ...blockedDates.map(d => ({ from: d, to: d }))
                ]}
                fromMonth={today}
                numberOfMonths={1}
              />
              {blockedDates.length > 0 && (
                <div className="px-4 pb-3 flex items-center gap-2 text-xs" style={{ color: '#979797' }}>
                  <span className="inline-block w-4 h-4 rounded text-center leading-4" style={{ background: '#fafafa', border: '1px solid #eee', textDecoration: 'line-through', fontSize: 10 }}>5</span>
                  Date non disponible
                </div>
              )}
            </div>
          )}
        </div>

        {/* Résumé */}
        {nights > 0 && (
          <div className="px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: '#fff2e0' }}>
            {nights} nuit{nights > 1 ? 's' : ''}
            {total ? <span className="float-right font-bold" style={{ color: '#00243f' }}>{total}€</span> : null}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Voyageurs</label>
          <select value={guests} onChange={e => setGuests(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }}>
            {Array.from({ length: maxGuests }, (_, i) => (
              <option key={i+1} value={i+1}>{i+1} voyageur{i+1 > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Votre nom</label>
          <input type="text" placeholder="Prénom Nom" required value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0' }} />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Email</label>
          <input type="email" placeholder="vous@email.com" required value={guestEmail}
            onChange={e => setGuestEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0' }} />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>
            Téléphone <span className="font-normal text-xs" style={{ color: '#979797' }}>(facultatif)</span>
          </label>
          <input type="tel" placeholder="+33 6 00 00 00 00" value={guestPhone}
            onChange={e => setGuestPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0' }} />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>
            Profil Airbnb <span className="font-normal text-xs" style={{ color: '#979797' }}>(facultatif — accélère la confirmation)</span>
          </label>
          <input type="url" placeholder="https://www.airbnb.fr/users/show/..." value={guestAirbnb}
            onChange={e => setGuestAirbnb(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-[#0097b2]"
            style={{ borderColor: '#e8d8c0' }} />
        </div>

        {status === 'error' && <p className="text-xs text-red-500">{errorMsg}</p>}

        {conflictError && (
          <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            ⚠️ {conflictError}
          </div>
        )}

        {/* Récapitulatif prix */}
        {breakdown && breakdown.nights > 0 && (
          <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#fff2e0' }}>
            <div className="flex justify-between mb-1" style={{ color: '#4b4b4b' }}>
              <span>{breakdown.pricePerNight}€/nuit × {breakdown.nights} nuit{breakdown.nights > 1 ? 's' : ''}</span>
              <span>{breakdown.finalPrice}€</span>
            </div>
            {breakdown.appliedRules.filter(r => r.delta !== 0 && r.delta < 0).map((r, i) => (
              <div key={i} className="flex justify-between mb-1" style={{ color: '#16a34a' }}>
                <span>{r.name}</span>
                <span>{r.delta}€</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t mt-2" style={{ borderColor: '#e8d8c0', color: '#00243f' }}>
              <span>Total</span>
              <span>{breakdown.finalPrice}€</span>
            </div>
          </div>
        )}

        <button type="submit"
          disabled={status === 'loading' || !range?.from || !range?.to || !!conflictError || (range?.from && range?.to && range.from.getTime() === range.to.getTime())}
          className="w-full py-3 rounded-full text-white font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{ backgroundColor: '#0097b2' }}>
          {status === 'loading' ? 'Envoi en cours…' : 'Envoyer une demande'}
        </button>
        <p className="text-xs text-center" style={{ color: '#979797' }}>Sans engagement · Confirmation sous 24h</p>
      </form>
    </div>
  )
}
