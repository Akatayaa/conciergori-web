import BookingForm from '@/components/BookingForm'
import PhotoGallery from '@/components/PhotoGallery'
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

        {/* Galerie photos avec lightbox */}
        {photos.length > 0 && (
          <div className="mb-8">
            <PhotoGallery photos={photos} title={property.name} />
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
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm
                propertyId={property.id}
                maxGuests={property.max_guests}
                basePrice={property.base_price ?? 0}
              />
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
