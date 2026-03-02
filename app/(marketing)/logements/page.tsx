import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const AIRBNB_PHOTOS: Record<string, string> = {
  '859331683855011065': 'https://a0.muscache.com/im/pictures/miso/Hosting-859331683855011065/original/placeholder.jpg',
  '937378241752949040': 'https://a0.muscache.com/im/pictures/miso/Hosting-937378241752949040/original/placeholder.jpg',
}

function getAirbnbId(description: string | null): string {
  if (!description) return ''
  const match = description.match(/airbnb:(\d+)/)
  return match ? match[1] : ''
}

function getAirbnbUrl(airbnbId: string): string {
  return `https://www.airbnb.fr/rooms/${airbnbId}`
}

function getCategoryEmoji(name: string): string {
  if (name.toLowerCase().includes('studio')) return '🏠'
  if (name.toLowerCase().includes('maison')) return '🏡'
  if (name.toLowerCase().includes('terrasse')) return '🌿'
  if (name.toLowerCase().includes('plage') || name.toLowerCase().includes('mer')) return '🌊'
  return '🛏️'
}

async function getProperties() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('tenant_id', '67b8314e-ce88-467a-9246-cb0558402e34')
    .order('base_price', { ascending: true })
  return data || []
}

export default async function LogementsPage() {
  const properties = await getProperties()

  return (
    <div style={{ backgroundColor: '#fff2e0', minHeight: '100vh', fontFamily: 'var(--font-quicksand)', color: '#4b4b4b' }}>
      {/* Navbar */}
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
      <section className="py-16 px-6 text-center" style={{ backgroundColor: '#00243f' }}>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-suez)' }}>
          Nos logements à Caen
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          {properties.length} logements soigneusement sélectionnés en Normandie — studios, appartements et maisons de charme.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property: any) => {
            const airbnbId = getAirbnbId(property.description)
            const emoji = getCategoryEmoji(property.name)
            return (
              <div key={property.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {/* Image placeholder */}
                <div className="relative h-56 flex items-center justify-center text-6xl" style={{ backgroundColor: '#e8f4f8' }}>
                  <span>{emoji}</span>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-sm font-bold" style={{ color: '#00243f' }}>
                    {property.base_price}€ / nuit
                  </div>
                </div>

                {/* Infos */}
                <div className="p-6">
                  <h2 className="font-bold text-lg mb-1 leading-snug line-clamp-2" style={{ color: '#00243f', fontFamily: 'var(--font-alkatra)' }}>
                    {property.name}
                  </h2>
                  <p className="text-sm mb-4 flex items-center gap-1" style={{ color: '#979797' }}>
                    <span>📍</span> {property.address}
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={`mailto:contact@conciergori.fr?subject=Réservation - ${encodeURIComponent(property.name)}`}
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#0097b2' }}
                    >
                      Réserver
                    </a>
                    {airbnbId && (
                      <a
                        href={getAirbnbUrl(airbnbId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:bg-[#00243f] hover:text-white"
                        style={{ borderColor: '#00243f', color: '#00243f' }}
                      >
                        Airbnb
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#fff2e0', borderTop: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/"><img src="/logo.svg" alt="Concierg'ori" className="h-12 w-auto" /></Link>
          <p className="text-sm" style={{ color: '#979797' }}>© Concierg&apos;ori 2025 · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
