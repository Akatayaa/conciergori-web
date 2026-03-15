import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import EmailTemplateEditor from '@/components/dashboard/EmailTemplateEditor'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EmailsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .eq('tenant_id', tenant.id)

  const tplMap = Object.fromEntries((templates ?? []).map(t => [t.type, t]))

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            ✉️ Templates email
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Personnalisez les emails envoyés automatiquement à vos voyageurs.
            Utilisez <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: '#f0e8da' }}>{'{{variable}}'}</code> pour insérer des données dynamiques.
          </p>
        </div>

        {/* Variables disponibles */}
        <div className="mb-8 p-4 rounded-2xl" style={{ backgroundColor: '#e6f7fa', border: '1px solid #b2e4ed' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#00243f' }}>Variables disponibles :</p>
          <div className="flex flex-wrap gap-2">
            {['guest_name', 'property_name', 'checkin_date', 'checkout_date', 'guests', 'total_price'].map(v => (
              <code key={v} className="text-xs px-2 py-1 rounded-lg font-mono"
                    style={{ backgroundColor: 'white', color: '#0097b2', border: '1px solid #b2e4ed' }}>
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>

        <EmailTemplateEditor
          tenantId={tenant.id}
          type="booking_confirmation"
          label="📧 Confirmation de réservation"
          description="Envoyé automatiquement au voyageur dès que sa réservation est créée."
          initial={tplMap['booking_confirmation'] ?? null}
        />
      </div>
    </div>
  )
}
