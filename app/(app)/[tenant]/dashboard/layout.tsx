import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase
    .from('tenants').select('id, name, slug').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: '#f8f4ee' }}>
      <DashboardSidebar tenantSlug={tenantSlug} tenantName={tenant.name} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
