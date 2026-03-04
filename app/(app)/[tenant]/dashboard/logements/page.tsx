import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PropertyRow from '@/components/dashboard/PropertyRow'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function LogementsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params

  const { data: tenant } = await supabase
    .from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: properties } = await supabase
    .from('properties').select('*').eq('tenant_id', tenant.id).order('name')

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Logements
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            {properties?.length ?? 0} logement{(properties?.length ?? 0) > 1 ? 's' : ''} — cliquez sur un prix pour le modifier, sur iCal pour configurer la synchronisation.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden bg-white shadow-sm divide-y" style={{ borderColor: '#f0e8da' }}>
          {properties?.map(property => (
            <PropertyRow key={property.id} property={property} />
          ))}
          {(!properties || properties.length === 0) && (
            <p className="text-center py-12 text-sm" style={{ color: '#979797' }}>
              Aucun logement configuré.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
