import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ConfierForm from '@/components/ConfierForm'

export const metadata: Metadata = {
  title: "Confier mon bien — Concierg'ori",
  description: "Confiez la gestion de votre logement à Caen à notre conciergerie. Revenus optimisés, zéro contrainte.",
}

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const STEPS = [
  { icon: '📞', title: 'Prise de contact', desc: 'On étudie votre bien et ses spécificités pour vous proposer une stratégie adaptée.' },
  { icon: '📸', title: 'Mise en ligne', desc: 'Annonce optimisée, diffusion multi-plateformes, photos professionnelles.' },
  { icon: '🔑', title: 'On gère tout', desc: 'Check-in, ménage, linge, communication voyageurs, gestion des imprévus.' },
  { icon: '💰', title: 'Vous encaissez', desc: 'Virement mensuel, rapport détaillé, accès à votre espace propriétaire.' },
]

export default function ConfierMonBienPage() {
  return (
    <div className="font-[var(--font-quicksand)]" style={{ backgroundColor: '#fff2e0', color: '#4b4b4b', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: GRAIN, backgroundRepeat: 'repeat', backgroundSize: '256px', opacity: 0.08
        }} />
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, #73c7d620, transparent 70%)' }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{ backgroundColor: '#e6f7fa', color: '#0097b2' }}>
            🏠 Pour les propriétaires
          </span>
          <h1 className="font-[var(--font-suez)] mb-6" style={{ fontSize: 'clamp(36px,5vw,64px)', color: '#00243f', lineHeight: 1.1 }}>
            Vous avez un logement à Caen ?
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#5a5a5a' }}>
            Confiez-nous sa gestion. Vous encaissez vos revenus,
            on s&apos;occupe de tout le reste — 7j/7.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6" style={{ backgroundColor: '#00243f' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '14', label: 'Logements gérés' },
            { value: '716', label: 'Avis voyageurs' },
            { value: '4,66★', label: 'Note moyenne' },
            { value: '9 ans', label: "D'expérience" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-[var(--font-suez)] text-4xl mb-1" style={{ color: '#73c7d6' }}>{s.value}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[var(--font-suez)] text-4xl text-center mb-14" style={{ color: '#00243f' }}>
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white" style={{ border: '1px solid #e8d8c0' }}>
                <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-2xl"
                     style={{ backgroundColor: '#e6f7fa' }}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: '#00243f' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-20 px-6" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-xl mx-auto">
          <h2 className="font-[var(--font-suez)] text-4xl text-center mb-3" style={{ color: '#00243f' }}>
            Parlons de votre bien
          </h2>
          <p className="text-center mb-10" style={{ color: '#5a5a5a' }}>
            Remplissez ce formulaire, on vous répond sous 48h.
          </p>
          <ConfierForm />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-alkatra)', color: 'white' }}>
            Concierg<span style={{ color: '#0097b2' }}>&apos;ori</span>
          </a>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2025 Concierg&apos;ori · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
