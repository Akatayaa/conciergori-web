import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import MenagePage from '@/components/dashboard/MenagePage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60

export default async function MenagePageRoute({
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

  // Mois courant
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [tasksRes, cleanersRes] = await Promise.all([
    supabase
      .from('cleaning_tasks')
      .select('*, properties(name, cover_image, address), cleaners(name, phone), bookings(guest_name, check_in, check_out)')
      .eq('tenant_id', tenant.id)
      .gte('scheduled_date', `${ym}-01`)
      .lte('scheduled_date', `${ym}-31`)
      .order('scheduled_date', { ascending: true }),
    supabase
      .from('cleaners')
      .select('id, name, email, phone')
      .eq('tenant_id', tenant.id)
      .eq('active', true)
      .order('name'),
  ])

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Coordination Ménage
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Planifiez et suivez les ménages entre chaque séjour
          </p>
        </div>

        <MenagePage
          initialTasks={tasksRes.data ?? []}
          initialCleaners={cleanersRes.data ?? []}
          tenantId={tenant.id}
          initialYM={ym}
        />
      </div>
    </div>
  )
}
