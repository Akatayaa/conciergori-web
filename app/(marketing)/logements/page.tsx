import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TENANT_SLUG = 'conciergori'

export default async function LogementsPage() {
  // Fetch tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('slug', TENANT_SLUG)
    .single()

  // Fetch properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('tenant_id', tenant?.id ?? '')
    .order('name')

  return (
    <div style={{ color: '#4b4b4b' }} className="font-[var(--font-quicksand)]">

      {/* Header */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#fff2e0', borderBottom: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><img src="/logo.svg" alt="Concierg'ori" className="h-14 w-auto" /></Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#services" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Services</Link>
            <Link href="/logements" className="text-sm font-medium text-[#0097b2]">Logements</Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Contact</Link>
          </nav>
          <Link href="/#contact" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#0097b2' }}>
            Réserver
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-20 text-center" style={{ backgroundColor: '#fff2e0' }}>
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#0097b2' }}>Nos logements</p>
          <h1 className="font-[var(--font-suez)] text-4xl md:text-5xl leading-tight mb-4" style={{ color: '#00243f' }}>
            Trouvez votre hébergement idéal
          </h1>
          <p className="text-lg text-[#4b4b4b]/80">
            {properties?.length ?? 0} logements soigneusement sélectionnés à Caen et en Normandie
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-4 border-b" style={{ backgroundColor: 'white', borderColor: '#e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 flex gap-3 flex-wrap">
          <button className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#00243f' }}>Tous ({properties?.length ?? 0})</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium border hover:border-[#0097b2] hover:text-[#0097b2] transition-colors" style={{ borderColor: '#e8d8c0' }}>Caen</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium border hover:border-[#0097b2] hover:text-[#0097b2] transition-colors" style={{ borderColor: '#e8d8c0' }}>Bord de mer</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium border hover:border-[#0097b2] hover:text-[#0097b2] transition-colors" style={{ borderColor: '#e8d8c0' }}>Studios</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium border hover:border-[#0097b2] hover:text-[#0097b2] transition-colors" style={{ borderColor: '#e8d8c0' }}>Appartements</button>
          <button className="px-4 py-2 rounded-full text-sm font-medium border hover:border-[#0097b2] hover:text-[#0097b2] transition-colors" style={{ borderColor: '#e8d8c0' }}>Maisons</button>
        </div>
      </section>

      {/* Grid des logements */}
      <section className="py-12 md:py-16" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties?.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#fff2e0', borderTop: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/"><img src="/logo.svg" alt="Concierg'ori" className="h-16 w-auto" /></Link>
            <nav className="flex flex-wrap justify-center gap-6">
              <Link href="/#services" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Services</Link>
              <Link href="/logements" className="text-sm text-[#0097b2]">Logements</Link>
              <Link href="/#contact" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Contact</Link>
            </nav>
            <p className="text-sm" style={{ color: '#979797' }}>© Concierg&apos;ori 2025 · Caen, Normandie</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PropertyCard({ property }: { property: any }) {
  const isBeachside = property.address?.includes('Mer') || property.address?.includes('mer')
  const type = property.bedrooms === 0 ? 'Studio' : property.bedrooms === 1 ? 'Appartement' : property.bedrooms >= 3 ? 'Maison' : 'Appartement'
  const capacity = property.max_guests ?? 4

  return (
    <div className="group rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 cursor-pointer" style={{ borderColor: '#e8d8c0' }}>
      {/* Image placeholder */}
      <div className="relative h-52 overflow-hidden" style={{ backgroundColor: '#e8f4f8' }}>
        {property.cover_image ? (
          <img src={property.cover_image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-2">{isBeachside ? '🌊' : type === 'Maison' ? '🏡' : '🏠'}</div>
              <p className="text-sm font-medium" style={{ color: '#0097b2' }}>{type}</p>
            </div>
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#0097b2' }}>
            {isBeachside ? 'Bord de mer' : 'Caen'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-[var(--font-alkatra)] font-bold text-base mb-1 line-clamp-2 group-hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>
          {property.name}
        </h3>
        <p className="text-sm mb-4" style={{ color: '#979797' }}>
          📍 {property.address}
        </p>

        {/* Infos */}
        <div className="flex items-center gap-4 mb-5 text-sm" style={{ color: '#4b4b4b' }}>
          <span>🛏️ {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} ch.`}</span>
          <span>👥 {capacity} pers.</span>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <a
            href={property.airbnb_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline transition-colors"
            style={{ color: '#979797' }}
            onClick={(e) => e.stopPropagation()}
          >
            Voir sur Airbnb
          </a>
          <Link
            href={`/logements/${property.id}`}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#0097b2' }}
          >
            Réserver →
          </Link>
        </div>
      </div>
    </div>
  )
}
