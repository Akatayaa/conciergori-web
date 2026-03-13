import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Invoice {
  id: string
  invoice_number: string
  issued_at: string
  guest_name: string
  property_name: string
  check_in: string
  check_out: string
  nights: number
  nightly_total: number
  concierge_rate: number
  concierge_fee: number
  additional_fees: { name: string; amount: number; enabled?: boolean }[]
  total: number
  status: string
  notes?: string
  tenant_id: string
}

interface InvoiceSettings {
  company_name?: string
  siret?: string
  email?: string
  phone?: string
  address?: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function statusLabel(status: string): string {
  if (status === 'paid') return 'Payée'
  if (status === 'draft') return 'Brouillon'
  return 'En attente'
}

function statusColors(status: string): { bg: string; color: string } {
  if (status === 'paid') return { bg: '#d1fae5', color: '#065f46' }
  if (status === 'draft') return { bg: '#f3f4f6', color: '#6b7280' }
  return { bg: '#fef3c7', color: '#92400e' }
}

function generateHTML(invoice: Invoice, settings: InvoiceSettings | null): string {
  const companyName = settings?.company_name ?? 'Conciergorie'
  const enabledFees = (invoice.additional_fees ?? []).filter(
    (f) => f.enabled !== false && f.amount > 0
  )
  const { bg, color } = statusColors(invoice.status)

  const feesRows = enabledFees
    .map(
      (fee) =>
        `<tr>
          <td>${fee.name}</td>
          <td class="right">—</td>
          <td class="right">—</td>
          <td class="right">${formatCurrency(fee.amount)}</td>
        </tr>`
    )
    .join('')

  const feesTotals = enabledFees
    .map(
      (fee) =>
        `<div class="totals-row"><span>${fee.name}</span><span>${formatCurrency(fee.amount)}</span></div>`
    )
    .join('')

  const footerItems = [
    settings?.siret ? `SIRET : ${settings.siret}` : null,
    settings?.email ?? null,
    settings?.phone ?? null,
  ]
    .filter(Boolean)
    .join(' &nbsp;·&nbsp; ')

  const addressHtml = settings?.address
    ? `<div class="company-address">${settings.address.replace(/\n/g, '<br/>')}</div>`
    : ''

  const notesHtml = invoice.notes
    ? `<div class="notes"><strong>Notes</strong>${invoice.notes}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture ${invoice.invoice_number}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      padding: 48px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #1a1a1a;
    }
    .company-name { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .company-address { margin-top: 4px; color: #666; font-size: 12px; line-height: 1.5; }
    .invoice-meta { text-align: right; }
    .invoice-meta .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .invoice-meta .invoice-number { font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .invoice-meta .date { font-size: 12px; color: #555; margin-top: 4px; }
    .status-badge {
      display: inline-block; margin-top: 8px;
      padding: 2px 8px; border-radius: 4px;
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      background: ${bg}; color: ${color};
    }
    .parties { display: flex; gap: 40px; margin-bottom: 36px; }
    .party { flex: 1; }
    .party .party-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      color: #888; margin-bottom: 6px;
    }
    .party .party-name { font-size: 15px; font-weight: 600; }
    .party .party-detail { font-size: 12px; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f4f4f4; }
    thead th {
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: #555; padding: 10px 12px; text-align: left;
    }
    thead th.right { text-align: right; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 11px 12px; font-size: 13px; vertical-align: middle; }
    td.right { text-align: right; }
    .totals-wrapper { display: flex; justify-content: flex-end; margin-top: 8px; }
    .totals { width: 300px; }
    .totals-row {
      display: flex; justify-content: space-between;
      padding: 6px 12px; font-size: 13px; color: #444;
    }
    .totals-row.separator { border-top: 1px solid #e0e0e0; margin-top: 4px; padding-top: 10px; }
    .totals-row.grand-total {
      border-top: 2px solid #1a1a1a;
      margin-top: 4px; padding-top: 10px;
      font-size: 15px; font-weight: 700; color: #1a1a1a;
    }
    .notes {
      margin-top: 36px; padding: 16px;
      background: #fafafa; border-left: 3px solid #ddd;
      border-radius: 2px; font-size: 12px; color: #555; line-height: 1.6;
    }
    .notes strong { display: block; margin-bottom: 4px; color: #333; }
    .footer {
      margin-top: 48px; padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      text-align: center; font-size: 11px; color: #999;
    }
    @media print {
      body { padding: 24px; }
      @page { margin: 16mm; size: A4; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="company-name">${companyName}</div>
      ${addressHtml}
    </div>
    <div class="invoice-meta">
      <div class="label">Facture</div>
      <div class="invoice-number">${invoice.invoice_number}</div>
      <div class="date">Émise le ${formatDate(invoice.issued_at)}</div>
      <span class="status-badge">${statusLabel(invoice.status)}</span>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Émetteur</div>
      <div class="party-name">${companyName}</div>
      ${settings?.email ? `<div class="party-detail">${settings.email}</div>` : ''}
      ${settings?.phone ? `<div class="party-detail">${settings.phone}</div>` : ''}
    </div>
    <div class="party">
      <div class="party-label">Voyageur</div>
      <div class="party-name">${invoice.guest_name}</div>
      <div class="party-detail">${invoice.property_name}</div>
      <div class="party-detail">${formatDate(invoice.check_in)} → ${formatDate(invoice.check_out)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="right">Qté</th>
        <th class="right">P.U.</th>
        <th class="right">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Nuitées — ${invoice.property_name}</td>
        <td class="right">${invoice.nights} nuit${invoice.nights > 1 ? 's' : ''}</td>
        <td class="right">${formatCurrency(invoice.nightly_total / invoice.nights)}</td>
        <td class="right">${formatCurrency(invoice.nightly_total)}</td>
      </tr>
      <tr>
        <td>Frais de conciergerie (${invoice.concierge_rate}%)</td>
        <td class="right">—</td>
        <td class="right">${invoice.concierge_rate}%</td>
        <td class="right">${formatCurrency(invoice.concierge_fee)}</td>
      </tr>
      ${feesRows}
    </tbody>
  </table>

  <div class="totals-wrapper">
    <div class="totals">
      <div class="totals-row">
        <span>Total nuitées</span>
        <span>${formatCurrency(invoice.nightly_total)}</span>
      </div>
      <div class="totals-row">
        <span>Frais conciergerie</span>
        <span>${formatCurrency(invoice.concierge_fee)}</span>
      </div>
      ${feesTotals}
      <div class="totals-row grand-total separator">
        <span>Total général</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
    </div>
  </div>

  ${notesHtml}

  <div class="footer">${footerItems}</div>

</body>
</html>`
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const { data: settings } = await supabase
    .from('invoice_settings')
    .select('company_name, siret, email, phone, address')
    .eq('tenant_id', invoice.tenant_id)
    .single()

  const html = generateHTML(invoice as Invoice, settings as InvoiceSettings | null)

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
