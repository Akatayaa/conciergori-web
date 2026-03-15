'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#logements',   label: 'Logements' },
    { href: '#services',    label: 'Services' },
    { href: '#proprio',     label: 'Propriétaires' },
    { href: '/confier-mon-bien', label: 'Confier mon bien' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[200] h-[68px] flex items-center px-6 md:px-12 transition-all duration-300"
      style={scrolled
        ? { background: 'rgba(0,36,63,0.97)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }
        : { background: 'transparent', borderBottom: '1px solid transparent' }
      }
    >
      {/* Logo */}
      <div className="flex-none animate-[fadeInDown_0.4s_ease_forwards] opacity-0" style={{ animationDelay: '0s' }}>
        <Link href="/" className="font-[var(--font-alkatra)] text-[28px] font-bold transition-colors duration-300"
          style={{ color: scrolled ? '#fff' : '#00243f' }}>
          Concierg<span style={{ color: '#0097b2' }}>&apos;ori</span>
        </Link>
      </div>

      {/* Desktop center links */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-9">
        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className="text-sm font-semibold transition-colors duration-200 hover:text-[#0097b2] animate-[fadeInDown_0.4s_ease_forwards] opacity-0"
            style={{
              color: scrolled ? 'rgba(255,255,255,0.8)' : '#00243f',
              animationDelay: `${(i + 1) * 0.05}s`,
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* Desktop CTA */}
      <div className="hidden md:block flex-none animate-[fadeInDown_0.4s_ease_forwards] opacity-0" style={{ animationDelay: '0.2s' }}>
        <Link
          href="/logements"
          className="inline-flex items-center px-[22px] py-[10px] rounded-full text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px"
          style={{ background: '#0097b2', boxShadow: '0 4px 16px rgba(0,151,178,0.3)' }}
        >
          Nos logements
        </Link>
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden flex-1 flex justify-end">
        <button
          onClick={() => setOpen(o => !o)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: scrolled ? '#fff' : '#00243f' }}
          aria-label="Menu"
        >
          {open
            ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="absolute top-[68px] left-0 right-0 py-4 px-6 space-y-1 md:hidden"
          style={{ background: 'rgba(0,36,63,0.98)', backdropFilter: 'blur(12px)' }}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-semibold text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/logements"
            onClick={() => setOpen(false)}
            className="block mt-3 text-center py-3 rounded-full text-sm font-bold text-white"
            style={{ background: '#0097b2' }}
          >
            Nos logements
          </Link>
        </div>
      )}
    </header>
  )
}
