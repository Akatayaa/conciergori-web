import Navbar from '@/components/Navbar'
import ScrollReveal from '@/components/ScrollReveal'
import CountUp from '@/components/CountUp'
import TestimonialsCarousel from '@/components/sections/TestimonialsCarousel'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Locations courte durée à Caen — Réservez directement",
  description: "Appartements et maisons à Caen et en Normandie. Réservez directement chez Concierg'ori, sans frais Airbnb.",
  openGraph: {
    title: "Concierg'ori — Locations à Caen sans frais Airbnb",
    description: "Réservez directement vos séjours à Caen. Appartements et maisons de qualité, conciergerie locale.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const SERVICES = [
  { icon: '🗝️', title: 'Check-in flexibles',    sub: 'Arrivée à votre rythme',         gradient: 'linear-gradient(135deg,#1a3a5c,#0097b2)' },
  { icon: '🧹', title: 'Ménage professionnel',   sub: 'Linge fourni, logement impeccable', gradient: 'linear-gradient(135deg,#2d4a1e,#4caf50)' },
  { icon: '🛏️', title: 'Linge fourni',           sub: 'Draps et serviettes inclus',     gradient: 'linear-gradient(135deg,#4a2d1e,#c0714f)' },
  { icon: '🗺️', title: 'Bonnes adresses',        sub: 'Guide local personnalisé',        gradient: 'linear-gradient(135deg,#1e2d4a,#5b7dbd)' },
  { icon: '🛡️', title: 'Gestion des imprévus',   sub: 'Disponibles 7j/7',               gradient: 'linear-gradient(135deg,#3a1e4a,#9c5bc0)' },
  { icon: '📊', title: 'Suivi réservations',     sub: 'Calendrier synchronisé',          gradient: 'linear-gradient(135deg,#4a1e2d,#c05b7d)' },
]

const STEPS = [
  { icon: '📞', title: 'Prise de contact',       desc: 'Nous analysons votre bien et ses spécificités pour établir une stratégie de location adaptée.' },
  { icon: '📸', title: 'Mise en ligne',           desc: 'Shooting professionnel, annonce optimisée, diffusion sur Airbnb et Booking.com.' },
  { icon: '💰', title: 'Revenus automatiques',   desc: 'Vous recevez vos revenus chaque mois, nous gérons tout le reste.' },
]

export default async function LandingPage() {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, address, cover_image, base_price, max_guests, bedrooms, photos')
    .eq('tenant_id', '67b8314e-ce88-467a-9246-cb0558402e34')
    .order('name')
    .limit(6)

  const heroPhoto = properties?.[0]?.cover_image || null

  return (
    <>
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO — Split 55/45
      ═══════════════════════════════════════ */}
      <section
        id="hero"
        className="relative overflow-hidden"
        style={{ background: '#fff2e0', minHeight: '100vh', paddingTop: 68 }}
      >
        {/* Grain */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.12]" style={{ backgroundImage: GRAIN, backgroundSize: '256px 256px' }} />
        {/* Blob */}
        <div className="absolute bottom-[-120px] left-[-80px] z-0 w-[480px] h-[480px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(115,199,214,0.10) 0%, transparent 70%)' }} />

        {/* Grid 55/45 */}
        <div className="relative z-[2] grid md:grid-cols-[55%_45%] min-h-[calc(100vh-68px)]">

          {/* Left */}
          <div className="flex flex-col justify-center px-8 md:px-20 py-16 order-2 md:order-1">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 w-fit px-4 py-[7px] rounded-full text-xs font-bold mb-6 animate-[fadeInUp_0.5s_0.1s_ease_forwards] opacity-0"
              style={{ background: 'rgba(0,151,178,0.12)', border: '1px solid rgba(0,151,178,0.3)', color: '#0097b2' }}
            >
              <span className="w-[7px] h-[7px] rounded-full bg-[#0097b2]" style={{ animation: 'pulse-dot 2s infinite' }} />
              🌊 Conciergerie caennaise
            </div>

            {/* H1 */}
            <h1
              className="font-[var(--font-suez)] leading-[1.08] mb-6 animate-[fadeInUp_0.5s_0.15s_ease_forwards] opacity-0"
              style={{ fontSize: 'clamp(40px,5vw,72px)', color: '#00243f' }}
            >
              Séjournez à Caen,<br />
              <span style={{ color: '#0097b2' }}>sans les frais</span><br />
              Airbnb
            </h1>

            {/* Sous-titre */}
            <p
              className="text-lg leading-[1.7] mb-9 max-w-[460px] animate-[fadeInUp_0.5s_0.2s_ease_forwards] opacity-0"
              style={{ color: '#5a5a5a' }}
            >
              Appartements et maisons sélectionnés à Caen. Réservez directement auprès de la conciergerie locale — moins cher, plus humain.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-14 animate-[fadeInUp_0.5s_0.25s_ease_forwards] opacity-0">
              <Link
                href="/logements"
                className="inline-flex items-center px-8 py-4 rounded-full text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: '#0097b2', boxShadow: '0 8px 28px rgba(0,151,178,0.35)' }}
              >
                Voir les logements →
              </Link>
              <a
                href="#proprio"
                className="inline-flex items-center px-8 py-4 rounded-full text-[15px] font-bold border-2 transition-colors duration-200"
                style={{ borderColor: '#00243f', color: '#00243f' }}
              >
                Confier mon bien
              </a>
            </div>

            {/* Stats mini */}
            <div className="flex gap-10 pt-7 animate-[fadeInUp_0.5s_0.3s_ease_forwards] opacity-0" style={{ borderTop: '1px solid rgba(0,36,63,0.1)' }}>
              {[
                { val: '716', label: 'Évaluations' },
                { val: '4,66★', label: 'Note moyenne' },
                { val: '14', label: 'Logements' },
              ].map(s => (
                <div key={s.label}>
                  <span className="block font-[var(--font-suez)] text-[30px] leading-none mb-1" style={{ color: '#0097b2' }}>{s.val}</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#5a5a5a' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Photo */}
          <div className="relative order-1 md:order-2 min-h-[320px] md:min-h-0">
            {heroPhoto
              ? <img src={heroPhoto} alt="Logement Concierg'ori" className="w-full h-full object-cover" style={{ minHeight: 320 }} />
              : <div className="w-full h-full flex items-center justify-center text-7xl opacity-40" style={{ background: 'linear-gradient(145deg,#e0d0b0,#c8b080)', minHeight: 320 }}>🏠</div>
            }
            {/* Gradient edge fondu */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #fff2e0 0%, transparent 22%)' }} />

            {/* Widget flottant */}
            <div
              className="absolute bottom-10 right-[-12px] hidden md:block z-10 bg-white rounded-[18px] p-5 w-[230px]"
              style={{ boxShadow: '0 16px 48px rgba(0,36,63,0.18)' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#0097b2' }}>Prochain dispo</p>
              <p className="font-[var(--font-alkatra)] font-bold text-[15px] mb-2.5" style={{ color: '#00243f' }}>
                {properties?.[0]?.name || 'Appartement Caen'}
              </p>
              <Link href="/logements" className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,151,178,0.08)', color: '#0097b2' }}>
                Voir les disponibilités →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS BAND — navy
      ═══════════════════════════════════════ */}
      <section id="stats" className="relative overflow-hidden py-[72px]" style={{ background: '#00243f' }}>
        {/* Blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(115,199,214,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,151,178,0.08) 0%, transparent 70%)' }} />
        {/* Grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: GRAIN, backgroundSize: '256px' }} />

        <div className="relative z-10 max-w-[900px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { target: 716,  suffix: '',   label: 'Évaluations' },
            { target: 466,  suffix: '',   label: 'Note moyenne', prefix: '', raw: '4,66★' },
            { target: 9,    suffix: ' ans', label: "D'expérience" },
            { target: 14,   suffix: '',   label: 'Logements' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <span className="block font-[var(--font-suez)] text-[52px] leading-none mb-2" style={{ color: '#73c7d6' }}>
                {s.raw
                  ? s.raw
                  : <CountUp target={s.target} suffix={s.suffix} prefix={s.prefix} />
                }
              </span>
              <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LOGEMENTS
      ═══════════════════════════════════════ */}
      <section id="logements" className="relative overflow-hidden py-[100px]" style={{ background: '#fff2e0' }}>
        {/* Grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: GRAIN, backgroundSize: '256px' }} />

        <div className="relative z-10 max-w-[1140px] mx-auto px-6">
          <ScrollReveal>
            <p className="text-[12px] font-bold tracking-[3px] uppercase text-center mb-2.5" style={{ color: '#0097b2' }}>Nos logements</p>
            <h2 className="font-[var(--font-suez)] text-center mb-3.5" style={{ fontSize: 'clamp(28px,3.5vw,46px)', color: '#00243f', lineHeight: 1.15 }}>
              Réservez directement,<br />économisez les frais
            </h2>
            <p className="text-[17px] text-center max-w-[500px] mx-auto" style={{ color: '#5a5a5a', lineHeight: 1.6 }}>
              Des appartements et maisons soigneusement sélectionnés à Caen et en Normandie.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-[52px]">
            {(properties || []).map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 80}>
                <Link href={`/logements/${p.id}`} className="block group">
                  <div
                    className="rounded-[20px] overflow-hidden border transition-all duration-300 group-hover:-translate-y-[5px]"
                    style={{ background: '#fffdf8', borderColor: 'rgba(0,151,178,0.15)', boxShadow: '0 2px 12px rgba(0,36,63,0.04)' }}
                  >
                    {/* Photo */}
                    <div className="relative h-[220px] overflow-hidden">
                      {p.cover_image
                        ? <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="w-full h-full flex items-center justify-center text-6xl opacity-40" style={{ background: 'linear-gradient(145deg,#e8d8c0,#d0bfa0)' }}>🏠</div>
                      }
                      {/* Badge rating */}
                      <span className="absolute top-3 right-3 bg-white text-[12px] font-bold px-2.5 py-1 rounded-full shadow-md" style={{ color: '#00243f' }}>
                        ⭐ 4.9
                      </span>
                      {/* Badge type */}
                      <span className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#0097b2' }}>
                        {p.bedrooms ? `${p.bedrooms} ch.` : 'Studio'}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="p-5">
                      <p className="text-[11px] font-bold tracking-[2px] uppercase mb-1" style={{ color: '#0097b2' }}>Caen</p>
                      <p className="font-[var(--font-alkatra)] text-[17px] font-bold mb-0.5" style={{ color: '#00243f' }}>{p.name}</p>
                      <p className="text-[13px] mb-3.5 truncate" style={{ color: '#5a5a5a' }}>{p.address || 'Caen, Normandie'}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-[12px]" style={{ color: '#5a5a5a' }}>
                          <span>👤 {p.max_guests || 2}</span>
                          <span>🛏 {p.bedrooms || 1}</span>
                        </div>
                        {p.base_price && (
                          <p className="font-[var(--font-suez)] text-[20px]" style={{ color: '#00243f' }}>
                            {p.base_price}€ <span className="font-[var(--font-quicksand)] text-[12px] font-medium" style={{ color: '#5a5a5a' }}>/nuit</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="text-center mt-12">
              <Link
                href="/logements"
                className="inline-flex items-center px-8 py-4 rounded-full text-[15px] font-bold border-2 transition-all duration-200 hover:bg-[#00243f] hover:text-white"
                style={{ borderColor: '#00243f', color: '#00243f' }}
              >
                Voir tous nos logements →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES
      ═══════════════════════════════════════ */}
      <section id="services" className="pb-[80px] pt-[100px]" style={{ background: '#fafafa' }}>
        <div className="max-w-[1140px] mx-auto px-6 mb-12">
          <ScrollReveal>
            <p className="text-[12px] font-bold tracking-[3px] uppercase mb-2.5" style={{ color: '#0097b2' }}>Ce qu'on gère pour vous</p>
            <h2 className="font-[var(--font-suez)] mb-3" style={{ fontSize: 'clamp(28px,3.5vw,46px)', color: '#00243f', lineHeight: 1.15 }}>
              Une conciergerie<br />complète
            </h2>
            <p className="text-[17px] max-w-[500px]" style={{ color: '#5a5a5a', lineHeight: 1.6 }}>
              De l'accueil des voyageurs à la gestion des imprévus, on s'occupe de tout.
            </p>
          </ScrollReveal>
        </div>

        <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 80}>
              <div
                className="relative h-[380px] rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[6px]"
                style={{ boxShadow: '0 4px 24px rgba(0,36,63,0.08)' }}
              >
                {/* BG gradient */}
                <div className="absolute inset-0" style={{ background: s.gradient }} />
                {/* Icon décoratif */}
                <div className="absolute inset-0 flex items-center justify-center text-[80px] opacity-20 select-none">{s.icon}</div>
                {/* Overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                {/* Text bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="block text-[24px] mb-2">{s.icon}</span>
                  <p className="font-[var(--font-alkatra)] text-[17px] font-bold text-white leading-[1.3]">{s.title}</p>
                  <p className="text-[13px] text-white/70 mt-1">{s.sub}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROPRIÉTAIRES
      ═══════════════════════════════════════ */}
      <section id="proprio" className="relative overflow-hidden py-[100px]" style={{ background: '#fff2e0' }}>
        {/* Blobs */}
        <div className="absolute top-[-60px] right-[-80px] w-[350px] h-[350px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,151,178,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[40px] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,151,178,0.07) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[700px] mx-auto px-6 text-center">
          <ScrollReveal>
            <p className="text-[12px] font-bold tracking-[3px] uppercase mb-3" style={{ color: '#0097b2' }}>Pour les propriétaires</p>
            <h2 className="font-[var(--font-suez)] mb-4" style={{ fontSize: 'clamp(28px,3.5vw,48px)', color: '#00243f', lineHeight: 1.15 }}>
              Confiez votre bien,<br />percevez vos revenus
            </h2>
            <p className="text-[18px] mb-14 mx-auto max-w-[540px]" style={{ color: '#5a5a5a', lineHeight: 1.65 }}>
              Nous gérons tout — de la mise en ligne à la remise des clés — pour que vous n'ayez rien à faire.
            </p>
          </ScrollReveal>

          <div className="mb-14">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 100}>
                <div className="flex items-start gap-6 py-6 text-left" style={{ borderBottom: i < STEPS.length - 1 ? '1px solid rgba(0,36,63,0.08)' : 'none' }}>
                  <div
                    className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center text-2xl"
                    style={{ border: '2px solid #0097b2', background: 'rgba(0,151,178,0.06)' }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-[var(--font-alkatra)] text-[17px] font-bold mb-1.5" style={{ color: '#00243f' }}>{step.title}</p>
                    <p className="text-[14px] leading-[1.6]" style={{ color: '#5a5a5a' }}>{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <a
              href="mailto:contact@conciergori.fr"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#0097b2', boxShadow: '0 8px 28px rgba(0,151,178,0.3)' }}
            >
              Devenir partenaire →
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TÉMOIGNAGES
      ═══════════════════════════════════════ */}
      <section id="temoignages" className="relative overflow-hidden py-[100px]" style={{ background: '#fafafa' }}>
        {/* Grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: GRAIN, backgroundSize: '256px' }} />
        {/* Blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-[320px] h-[320px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(115,199,214,0.09) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[60px] left-[-80px] w-[260px] h-[260px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,151,178,0.07) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-[1140px] mx-auto px-6">
          <ScrollReveal>
            <p className="text-[12px] font-bold tracking-[3px] uppercase text-center mb-2.5" style={{ color: '#0097b2' }}>Ils nous font confiance</p>
            <h2 className="font-[var(--font-suez)] text-center mb-3" style={{ fontSize: 'clamp(28px,3.5vw,46px)', color: '#00243f', lineHeight: 1.15 }}>
              716 avis positifs
            </h2>
            <p className="text-[17px] text-center max-w-[420px] mx-auto" style={{ color: '#5a5a5a', lineHeight: 1.6 }}>
              Note moyenne de 4,66★ sur Airbnb — nos voyageurs parlent pour nous.
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-12 relative z-10">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════ */}
      <section id="cta-final" className="relative overflow-hidden py-[100px]" style={{ background: '#fff2e0' }}>
        <ScrollReveal>
          <div
            className="relative overflow-hidden text-center mx-auto px-10 md:px-20 py-[80px] rounded-[28px]"
            style={{ background: '#00243f', maxWidth: 'min(1100px, 95vw)' }}
          >
            {/* Circles décoratifs */}
            <div className="absolute top-[-100px] right-[-80px] w-[320px] h-[320px] rounded-full" style={{ background: '#fff', opacity: 0.08 }} />
            <div className="absolute bottom-[-70px] left-[-50px] w-[200px] h-[200px] rounded-full" style={{ background: '#fff', opacity: 0.08 }} />
            <div className="absolute top-1/2 right-[28%] -translate-y-1/2 w-[140px] h-[140px] rounded-full" style={{ background: '#fff', opacity: 0.08 }} />
            {/* Grain */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: GRAIN, backgroundSize: '256px' }} />

            <div className="relative z-10">
              <p className="text-[12px] font-bold tracking-[3px] uppercase mb-4" style={{ color: '#0097b2' }}>Prêt à réserver ?</p>
              <h2 className="font-[var(--font-suez)] text-white mb-4" style={{ fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.15 }}>
                Votre prochain séjour<br />à Caen commence ici
              </h2>
              <p className="text-[17px] max-w-[500px] mx-auto mb-11" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                Réservez directement et économisez les frais de service Airbnb. Conciergerie locale, logements soignés.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/logements"
                  className="inline-flex items-center px-8 py-4 rounded-full text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#0097b2', boxShadow: '0 8px 28px rgba(0,151,178,0.4)' }}
                >
                  Voir les logements
                </Link>
                <a
                  href="mailto:contact@conciergori.fr"
                  className="inline-flex items-center px-8 py-4 rounded-full text-[15px] font-bold text-white transition-all duration-200 hover:bg-white/10"
                  style={{ border: '2px solid rgba(255,255,255,0.35)' }}
                >
                  Confier mon bien
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 48px 32px' }}>
        <div className="max-w-[1140px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-14 mb-12">
            {/* Brand */}
            <div>
              <p className="font-[var(--font-alkatra)] text-[28px] font-bold mb-3" style={{ color: '#fff' }}>
                Concierg<span style={{ color: '#0097b2' }}>&apos;ori</span>
              </p>
              <p className="text-[14px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Conciergerie locale à Caen.<br />
                Votre séjour en Normandie, sans les complications.
              </p>
            </div>
            {/* Nav */}
            <div>
              <p className="text-[12px] font-bold tracking-[2px] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.9)' }}>Navigation</p>
              <ul className="space-y-3">
                {[
                  { href: '/logements', label: 'Nos logements' },
                  { href: '#services',  label: 'Services' },
                  { href: '#proprio',   label: 'Propriétaires' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-[14px] transition-colors duration-200 hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <p className="text-[12px] font-bold tracking-[2px] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.9)' }}>Contact</p>
              <div className="space-y-3">
                <a href="mailto:contact@conciergori.fr" className="flex items-center gap-2.5 text-[14px] transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  contact@conciergori.fr
                </a>
                <p className="flex items-center gap-2.5 text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Caen, Normandie
                </p>
              </div>
              <div className="flex gap-3 mt-5">
                {[
                  { href: 'https://www.airbnb.fr', label: 'Airbnb', icon: '🏠' },
                ].map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg transition-all duration-200 hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-[13px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
            © 2025 Concierg&apos;ori · Fait avec ❤️ en Normandie
          </div>
        </div>
      </footer>
    </>
  )
}
