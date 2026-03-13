import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import OwnersList from '@/components/dashboard/OwnersList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 30

export default async function ProprietairesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .single()
  if (!tenant) return notFound()

  const [{ data: owners }, { data: properties }] = await Promise.all([
    supabase
      .from('owners')
      .select('*, owner_properties(property_id)')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select('id, name')
      .eq('tenant_id', tenant.id),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://conciergori-web.vercel.app'

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Propriétaires
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Gérez vos propriétaires et partagez leur espace personnel
          </p>
        </div>

        <OwnersList
          initialOwners={owners ?? []}
          properties={properties ?? []}
          tenantId={tenant.id}
          tenantSlug={tenantSlug}
          appUrl={appUrl}
        />
      </div>
    </div>
  )
}
