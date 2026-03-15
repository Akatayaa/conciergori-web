import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Demande envoyée — Concierg'ori",
  robots: { index: false },
}

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function ConfirmationPage() {
  return (
    <div className="font-[var(--font-quicksand)] min-h-screen flex flex-col" style={{ backgroundColor: '#fff2e0' }}>
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Grain */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: GRAIN, backgroundRepeat: 'repeat', backgroundSize: '256px', opacity: 0.08
        }} />
        {/* Blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, #73c7d625, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, #0097b215, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg">
          {/* Icône animée */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-8"
               style={{ backgroundColor: '#d1fae5' }}>
            ✉️
          </div>

          <h1 className="font-[var(--font-suez)] text-4xl md:text-5xl mb-4" style={{ color: '#00243f' }}>
            Demande envoyée !
          </h1>
          <p className="text-lg mb-2" style={{ color: '#5a5a5a' }}>
            Nous avons bien reçu votre demande de réservation.
          </p>
          <p className="text-base mb-10" style={{ color: '#5a5a5a' }}>
            Un email de confirmation vient de vous être envoyé. Notre équipe vous contactera
            dans les <strong style={{ color: '#00243f' }}>24 heures</strong> pour finaliser votre séjour.
          </p>

          {/* Steps */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 text-left">
            {[
              { step: '1', icon: '📧', text: 'Email de confirmation reçu dans votre boîte' },
              { step: '2', icon: '✅', text: 'Notre équipe valide et confirme votre réservation' },
              { step: '3', icon: '🔑', text: 'Vous recevez les instructions d\'accès avant le séjour' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 flex-1 p-4 rounded-2xl bg-white"
                   style={{ border: '1px solid #e8d8c0' }}>
                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                <p className="text-sm" style={{ color: '#5a5a5a' }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/logements"
                  className="px-8 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0097b2' }}>
              Voir nos autres logements
            </Link>
            <Link href="/"
                  className="px-8 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'white', color: '#00243f', border: '1px solid #e8d8c0' }}>
              Retour à l&apos;accueil
            </Link>
          </div>
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
