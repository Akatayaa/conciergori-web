import { createClient } from '@supabase/supabase-js'
import PricingRules from '@/components/dashboard/PricingRules'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

import { notFound } from 'next/navigation'

export default async function PricingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenantRow } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single()
  if (!tenantRow) return notFound()
  const tenantId = tenantRow.id

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, base_price, cover_image')
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
            <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
              Prix & règles
            </h1>
            <p className="text-sm" style={{ color: '#979797' }}>
              Configurez des remises ou suppléments automatiques par logement.
            </p>
          </div>

          <div className="space-y-5">
            {properties?.map(property => {
              const rules = allRules?.filter(r => r.property_id === property.id) ?? []
              return (
                <div key={property.id} className="rounded-2xl overflow-hidden shadow-sm bg-white">
                  {/* En-tête avec photo */}
                  <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: '#f0e8da' }}>
                    {property.cover_image && (
                      <img src={property.cover_image} alt={property.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-base truncate" style={{ color: '#00243f' }}>
                        {property.name}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1"
                        style={{ backgroundColor: '#fff2e0', color: '#0097b2' }}>
                        {property.base_price ? `${property.base_price}€/nuit` : 'Prix non défini'}
                      </span>
                    </div>
                  </div>
                  {/* Règles */}
                  <div className="p-4">
                    <PricingRules
                      propertyId={property.id}
                      propertyName={property.name}
                      initialRules={rules}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
  )
}
