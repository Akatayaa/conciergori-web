import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function LivretsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params
  const { data: tenant } = await supabase.from('tenants').select('*').eq('slug', tenantSlug).single()
  if (!tenant) return notFound()

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, cover_image, wifi_name, wifi_password, checkin_instructions, checkout_instructions, house_rules, local_tips, emergency_contact, welcome_message')
    .eq('tenant_id', tenant.id)
    .order('name')

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            📋 Livrets d&apos;accueil
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Renseignez les informations pratiques de chaque logement. Imprimez et laissez sur place.
          </p>
        </div>

        <div className="space-y-4">
          {(properties ?? []).map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                 style={{ border: '1px solid #f0e8da' }}>
              <div className="flex items-center gap-4 p-5 border-b" style={{ borderColor: '#f0e8da' }}>
                {p.cover_image && (
                  <img src={p.cover_image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h2 className="font-semibold" style={{ color: '#00243f' }}>{p.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <StatusDot filled={!!(p.wifi_password)} label="WiFi" />
                    <StatusDot filled={!!(p.checkin_instructions)} label="Check-in" />
                    <StatusDot filled={!!(p.house_rules)} label="Règles" />
                    <StatusDot filled={!!(p.local_tips)} label="Bons plans" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`./livrets/${p.id}/edit`}
                    className="px-4 py-2 text-sm rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#0097b2' }}>
                    ✏️ Éditer
                  </Link>
                  <Link href={`./livrets/${p.id}/print`} target="_blank"
                    className="px-4 py-2 text-sm rounded-xl font-semibold hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#fff2e0', color: '#00243f' }}>
                    🖨️ Imprimer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusDot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs" style={{ color: '#979797' }}>
      <span className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-green-400' : 'bg-amber-300'}`} />
      {label}
    </span>
  )
}
