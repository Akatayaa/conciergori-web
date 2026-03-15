import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function NotFound() {
  return (
    <div className="font-[var(--font-quicksand)] min-h-screen flex flex-col" style={{ backgroundColor: '#fff2e0' }}>
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <p className="font-[var(--font-suez)] mb-4" style={{ fontSize: '120px', color: '#e8d8c0', lineHeight: 1 }}>
          404
        </p>
        <h1 className="font-[var(--font-suez)] text-3xl md:text-4xl mb-4" style={{ color: '#00243f' }}>
          Page introuvable
        </h1>
        <p className="text-lg max-w-md mb-10" style={{ color: '#5a5a5a' }}>
          Cette page n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil pour explorer nos logements.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/"
                className="px-8 py-3 rounded-full text-white font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#00243f' }}>
            ← Accueil
          </Link>
          <Link href="/logements"
                className="px-8 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#0097b2', color: 'white' }}>
            Voir les logements
          </Link>
        </div>
      </div>
      <footer style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2025 Concierg&apos;ori · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
