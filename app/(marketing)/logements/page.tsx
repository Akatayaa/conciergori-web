import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ScrollReveal from '@/components/ScrollReveal'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Nos logements — Appartements et maisons à Caen",
  description: "Découvrez tous nos logements à Caen et en Normandie. Studios, appartements, maisons. Réservez en direct sans frais Airbnb.",
  openGraph: {
    title: "Logements à Caen — Concierg'ori",
    description: "Studios, appartements et maisons à Caen et Normandie. Réservation directe, sans frais de plateforme.",
  },
}

import { getTenantConfigFromHeaders } from '@/lib/use-tenant-config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

function getPropertyType(name: string): string {
  if (/studio/i.test(name)) return 'Studio'
  if (/maison/i.test(name)) return 'Maison'
  if (/loft/i.test(name)) return 'Loft'
  return 'Appartement'
}

export default async function LogementsPage() {
  const tenant = await getTenantConfigFromHeaders()

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, address, cover_image, base_price, max_guests, bedrooms')
    .eq('tenant_id', tenant?.id ?? '')
    .order('name')

  return (
    <div className="font-[var(--font-quicksand)]" style={{ backgroundColor: '#fff2e0', color: '#4b4b4b', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero compact */}
      <section className="relative pt-32 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: GRAIN, backgroundRepeat: 'repeat',
          backgroundSize: '256px', opacity: 0.08
        }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, #73c7d620, transparent 70%)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{ backgroundColor: '#e6f7fa', color: '#0097b2' }}>
            🌊 Conciergerie caennaise
          </span>
          <h1 className="font-[var(--font-suez)] text-5xl md:text-6xl mb-4" style={{ color: '#00243f' }}>
            Nos logements
          </h1>
          <p className="text-lg" style={{ color: '#5a5a5a' }}>
            {properties?.length ?? 14} logements d&apos;exception à Caen et en Normandie —
            réservez en direct et économisez jusqu&apos;à 20%
          </p>
        </div>
      </section>

      {/* Grille */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(properties ?? []).map((property, i) => {
            const type = getPropertyType(property.name)
            return (
              <ScrollReveal key={property.id} delay={i * 80}>
                <Link href={`/logements/${property.id}`}
                      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{
                        backgroundColor: '#fffdf8',
                        border: '1px solid #e8d8c0',
                        boxShadow: '0 2px 12px rgba(0,36,63,0.06)',
                      }}>
                  {/* Photo */}
                  <div className="relative h-56 overflow-hidden bg-[#e8d8c0]">
                    {property.cover_image ? (
                      <img src={property.cover_image} alt={property.name}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: '#0097b2' }}>{type}</span>
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: 'white', color: '#00243f' }}>⭐ 4.9</span>
                  </div>
                  {/* Infos */}
                  <div className="p-5">
                    <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2" style={{ color: '#00243f' }}>
                      {property.name}
                    </h3>
                    <p className="text-sm mb-4 flex items-center gap-1" style={{ color: '#5a5a5a' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {property.address?.split(',').slice(-2).join(',').trim() || 'Caen, Normandie'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs" style={{ color: '#5a5a5a' }}>À partir de</span>
                        <p className="font-bold text-lg" style={{ color: '#0097b2', fontFamily: 'var(--font-suez)' }}>
                          {property.base_price}€<span className="text-sm font-normal">/nuit</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm" style={{ color: '#5a5a5a' }}>
                        <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} ch.`}</span>
                        <span>👤 {property.max_guests}</span>
                      </div>
                    </div>
                    <div className="mt-4 w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity group-hover:opacity-90"
                         style={{ backgroundColor: '#00243f' }}>
                      Voir le logement →
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-alkatra)', color: 'white' }}>
            Concierg<span style={{ color: '#0097b2' }}>&apos;ori</span>
          </Link>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/logements" className="hover:text-white transition-colors">Logements</Link>
            <a href="/confier-mon-bien" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2025 Concierg&apos;ori · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
