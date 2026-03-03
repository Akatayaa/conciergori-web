import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import PricingRules from '@/components/dashboard/PricingRules'
import LogoutButton from '@/components/dashboard/LogoutButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PricingPage() {
  const tenantId = '67b8314e-ce88-467a-9246-cb0558402e34'
  const tenantSlug = 'conciergori'

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

  const navItems = [
    { href: `/${tenantSlug}/dashboard`, label: "🏠 Vue d'ensemble" },
    { href: `/${tenantSlug}/dashboard/logements`, label: '🛏 Logements' },
    { href: `/${tenantSlug}/dashboard/reservations`, label: '📅 Réservations' },
    { href: `/${tenantSlug}/dashboard/pricing`, label: '💰 Prix & règles', active: true },
  ]

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#fff2e0' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0" style={{ backgroundColor: '#00243f' }}>
        <div className="p-6 border-b border-white/10">
          <p className="text-white font-bold text-lg font-[var(--font-suez)]">Concierg&apos;ori</p>
          <p className="text-white/50 text-xs mt-0.5">Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="text-xs text-[#73c7d6] hover:underline mt-1 block">← Voir le site</Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Contenu */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
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
      </main>
    </div>
  )
}
