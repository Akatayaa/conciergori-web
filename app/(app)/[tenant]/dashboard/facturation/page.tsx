import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import InvoicesList from '@/components/dashboard/InvoicesList'
import InvoiceSettings from '@/components/dashboard/InvoiceSettings'
import InvoiceProfiles from '@/components/dashboard/InvoiceProfiles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 30

export default async function FacturationPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const [{ tenant: tenantSlug }, { tab = 'factures' }] = await Promise.all([params, searchParams])

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .single()
  if (!tenant) return notFound()

  const [invoicesRes, settingsRes, bookingsRes, propertiesRes, profilesRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('invoice_settings')
      .select('*')
      .eq('tenant_id', tenant.id)
      .single(),

    supabase
      .from('bookings')
      .select('id, guest_name, property_id, check_in, check_out, status, total_price')
      .eq('tenant_id', tenant.id)
      .eq('status', 'confirmed')
      .order('check_in', { ascending: false }),

    supabase
      .from('properties')
      .select('id, name')
      .eq('tenant_id', tenant.id),

    supabase
      .from('invoice_profiles')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }),
  ])

  const defaultSettings = {
    tenant_id: tenant.id,
    concierge_rate: 20,
    fees: [
      { name: 'Ménage', amount: 50, enabled: true },
      { name: 'Linge', amount: 15, enabled: true },
      { name: 'Animaux', amount: 25, enabled: false },
    ],
    invoice_prefix: 'FAC',
    company_name: '',
    company_address: '',
    company_siret: '',
    company_email: '',
    company_phone: '',
  }

  const settings   = settingsRes.data   ?? defaultSettings
  const invoices   = invoicesRes.data   ?? []
  const bookings   = bookingsRes.data   ?? []
  const properties = propertiesRes.data ?? []
  const profiles   = profilesRes.data   ?? []
  const propMap    = Object.fromEntries(properties.map(p => [p.id, p.name]))

  const tabs = [
    { key: 'factures',   label: '🧾 Factures' },
    { key: 'profils',    label: '📋 Profils' },
    { key: 'parametres', label: '⚙️ Paramètres' },
  ]

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Facturation
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            {invoices.length} facture{invoices.length !== 1 ? 's' : ''} ·{' '}
            {invoices.filter(i => i.status === 'paid').length} payée{invoices.filter(i => i.status === 'paid').length !== 1 ? 's' : ''} ·{' '}
            {profiles.length} profil{profiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ backgroundColor: '#efe8dc' }}>
          {tabs.map(t => (
            <a
              key={t.key}
              href={`?tab=${t.key}`}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={
                tab === t.key
                  ? { backgroundColor: 'white', color: '#00243f', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: '#979797' }
              }
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* Content */}
        {tab === 'factures' && (
          <InvoicesList
            initialInvoices={invoices}
            confirmedBookings={bookings}
            properties={propMap}
            tenantId={tenant.id}
            initialProfiles={profiles}
          />
        )}
        {tab === 'profils' && (
          <InvoiceProfiles
            initialProfiles={profiles}
            properties={properties}
            tenantId={tenant.id}
          />
        )}
        {tab === 'parametres' && (
          <InvoiceSettings initial={settings} />
        )}

      </div>
    </div>
  )
}
