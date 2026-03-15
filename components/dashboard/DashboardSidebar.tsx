'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

interface DashboardSidebarProps {
  tenantSlug: string
  tenantName: string
}

const NAV = [
  { href: 'dashboard',               label: "🏠 Vue d'ensemble" },
  { href: 'dashboard/logements',     label: '🛏 Logements' },
  { href: 'dashboard/reservations',  label: '📅 Réservations' },
  { href: 'dashboard/calendrier',    label: '📆 Calendrier' },
  { href: 'dashboard/menage',        label: '🧹 Ménage' },
  { href: 'dashboard/proprietaires', label: '🏠 Propriétaires' },
  { href: 'dashboard/facturation',   label: '🧾 Facturation' },
  { href: 'dashboard/livrets',        label: "📋 Livrets d'accueil" },
  { href: 'dashboard/pricing',       label: '💰 Prix & règles' },
]

export default function DashboardSidebar({ tenantSlug, tenantName }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === `/${tenantSlug}/${href}`

  const links = NAV.map(item => ({
    ...item,
    fullHref: `/${tenantSlug}/${item.href}`,
    active: isActive(item.href),
  }))

  return (
    <>
      {/* ── Mobile topbar ── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
        style={{ backgroundColor: '#00243f' }}>
        <div className="flex items-center gap-2">
          <div className="rounded-lg overflow-hidden bg-white p-0.5">
            <img src="/logo.svg" alt="logo" className="h-7 w-7 object-cover" />
          </div>
          <span className="text-white font-[var(--font-suez)] text-sm">Concierg&apos;ori</span>
        </div>
        <button onClick={() => setOpen(o => !o)} className="text-white p-1.5 rounded-lg hover:bg-white/10">
          {open
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </header>

      {/* ── Mobile menu dropdown ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-20 pt-14" style={{ backgroundColor: 'rgba(0,36,63,0.97)' }}
          onClick={() => setOpen(false)}>
          <nav className="p-4 space-y-1" onClick={e => e.stopPropagation()}>
            {links.map(item => (
              <Link key={item.fullHref} href={item.fullHref} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.active ? 'bg-white/10 text-white' : 'text-white/60'
                }`}>
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10">
              <Link href="/" className="text-xs text-[#73c7d6] block px-4 pb-2">← Voir le site</Link>
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0 sticky top-0 h-screen"
        style={{ backgroundColor: '#00243f' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl overflow-hidden bg-white p-1 flex-shrink-0">
              <img src="/logo.svg" alt="Concierg'ori" className="h-10 w-10 object-cover" />
            </div>
            <div>
              <p className="text-white font-[var(--font-suez)] text-base leading-tight">Concierg&apos;ori</p>
              <p className="text-white/40 text-xs">Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(item => (
            <Link key={item.fullHref} href={item.fullHref}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-xs text-white/40">{tenantName}</p>
          <Link href="/" className="text-xs text-[#73c7d6] hover:underline mt-1 block">← Voir le site</Link>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
