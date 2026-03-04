import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ReservationsList from '@/components/dashboard/ReservationsList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ReservationsPage({ params }: { params: Promise<{ tenant: string }> }) {

  const { tenant: tenantSlug } = await params

  const { data: tenant } = await supabase
    .from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })

  const { data: properties } = await supabase
    .from('properties').select('id, name').eq('tenant_id', tenant.id)

  const propMap = Object.fromEntries((properties ?? []).map(p => [p.id, p.name]))

  return (
    <div className="p-6 md:p-10">
<div className="max-w-5xl mx-auto">

            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>Réservations</h1>
                <p className="text-sm" style={{ color: '#979797' }}>{bookings?.length ?? 0} au total</p>
              </div>
            </div>

            <ReservationsList bookings={bookings ?? []} properties={propMap} />

          </div>
    </div>
  )
}
