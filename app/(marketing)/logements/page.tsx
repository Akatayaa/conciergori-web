import Navbar from '@/components/Navbar'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TENANT_SLUG = 'conciergori'

export default async function LogementsPage() {
  // Récupérer le tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', TENANT_SLUG)
    .single()

  // Récupérer les propriétés
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('tenant_id', tenant?.id ?? '')
    .order('name')

  return (
    <div style={{ color: '#4b4b4b', backgroundColor: '#fff2e0', minHeight: '100vh' }}
         className="font-[var(--font-quicksand)]">

      {/* Navbar */}
      <Navbar />

      {/* Hero section */}
      <section className="py-16 px-6 text-center" style={{ backgroundColor: '#00243f' }}>
        <p className="text-[#73c7d6] font-semibold tracking-widest text-sm uppercase mb-3">Nos logements</p>
        <h1 className="font-[var(--font-suez)] text-4xl md:text-5xl text-white mb-4">
          Découvrez nos appartements
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          10 logements soigneusement sélectionnés à Caen et en bord de mer, pour des séjours inoubliables en Normandie.
        </p>
      </section>

      {/* Grille des logements */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(properties ?? []).map((property) => (
            <div key={property.id}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white group">

              {/* Image placeholder ou vraie image */}
              <div className="relative h-52 overflow-hidden"
                   style={{ backgroundColor: '#00243f' }}>
                {property.cover_image ? (
                  <img src={property.cover_image} alt={property.name}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🏠</span>
                  </div>
                )}
                {/* Badge ville */}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: 'rgba(0,36,63,0.8)' }}>
                  {property.address?.split(',')[0]}
                </span>
              </div>

              {/* Infos */}
              <div className="p-5">
                <h3 className="font-[var(--font-alkatra)] font-semibold text-base mb-2 leading-snug"
                    style={{ color: '#00243f' }}>
                  {property.name}
                </h3>

                {/* Capacité */}
                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <span>🛏 {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} ch.`}</span>
                  <span>👤 {property.max_guests} pers. max</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a href={property.airbnb_url} target="_blank" rel="noopener noreferrer"
                     className="flex-1 text-center py-2 rounded-full text-sm font-semibold border-2 transition-colors hover:bg-[#0097b2] hover:text-white hover:border-[#0097b2]"
                     style={{ borderColor: '#0097b2', color: '#0097b2' }}>
                    Voir sur Airbnb
                  </a>
                  <Link href={`/logements/${property.id}`}
                     className="flex-1 text-center py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                     style={{ backgroundColor: '#00243f' }}>
                    Réserver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#fff2e0', borderTop: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/"><img src="/logo.svg" alt="Concierg'ori" className="h-12 w-auto" /></Link>
          <p className="text-sm" style={{ color: '#979797' }}>© Concierg'ori 2025 · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
