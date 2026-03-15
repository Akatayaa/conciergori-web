import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Mentions légales — Concierg'ori",
  description: "Mentions légales, politique de confidentialité et conditions générales du site Concierg'ori.",
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <div className="font-[var(--font-quicksand)]" style={{ backgroundColor: '#fff2e0', minHeight: '100vh' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8 hover:text-[#0097b2] transition-colors"
              style={{ color: '#5a5a5a' }}>
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="font-[var(--font-suez)] text-4xl mb-10" style={{ color: '#00243f' }}>Mentions légales</h1>

        {[
          {
            title: '1. Éditeur du site',
            content: `Le site conciergori.fr est édité par Concierg'ori, conciergerie de location courte durée.\n\nSiège social : Caen, Normandie (14000)\nEmail : contact@conciergori.fr\n\nDirectrice de la publication : Oriane (gérante)`
          },
          {
            title: '2. Hébergement',
            content: `Le site est hébergé par :\nVercel Inc.\n340 Pine Street, Suite 900\nSan Francisco, CA 94104, USA\nvercel.com`
          },
          {
            title: '3. Propriété intellectuelle',
            content: `L'ensemble du contenu de ce site (textes, images, logo, structure) est la propriété exclusive de Concierg'ori et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.\n\nToute reproduction, même partielle, est strictement interdite sans autorisation préalable.`
          },
          {
            title: '4. Données personnelles',
            content: `Les données collectées via les formulaires de réservation et de contact sont utilisées uniquement pour le traitement de votre demande.\n\nConformément au RGPD et à la loi « Informatique et Libertés », vous disposez d'un droit d'accès, de rectification et de suppression de vos données.\n\nPour exercer ce droit : contact@conciergori.fr`
          },
          {
            title: '5. Cookies',
            content: `Ce site utilise des cookies techniques nécessaires à son bon fonctionnement (session d'authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.`
          },
          {
            title: '6. Responsabilité',
            content: `Concierg'ori s'efforce de maintenir les informations du site à jour mais ne peut garantir l'exactitude complète des informations, notamment les disponibilités affichées qui sont synchronisées depuis des plateformes tierces.`
          },
        ].map((section) => (
          <section key={section.title} className="mb-10">
            <h2 className="font-[var(--font-suez)] text-xl mb-3" style={{ color: '#00243f' }}>{section.title}</h2>
            <div className="rounded-2xl p-6 bg-white" style={{ border: '1px solid #e8d8c0' }}>
              <p className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: '#5a5a5a' }}>{section.content}</p>
            </div>
          </section>
        ))}
      </main>

      <footer style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-alkatra)', color: 'white' }}>
            Concierg<span style={{ color: '#0097b2' }}>&apos;ori</span>
          </Link>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2025 Concierg&apos;ori · Caen, Normandie</p>
        </div>
      </footer>
    </div>
  )
}
