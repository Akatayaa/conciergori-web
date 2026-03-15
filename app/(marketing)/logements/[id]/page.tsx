import Navbar from '@/components/Navbar'
import BookingForm from '@/components/BookingForm'
import PropertyGallery from '@/components/PropertyGallery'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: property } = await supabase
    .from('properties').select('name, description, cover_image, address').eq('id', id).single()
  if (!property) return { title: 'Logement introuvable' }
  return {
    title: `${property.name} — Réservation directe`,
    description: property.description?.slice(0, 160) ?? `${property.name} à ${property.address}. Réservez directement sans frais Airbnb.`,
    openGraph: {
      title: property.name,
      description: property.description?.slice(0, 160) ?? `Logement à ${property.address}`,
      images: property.cover_image ? [{ url: `/api/og?url=${encodeURIComponent(property.cover_image)}`, width: 1200, height: 630 }] : [],
    },
  }
}

// ── Amenity icon map ──────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, string> = {
  wifi:       '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/>',
  parking:    '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>',
  kitchen:    '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>',
  tv:         '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z"/>',
  washer:     '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>',
  air:        '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>',
  balcony:    '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>',
  default:    '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
}

function amenityIcon(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('wifi') || lower.includes('internet')) return AMENITY_ICONS.wifi
  if (lower.includes('parking') || lower.includes('voiture')) return AMENITY_ICONS.parking
  if (lower.includes('cuisine') || lower.includes('kitchen')) return AMENITY_ICONS.kitchen
  if (lower.includes('tv') || lower.includes('télé')) return AMENITY_ICONS.tv
  if (lower.includes('lave') || lower.includes('machine')) return AMENITY_ICONS.washer
  if (lower.includes('clim') || lower.includes('air')) return AMENITY_ICONS.air
  if (lower.includes('balcon') || lower.includes('terras')) return AMENITY_ICONS.balcony
  return AMENITY_ICONS.default
}

// ─── Property type label ──────────────────────────────────────────────────────
function propertyType(p: { bedrooms?: number; property_type?: string }): string {
  if (p.property_type) return p.property_type
  if (!p.bedrooms || p.bedrooms === 0) return 'Studio'
  if (p.bedrooms === 1) return 'Appartement'
  return 'Maison'
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (!property) return notFound()

  const photos: string[] = property.photos?.length
    ? property.photos
    : property.cover_image ? [property.cover_image] : []

  const amenities: string[] = property.amenities ?? []
  const type = propertyType(property)
  const mapsUrl = property.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`
    : null

  return (
    <div className="min-h-screen font-[var(--font-quicksand)]" style={{ backgroundColor: '#fff2e0' }}>
      {/* Grain */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: GRAIN, backgroundSize: '256px 256px' }} />

      <Navbar />

      <div className="relative z-10 pt-[68px]">
        <div className="max-w-[1140px] mx-auto px-6 py-10">

          {/* Breadcrumb */}
          <Link
            href="/logements"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 transition-colors hover:text-[#0097b2]"
            style={{ color: '#5a5a5a' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Tous les logements
          </Link>

          {/* ── Galerie ── */}
          <div className="mb-10 animate-[fadeInUp_0.5s_ease_forwards] opacity-0">
            <PropertyGallery photos={photos} title={property.name} />
          </div>

          {/* ── Layout 60/40 ── */}
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* ── Contenu gauche ── */}
            <div className="flex-1 min-w-0 animate-[fadeInUp_0.5s_0.1s_ease_forwards] opacity-0">

              {/* Badge type + localisation */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: '#0097b2' }}
                >
                  {type}
                </span>
                {property.address && (
                  <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#0097b2' }}>
                    📍 {property.address}
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1
                className="font-[var(--font-suez)] mb-5"
                style={{ fontSize: 'clamp(28px,4vw,42px)', color: '#00243f', lineHeight: 1.1 }}
              >
                {property.name}
              </h1>

              {/* Séparateur */}
              <div className="border-b mb-6" style={{ borderColor: '#e8d8c0' }} />

              {/* Capacité / infos */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  {
                    icon: '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>',
                    label: `${property.max_guests || 2} voyageur${(property.max_guests || 2) > 1 ? 's' : ''}`,
                  },
                  property.bedrooms != null && {
                    icon: '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>',
                    label: property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`,
                  },
                  property.beds && {
                    icon: '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75"/>',
                    label: `${property.beds} lit${property.beds > 1 ? 's' : ''}`,
                  },
                  property.bathrooms && {
                    icon: '<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636"/>',
                    label: `${property.bathrooms} sdb`,
                  },
                ].filter(Boolean).map((item, i) => {
                  if (!item) return null
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#0097b2' }} dangerouslySetInnerHTML={{ __html: item.icon }} />
                      <span className="text-sm font-semibold" style={{ color: '#00243f' }}>{item.label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Description */}
              {property.description && (
                <>
                  <h2 className="font-[var(--font-suez)] text-xl mb-3" style={{ color: '#00243f' }}>Description</h2>
                  <p className="text-[15px] leading-[1.8] mb-8" style={{ color: '#5a5a5a', whiteSpace: 'pre-line' }}>
                    {property.description}
                  </p>
                  <div className="border-b mb-8" style={{ borderColor: '#e8d8c0' }} />
                </>
              )}

              {/* Équipements */}
              {amenities.length > 0 && (
                <>
                  <h2 className="font-[var(--font-suez)] text-xl mb-5" style={{ color: '#00243f' }}>Équipements</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {amenities.map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white" style={{ border: '1px solid #e8d8c0' }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#0097b2' }} dangerouslySetInnerHTML={{ __html: amenityIcon(a) }} />
                        <span className="text-sm font-medium" style={{ color: '#00243f' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-b mb-8" style={{ borderColor: '#e8d8c0' }} />
                </>
              )}

              {/* Localisation */}
              {property.address && (
                <>
                  <h2 className="font-[var(--font-suez)] text-xl mb-3" style={{ color: '#00243f' }}>Localisation</h2>
                  <div className="flex items-start gap-3 mb-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#0097b2' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#00243f' }}>{property.address}</p>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold transition-colors hover:opacity-80"
                          style={{ color: '#0097b2' }}
                        >
                          Voir sur Google Maps →
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Card réservation — Mobile uniquement */}
              <div className="lg:hidden mt-10">
                <div className="bg-white rounded-[16px] p-6" style={{ border: '1px solid #e8d8c0', boxShadow: '0 4px 24px rgba(0,36,63,0.08)' }}>
                  <PriceBlock basePrice={property.base_price} />
                  <BookingForm
                    propertyId={property.id}
                    maxGuests={property.max_guests ?? 2}
                    basePrice={property.base_price ?? 80}
                  />
                </div>
              </div>
            </div>

            {/* ── Card sticky droite — Desktop ── */}
            <div className="hidden lg:block w-[380px] flex-shrink-0">
              <div
                className="sticky bg-white rounded-[16px] p-6"
                style={{ top: 80, border: '1px solid #e8d8c0', boxShadow: '0 8px 32px rgba(0,36,63,0.10)' }}
              >
                <PriceBlock basePrice={property.base_price} />
                <BookingForm
                  propertyId={property.id}
                  maxGuests={property.max_guests ?? 2}
                  basePrice={property.base_price ?? 80}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Price block ───────────────────────────────────────────────────────────────
function PriceBlock({ basePrice }: { basePrice?: number }) {
  return (
    <div className="mb-5">
      {basePrice ? (
        <p className="font-[var(--font-suez)] leading-none mb-1" style={{ fontSize: 28, color: '#0097b2' }}>
          {basePrice}€{' '}
          <span className="font-[var(--font-quicksand)] text-base font-medium" style={{ color: '#5a5a5a' }}>/nuit</span>
        </p>
      ) : (
        <p className="font-semibold text-lg" style={{ color: '#00243f' }}>Nous contacter</p>
      )}
      <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        −20% vs Airbnb
      </div>
    </div>
  )
}
