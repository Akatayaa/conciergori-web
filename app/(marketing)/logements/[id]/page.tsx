import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (!property) return notFound()

  const photos: string[] = property.photos ?? (property.cover_image ? [property.cover_image] : [])

  return (
    <div style={{ color: '#4b4b4b', backgroundColor: '#fff2e0', minHeight: '100vh' }}
         className="font-[var(--font-quicksand)]">

      {/* Navbar */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#fff2e0', borderBottom: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><img src="/logo.svg" alt="Concierg'ori" className="h-14 w-auto" /></Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#services" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Services</Link>
            <Link href="/logements" className="text-sm font-medium text-[#0097b2]">Logements</Link>
            <Link href="/#contact" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Contact</Link>
          </nav>
          <Link href="#reserver" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#0097b2' }}>Réserver</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: '#979797' }}>
          <Link href="/logements" className="hover:text-[#0097b2] transition-colors">← Tous les logements</Link>
        </div>

        {/* Galerie photos */}
        {photos.length > 0 && (
          <div className="mb-8">
            {/* Photo principale */}
            <div className="rounded-3xl overflow-hidden h-72 md:h-[420px] mb-2">
              <img src={photos[0]} alt={property.name} className="w-full h-full object-cover" />
            </div>
            {/* Miniatures */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {photos.slice(1).map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden h-20 md:h-24">
                    <img src={img} alt={`${property.name} ${i + 2}`}
                         className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Infos */}
          <div className="lg:col-span-2">
            <p className="text-[#0097b2] font-semibold text-sm tracking-wide uppercase mb-2">{property.address}</p>
            <h1 className="font-[var(--font-suez)] text-3xl md:text-4xl mb-4" style={{ color: '#00243f' }}>
              {property.name}
            </h1>

            <div className="flex flex-wrap gap-3 mb-8">
              <span className="px-4 py-2 rounded-full bg-white text-sm font-medium shadow-sm">
                🛏 {property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`}
              </span>
              <span className="px-4 py-2 rounded-full bg-white text-sm font-medium shadow-sm">
                👤 {property.max_guests} voyageur{property.max_guests > 1 ? 's' : ''} max
              </span>
              <span className="px-4 py-2 rounded-full bg-white text-sm font-medium shadow-sm">📍 Normandie</span>
            </div>

            {property.description && (
              <div className="mb-8">
                <h2 className="font-[var(--font-alkatra)] text-xl font-bold mb-3" style={{ color: '#00243f' }}>À propos</h2>
                <p className="leading-relaxed">{property.description}</p>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-white shadow-sm">
              <p className="text-sm font-medium mb-2" style={{ color: '#00243f' }}>Aussi disponible sur Airbnb</p>
              <a href={property.airbnb_url} target="_blank" rel="noopener noreferrer"
                 className="text-sm font-semibold text-[#0097b2] hover:underline">
                Voir l'annonce Airbnb →
              </a>
            </div>
          </div>

          {/* Encart réservation */}
          <div className="lg:col-span-1" id="reserver">
            <div className="sticky top-24 rounded-3xl p-6 shadow-lg bg-white">
              <div className="mb-4">
                {property.base_price > 0 ? (
                  <><span className="text-3xl font-bold" style={{ color: '#00243f' }}>{property.base_price}€</span>
                  <span className="text-sm ml-1" style={{ color: '#979797' }}>/nuit</span></>
                ) : (
                  <span className="text-lg font-semibold" style={{ color: '#00243f' }}>Prix sur demande</span>
                )}
              </div>
              <form className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Arrivée</label>
                    <input type="date" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Départ</label>
                    <input type="date" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Voyageurs</label>
                  <select className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }}>
                    {Array.from({ length: property.max_guests }, (_, i) => (
                      <option key={i+1} value={i+1}>{i+1} voyageur{i+1 > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Votre nom</label>
                  <input type="text" placeholder="Prénom Nom" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#00243f' }}>Email</label>
                  <input type="email" placeholder="vous@email.com" className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: '#e8d8c0' }} />
                </div>
                <button type="submit" className="w-full py-3 rounded-full text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#0097b2' }}>
                  Envoyer une demande
                </button>
                <p className="text-xs text-center" style={{ color: '#979797' }}>Sans engagement · Confirmation sous 24h</p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-16" style={{ backgroundColor: '#fff2e0', borderTop: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/"><img src="/logo.svg" alt="Concierg'ori" className="h-12 w-auto" /></Link>
          <p className="text-sm" style={{ color: '#979797' }}>© Concierg'ori 2025 · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
