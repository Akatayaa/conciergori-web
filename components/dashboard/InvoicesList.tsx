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

interface InvoicesListProps {
  initialInvoices: Invoice[]
  confirmedBookings: Booking[]
  properties: Record<string, string>
  tenantId: string
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Brouillon', color: '#92400e', bg: '#fef3c7' },
  sent:  { label: 'Envoyée',   color: '#1e40af', bg: '#dbeafe' },
  paid:  { label: 'Payée',     color: '#065f46', bg: '#d1fae5' },
}

export default function InvoicesList({
  initialInvoices,
  confirmedBookings,
  properties,
  tenantId,
}: InvoicesListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Bookings qui n'ont pas encore de facture
  const invoicedBookingIds = new Set(
    invoices.map(inv => inv.id) // note: on compara par booking_id si disponible
  )
  // On affiche tous les confirmed (la vérification précise se fait côté serveur)
  const billableBookings = confirmedBookings

  const generateInvoice = async (bookingId: string) => {
    setGenerating(bookingId)
    setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId, booking_id: bookingId }),
      })
      if (!res.ok) throw new Error(await res.text())
      const newInvoice = await res.json()
      setInvoices(prev => [newInvoice, ...prev])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Générer une facture ── */}
      {billableBookings.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9e3da' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: '#e9e3da' }}>
            <h3 className="font-semibold text-sm" style={{ color: '#00243f' }}>
              Générer une facture — réservations confirmées
            </h3>
          </div>
          <div className="divide-y" style={{ borderColor: '#f3ede4' }}>
            {billableBookings.map(b => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#00243f' }}>{b.guest_name}</p>
                  <p className="text-xs text-gray-400">
                    {properties[b.property_id] || '—'} ·{' '}
                    {new Date(b.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {' → '}
                    {new Date(b.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#00243f' }}>
                  {b.total_price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
                <button
                  onClick={() => generateInvoice(b.id)}
                  disabled={generating === b.id}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-60 flex-shrink-0"
                  style={{ backgroundColor: '#0097b2' }}
                >
                  {generating === b.id ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : '🧾'}
                  {generating === b.id ? 'Génération…' : 'Générer'}
                </button>
              </div>
            ))}
          </div>
          {error && <p className="px-6 py-3 text-sm text-red-500">{error}</p>}
        </section>
      )}

      {/* ── Liste des factures ── */}
      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9e3da' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e9e3da' }}>
          <h3 className="font-semibold text-sm" style={{ color: '#00243f' }}>
            Factures générées
          </h3>
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
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f9f5f0' }}>
                  {invoices.map(inv => {
                    const st = STATUS_STYLES[inv.status] || STATUS_STYLES.draft
                    return (
                      <tr key={inv.id} className="hover:bg-[#fdfaf7] transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold" style={{ color: '#0097b2' }}>
                          {inv.invoice_number}
                        </td>
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
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ color: st.color, backgroundColor: st.bg }}
                          >
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
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
                      <span className="font-mono text-xs font-semibold" style={{ color: '#0097b2' }}>
                        {inv.invoice_number}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ color: st.color, backgroundColor: st.bg }}
                      >
                        {st.label}
                      </span>
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
