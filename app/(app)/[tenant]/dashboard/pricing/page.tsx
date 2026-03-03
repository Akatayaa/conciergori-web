import { createClient } from '@supabase/supabase-js'
import PricingRules from '@/components/dashboard/PricingRules'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PricingPage() {
  const tenantId = '67b8314e-ce88-467a-9246-cb0558402e34'

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, base_price')
    .eq('tenant_id', tenantId)
    .order('name')

  const { data: allRules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('priority')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[var(--font-suez)] text-3xl mb-2" style={{ color: '#00243f' }}>
          Règles de prix
        </h1>
        <p className="text-sm" style={{ color: '#979797' }}>
          Configurez des remises ou suppléments automatiques par logement. Les règles s&apos;appliquent sur le prix de base.
        </p>
      </div>

      <div className="space-y-6">
        {properties?.map(property => {
          const rules = allRules?.filter(r => r.property_id === property.id) ?? []
          return (
            <div key={property.id} className="p-6 rounded-2xl border bg-white"
              style={{ borderColor: '#e8d8c0' }}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#fff2e0', color: '#0097b2' }}>
                  Base : {property.base_price}€/nuit
                </span>
              </div>
              <PricingRules
                propertyId={property.id}
                propertyName={property.name}
                initialRules={rules}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
