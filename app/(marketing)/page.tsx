import Link from 'next/link'
export default function LandingPage() {
  return (
    <div className="font-[var(--font-quicksand)]" style={{ color: '#4b4b4b' }}>

      {/* ── 1. NAVBAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: '#fff2e0', borderBottom: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#"><img src="/logo.svg" alt="Concierg'ori" className="h-14 w-auto" /></a>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Services</a>
            <a href="/logements" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Logements</a>
            <a href="#tarifs" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Tarifs</a>
            <a href="#contact" className="text-sm font-medium hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>Contact</a>
          </nav>

          {/* CTA */}
          <a
            href="#contact"
            className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ backgroundColor: '#0097b2' }}
          >
            Réserver directement
          </a>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-md text-white/80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── 2. HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#fff2e0' }}>
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(0,151,178,0.08) 0%, transparent 60%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          {/* Trust badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8"
            style={{ backgroundColor: 'rgba(0,151,178,0.1)', borderColor: 'rgba(0,151,178,0.3)', color: '#0097b2' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#0097b2] animate-pulse" />
            15+ biens gérés à Caen
          </div>

          {/* Headline */}
          <h1 className="font-[var(--font-suez)] text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 max-w-4xl" style={{ color: '#00243f' }}>
            Votre conciergerie<br />
            <span style={{ color: '#0097b2' }}>Airbnb à Caen</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: '#4b4b4b' }}>
            Réservez directement chez Oriane et <strong>économisez les frais de plateforme Airbnb</strong>.
            Une gestion sur-mesure, une communication directe et des offres exclusives pour votre séjour en Normandie.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ backgroundColor: '#0097b2' }}
            >
              Réserver directement
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold border-2 transition-all hover:bg-[#0097b2]/10"
              style={{ borderColor: '#0097b2', color: '#0097b2' }}
            >
              Découvrir nos services
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            {[
              { value: '15+', label: 'Biens gérés' },
              { value: '200+', label: 'Voyageurs accueillis' },
              { value: '4.9★', label: 'Note moyenne' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-[var(--font-suez)] text-3xl" style={{ color: '#0097b2' }}>{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: '#4b4b4b' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES GRID ──────────────────────────────────────────── */}
      <section id="services" className="py-20 md:py-28" style={{ backgroundColor: 'rgba(115,199,214,0.12)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#0097b2' }}>Ce que nous faisons</p>
            <h2 className="font-[var(--font-alkatra)] text-3xl md:text-4xl font-bold" style={{ color: '#00243f' }}>
              Nos services de conciergerie
            </h2>
            <p className="mt-4 max-w-xl mx-auto" style={{ color: '#4b4b4b' }}>
              De l&apos;accueil à la maintenance, nous gérons tout pour que votre bien brille et que vos voyageurs repartent ravis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '🗝️', title: 'Check-in / Check-out', desc: 'Accueil personnalisé de vos voyageurs, remise des clés et état des lieux rigoureux à chaque départ.' },
              { emoji: '🧹', title: 'Ménage professionnel', desc: 'Nettoyage en profondeur entre chaque séjour selon les standards hôteliers pour des avis 5 étoiles.' },
              { emoji: '📅', title: 'Gestion calendrier', desc: 'Optimisation des disponibilités, synchronisation multi-plateformes et prix dynamiques pour maximiser vos revenus.' },
              { emoji: '🛏️', title: 'Linge de maison', desc: 'Fourniture, lavage et repassage du linge hôtelier — draps, serviettes et peignoirs impeccables.' },
              { emoji: '🔧', title: 'Maintenance 24/7', desc: 'Réactivité totale pour toute intervention technique : plomberie, électricité, petites réparations.' },
              { emoji: '🎁', title: 'Cadeaux de bienvenue', desc: 'Paniers d\'accueil personnalisés avec produits locaux normands pour une première impression inoubliable.' },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-2xl p-7 border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                style={{ borderColor: 'rgba(115,199,214,0.4)' }}
              >
                <div className="text-4xl mb-5">{service.emoji}</div>
                <h3 className="font-[var(--font-alkatra)] text-lg font-semibold mb-2 group-hover:text-[#0097b2] transition-colors" style={{ color: '#00243f' }}>
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4b4b4b' }}>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#0097b2' }}>Simple comme bonjour</p>
            <h2 className="font-[var(--font-alkatra)] text-3xl md:text-4xl font-bold" style={{ color: '#00243f' }}>
              Comment ça fonctionne ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-0.5 bg-gradient-to-r from-transparent via-[#73c7d6] to-transparent" />

            {[
              { step: '01', title: 'Contactez-nous', desc: 'Envoyez-nous un message avec vos dates. On vous répond sous 2h pour confirmer la disponibilité et discuter de votre séjour.' },
              { step: '02', title: 'On s\'occupe de tout', desc: 'Oriane et son équipe préparent votre logement : ménage, linge frais, panier d\'accueil et accueil personnalisé à votre arrivée.' },
              { step: '03', title: 'Vous encaissez', desc: 'Réglez directement, sans frais de plateforme. Vous profitez d\'un tarif avantageux et d\'un service premium. Simple et transparent.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-[var(--font-suez)] text-2xl mb-6 shadow-lg"
                  style={{ backgroundColor: '#0097b2' }}
                >
                  {item.step}
                </div>
                <h3 className="font-[var(--font-alkatra)] text-xl font-bold mb-3" style={{ color: '#00243f' }}>{item.title}</h3>
                <p className="leading-relaxed" style={{ color: '#4b4b4b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. WHY BOOK DIRECT ────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#00243f' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#0097b2' }}>La différence</p>
            <h2 className="font-[var(--font-alkatra)] text-3xl md:text-4xl font-bold text-white">
              Pourquoi réserver en direct ?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-white/60">
              Évitez les intermédiaires et profitez d&apos;une expérience bien supérieure à ce qu&apos;offrent les plateformes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '💸',
                title: 'Pas de frais plateforme',
                desc: 'Airbnb prélève jusqu\'à 20% de frais voyageur. En réservant directement, vous payez le prix juste — et Oriane gagne plus.',
                highlight: 'Économisez jusqu\'à 20%',
              },
              {
                icon: '💬',
                title: 'Communication directe',
                desc: 'Parlez directement à Oriane via WhatsApp ou téléphone. Pas de messagerie filtrée, des réponses rapides et personnalisées.',
                highlight: 'Réponse en moins de 2h',
              },
              {
                icon: '🎯',
                title: 'Offres exclusives',
                desc: 'Séjours longs, retours réguliers, groupes — bénéficiez de tarifs préférentiels et d\'extras gratuits réservés aux clients directs.',
                highlight: 'Tarifs sur-mesure',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded-2xl p-8 border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                <div className="text-4xl mb-5">{benefit.icon}</div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 text-white" style={{ backgroundColor: '#0097b2' }}>
                  {benefit.highlight}
                </div>
                <h3 className="font-[var(--font-alkatra)] text-lg font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TESTIMONIALS ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: '#fff2e0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#0097b2' }}>Ils nous font confiance</p>
            <h2 className="font-[var(--font-alkatra)] text-3xl md:text-4xl font-bold" style={{ color: '#00243f' }}>
              Ce que disent nos voyageurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sophie & Marc',
                location: 'Paris',
                date: 'Novembre 2024',
                rating: 5,
                text: 'Week-end parfait à Caen ! Oriane nous a accueillis avec un panier de produits normands, c\'était une vraie attention. L\'appartement était impeccable. Et sans les frais Airbnb, on a économisé plus de 40€. On reviendra sans hésiter !',
              },
              {
                name: 'Thomas L.',
                location: 'Lyon',
                date: 'Octobre 2024',
                rating: 5,
                text: 'Séjour d\'une semaine pour le travail. Communication ultra-réactive, logement propre comme un hôtel 4 étoiles et disponibilité 24/7 quand j\'ai eu un petit souci avec le chauffage. La réservation directe, c\'est vraiment le bon plan.',
              },
              {
                name: 'Famille Bertrand',
                location: 'Bordeaux',
                date: 'Août 2024',
                rating: 5,
                text: 'Vacances en famille avec 3 enfants, Oriane a tout anticipé : lits bébé, Kit de bienvenue pour les petits, conseils sur les activités à Caen. Tarif négocié directement, bien mieux qu\'Airbnb. Une adresse qu\'on garde précieusement !',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-2xl p-7 shadow-sm border" style={{ borderColor: 'rgba(115,199,214,0.4)' }}>
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-lg" style={{ color: '#0097b2' }}>★</span>
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm leading-relaxed mb-6 italic" style={{ color: '#4b4b4b' }}>
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#0097b2' }}>
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#00243f' }}>{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.location} · {testimonial.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA SECTION ────────────────────────────────────────────── */}
      <section id="contact" className="py-20 md:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-3xl p-12 md:p-16" style={{ background: 'linear-gradient(135deg, #00243f 0%, #003d5c 100%)' }}>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#0097b2' }}>Réservation directe</p>
            <h2 className="font-[var(--font-suez)] text-3xl md:text-4xl text-white mb-5">
              Prêt à réserver ?
            </h2>
            <p className="text-white/60 mb-10 max-w-md mx-auto leading-relaxed">
              Contactez Oriane directement pour connaître les disponibilités, obtenir un tarif personnalisé et profiter d&apos;un séjour 5 étoiles à Caen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="mailto:oriane@conciergori.fr"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-xl"
                style={{ backgroundColor: '#0097b2' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Envoyer un email
              </a>
              <a
                href="https://wa.me/33600000000"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold border-2 border-white/30 text-white transition-all hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
                </svg>
                WhatsApp
              </a>
            </div>

            <p className="text-white/40 text-sm">
              📍 Caen, Normandie · Réponse garantie sous 2h
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. FOOTER ─────────────────────────────────────────────────── */}
      <footer id="tarifs" style={{ backgroundColor: '#fff2e0', borderTop: '1px solid #e8d8c0' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <a href="#"><img src="/logo.svg" alt="Concierg'ori" className="h-16 w-auto" /></a>

            {/* Links */}
            <nav className="flex flex-wrap justify-center gap-6">
              <a href="#services" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Services</a>
              <a href="/logements" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Logements</a>
              <a href="#tarifs" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Tarifs</a>
              <a href="#contact" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Contact</a>
              <a href="#" className="text-sm hover:text-[#0097b2] transition-colors" style={{ color: '#4b4b4b' }}>Mentions légales</a>
            </nav>

            {/* Copyright */}
            <p className="text-sm" style={{ color: '#979797' }}>
              © Concierg&apos;ori 2025 · Caen, Normandie
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
