import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import TestimonialsManager from '@/components/dashboard/TestimonialsManager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AvisPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase.from('tenants').select('id, name').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            ⭐ Gestion des avis
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Ces avis apparaissent sur votre site. Activez/désactivez ou ajoutez-en de nouveaux.
          </p>
        </div>
        <TestimonialsManager tenantId={tenant.id} initial={testimonials ?? []} />
      </div>
    </div>
  )
}
