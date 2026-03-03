'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '#services', label: 'Services' },
    { href: '#logements', label: 'Logements' },
    { href: '#tarifs', label: 'Tarifs' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#fff2e0', borderBottom: '1px solid #e8d8c0' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" onClick={() => setOpen(false)}>
          <img src="/logo.svg" alt="Concierg'ori" className="h-14 w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href}
              className="text-sm font-medium hover:text-[#0097b2] transition-colors"
              style={{ color: '#00243f' }}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a href="/logements"
          className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#0097b2' }}>
          Réserver directement
        </a>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md"
          style={{ color: '#00243f' }}
          aria-label="Menu">
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t px-6 py-4 space-y-1" style={{ backgroundColor: '#fff2e0', borderColor: '#e8d8c0' }}>
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-base font-medium border-b hover:text-[#0097b2] transition-colors"
              style={{ color: '#00243f', borderColor: '#f0e8da' }}>
              {l.label}
            </a>
          ))}
          <a href="/logements" onClick={() => setOpen(false)}
            className="block mt-4 w-full text-center py-3 rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: '#0097b2' }}>
            Réserver directement
          </a>
        </div>
      )}
    </header>
  )
}
