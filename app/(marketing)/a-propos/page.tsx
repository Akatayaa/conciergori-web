import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "À propos — Concierg'ori · Conciergerie à Caen",
  description: "Notre histoire, nos valeurs. Concierg'ori est une conciergerie de location courte durée à Caen, gérée par une équipe locale passionnée.",
}

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const VALUES = [
  { icon: '🤝', title: 'Proximité', desc: 'Nous sommes caennais. Nous connaissons chaque rue, chaque prestataire, chaque particularité de la ville. Pas de call center, une vraie équipe locale.' },
  { icon: '✨', title: 'Exigence', desc: 'Chaque logement est préparé comme si c\'était le nôtre. Linge impeccable, ménage minutieux, équipements vérifiés avant chaque arrivée.' },
  { icon: '💬', title: 'Réactivité', desc: 'Nos voyageurs et propriétaires ne restent jamais sans réponse. Disponibles 7j/7, on gère les imprévus avant qu\'ils deviennent des problèmes.' },
  { icon: '📈', title: 'Performance', desc: 'Notre objectif : maximiser vos revenus tout en offrant la meilleure expérience à vos voyageurs. Les deux ne sont pas incompatibles.' },
]

export default function AProposPage() {
  return (
    <div className="font-[var(--font-quicksand)]" style={{ backgroundColor: '#fff2e0', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: GRAIN, backgroundRepeat: 'repeat', backgroundSize: '256px', opacity: 0.08
        }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, #73c7d620, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{ backgroundColor: '#e6f7fa', color: '#0097b2' }}>
            🌊 Notre histoire
          </span>
          <h1 className="font-[var(--font-suez)] mb-6" style={{ fontSize: 'clamp(36px,5vw,60px)', color: '#00243f', lineHeight: 1.1 }}>
            Une conciergerie<br />née à Caen
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#5a5a5a' }}>
            Concierg&apos;ori est née de la conviction qu&apos;on peut mieux faire que les grandes plateformes —
            plus humain, plus local, plus attentionné.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-[var(--font-suez)] text-3xl mb-5" style={{ color: '#00243f' }}>
                Comment tout a commencé
              </h2>
              <div className="space-y-4 text-base leading-[1.9]" style={{ color: '#5a5a5a' }}>
                <p>
                  Tout a démarré avec un seul logement à Caen — et la volonté de le gérer mieux que ce que proposaient
                  les plateformes. Réactivité, propreté irréprochable, accueil personnalisé.
                </p>
                <p>
                  Au fil des années, d&apos;autres propriétaires nous ont fait confiance. Aujourd&apos;hui,
                  nous gérons <strong style={{ color: '#00243f' }}>14 logements</strong> à Caen et en Normandie,
                  avec plus de <strong style={{ color: '#00243f' }}>716 avis voyageurs</strong> et une note
                  moyenne de <strong style={{ color: '#0097b2' }}>4,66★</strong>.
                </p>
                <p>
                  Notre équipe est 100% locale. On connaît nos logements par cœur, nos prestataires de confiance,
                  et on sait gérer un imprévu à 23h un dimanche.
                </p>
              </div>
            </div>

            {/* Stats visuelles */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '9 ans', label: "d'expérience" },
                { value: '14', label: 'logements gérés' },
                { value: '716+', label: 'avis voyageurs' },
                { value: '4,66★', label: 'note moyenne' },
              ].map(s => (
                <div key={s.label} className="text-center p-6 rounded-2xl bg-white"
                     style={{ border: '1px solid #e8d8c0' }}>
                  <p className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#0097b2' }}>{s.value}</p>
                  <p className="text-sm" style={{ color: '#5a5a5a' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-16 px-6" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-[var(--font-suez)] text-4xl text-center mb-12" style={{ color: '#00243f' }}>
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="flex gap-4 p-6 rounded-2xl bg-white" style={{ border: '1px solid #e8d8c0' }}>
                <div className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center text-2xl"
                     style={{ backgroundColor: '#e6f7fa' }}>
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-2" style={{ color: '#00243f' }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-[var(--font-suez)] text-4xl mb-4" style={{ color: '#00243f' }}>
            On travaille ensemble ?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#5a5a5a' }}>
            Vous avez un logement à Caen ou en Normandie ? Parlons-en.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/confier-mon-bien"
                  className="px-8 py-3.5 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0097b2' }}>
              Confier mon bien →
            </Link>
            <Link href="/logements"
                  className="px-8 py-3.5 rounded-full font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'white', color: '#00243f', border: '1px solid #e8d8c0' }}>
              Voir les logements
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-alkatra)', color: 'white' }}>
            Concierg<span style={{ color: '#0097b2' }}>&apos;ori</span>
          </Link>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/logements" className="hover:text-white transition-colors">Logements</Link>
            <Link href="/confier-mon-bien" className="hover:text-white transition-colors">Confier mon bien</Link>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2025 Concierg&apos;ori · Caen</p>
        </div>
      </footer>
    </div>
  )
}
