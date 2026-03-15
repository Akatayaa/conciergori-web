import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PropertyForm from '@/components/dashboard/PropertyForm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function EditLogementPage({
  params,
}: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant: tenantSlug, id } = await params

  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: property } = await supabase.from('properties').select('*').eq('id', id).single()
  if (!property) return notFound()

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Modifier le logement
          </h1>
          <p className="text-sm truncate" style={{ color: '#979797' }}>{property.name}</p>
        </div>
        <PropertyForm tenantId={tenant.id} tenantSlug={tenantSlug} initial={property} />
      </div>
    </div>
  )
}
