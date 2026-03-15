import PropertyForm from '@/components/dashboard/PropertyForm'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function NouveauLogementPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase.from('tenants').select('id, name').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Nouveau logement
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Renseignez les informations de base. Vous pourrez compléter les photos et équipements ensuite.
          </p>
        </div>
        <PropertyForm tenantId={tenant.id} tenantSlug={tenantSlug} />
      </div>
    </div>
  )
}
