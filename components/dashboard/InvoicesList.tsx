'use client'

import { useState } from 'react'

interface Invoice {
  id: string
  invoice_number: string
  property_name: string
  guest_name: string
  check_in: string
  check_out: string
  total: number
  status: 'draft' | 'sent' | 'paid'
  created_at: string
}

interface Booking {
  id: string
  guest_name: string
  property_id: string
  check_in: string
  check_out: string
  status: string
  total_price: number
}

interface ProfileLine {
  description: string
  quantity: number
  unit_price: number
}

interface InvoiceProfile {
  id: string
  property_id: string | null
  name: string
  lines: ProfileLine[]
}

interface InvoicesListProps {
  initialInvoices: Invoice[]
  confirmedBookings: Booking[]
  properties: Record<string, string>
  tenantId: string
  initialProfiles?: InvoiceProfile[]
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Brouillon', color: '#92400e', bg: '#fef3c7' },
  sent:  { label: 'Envoyée',   color: '#1e40af', bg: '#dbeafe' },
  paid:  { label: 'Payée',     color: '#065f46', bg: '#d1fae5' },
}

// ─── Generate Row ─────────────────────────────────────────────────────────────

function GenerateRow({
  booking,
  properties,
  tenantId,
  profiles,
  onGenerated,
}: {
  booking: Booking
  properties: Record<string, string>
  tenantId: string
  profiles: InvoiceProfile[]
  onGenerated: (inv: Invoice) => void
}) {
  const [profileId, setProfileId] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Profils compatibles : tous logements ou ce logement précis
  const compatibleProfiles = profiles.filter(
    p => !p.property_id || p.property_id === booking.property_id
  )

  const generate = async () => {
    setGenerating(true); setError('')
    try {
      const body: Record<string, unknown> = { tenant_id: tenantId, booking_id: booking.id }
      if (profileId) body.profile_id = profileId
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      onGenerated(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#00243f' }}>{booking.guest_name}</p>
        <p className="text-xs text-gray-400">
          {properties[booking.property_id] || '—'} ·{' '}
          {new Date(booking.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          {' → '}
          {new Date(booking.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
      <span className="text-sm font-semibold hidden sm:block" style={{ color: '#00243f' }}>
        {booking.total_price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
      </span>

      {/* Select profil */}
      {compatibleProfiles.length > 0 && (
        <select
          value={profileId}
          onChange={e => setProfileId(e.target.value)}
          className="text-xs border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none max-w-[180px]"
          style={{ borderColor: '#e9e3da', color: '#00243f' }}
        >
          <option value="">Profil par défaut</option>
          {compatibleProfiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      )}

      <button
        onClick={generate}
        disabled={generating}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-60 flex-shrink-0"
        style={{ backgroundColor: '#0097b2' }}
      >
        {generating ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : '🧾'}
        {generating ? 'Génération…' : 'Générer'}
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoicesList({
  initialInvoices,
  confirmedBookings,
  properties,
  tenantId,
  initialProfiles = [],
}: InvoicesListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

  const handleGenerated = (inv: Invoice) => setInvoices(prev => [inv, ...prev])

  return (
    <div className="space-y-8">

      {/* ── Générer une facture ── */}
      {confirmedBookings.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9e3da' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#e9e3da' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#00243f' }}>
              Générer une facture — réservations confirmées
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: '#f3ede4' }}>
            {confirmedBookings.map(b => (
              <GenerateRow
                key={b.id}
                booking={b}
                properties={properties}
                tenantId={tenantId}
                profiles={initialProfiles}
                onGenerated={handleGenerated}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Liste des factures ── */}
      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9e3da' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e9e3da' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#00243f' }}>Factures générées</h3>
          <span className="text-xs text-gray-400">{invoices.length} au total</span>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-sm text-gray-400">Aucune facture générée pour le moment</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#f3ede4' }}>
                    {['N° Facture', 'Logement', 'Voyageur', 'Dates', 'Total', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f9f5f0' }}>
                  {invoices.map(inv => {
                    const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                    return (
                      <tr key={inv.id} className="hover:bg-[#fdfaf7] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold" style={{ color: '#0097b2' }}>{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-[140px] truncate">{inv.property_name}</td>
                        <td className="px-6 py-4 font-medium" style={{ color: '#00243f' }}>{inv.guest_name}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(inv.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {' – '}
                          {new Date(inv.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: '#00243f' }}>
                          {inv.total?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`/api/invoices/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-[#f0fbfd]"
                            style={{ borderColor: '#0097b2', color: '#0097b2' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                            Voir PDF
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: '#f3ede4' }}>
              {invoices.map(inv => {
                const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                return (
                  <div key={inv.id} className="px-6 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold" style={{ color: '#0097b2' }}>{inv.invoice_number}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    </div>
                    <p className="font-medium text-sm" style={{ color: '#00243f' }}>{inv.guest_name}</p>
                    <p className="text-xs text-gray-400">{inv.property_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(inv.check_in).toLocaleDateString('fr-FR')} – {new Date(inv.check_out).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: '#00243f' }}>
                        {inv.total?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                    <a
                      href={`/api/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border"
                      style={{ borderColor: '#0097b2', color: '#0097b2' }}
                    >
                      Voir PDF
                    </a>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
