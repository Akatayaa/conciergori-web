import { describe, it, expect } from 'vitest'

/**
 * Tests de la logique de résolution tenant.
 * On teste la logique pure sans appel Supabase.
 */

function extractSlugFromHostname(hostname: string): string | null {
  const clean = hostname.split(':')[0]
  const parts = clean.split('.')
  // sous-domaine de sejour.app → slug
  if (parts.length >= 3 && parts.slice(1).join('.') === 'sejour.app') {
    return parts[0]
  }
  return null
}

function isCustomDomain(hostname: string): boolean {
  const clean = hostname.split(':')[0]
  // N'est pas un sous-domaine sejour.app ni localhost ni vercel.app
  return !clean.includes('sejour.app') && !clean.includes('vercel.app') && clean !== 'localhost'
}

describe('Résolution tenant par hostname', () => {
  it('domaine custom → doit chercher par custom_domain', () => {
    expect(isCustomDomain('conciergori.fr')).toBe(true)
    expect(isCustomDomain('paul-concierge.fr')).toBe(true)
  })

  it('sous-domaine sejour.app → extraire le slug', () => {
    expect(extractSlugFromHostname('oriane.sejour.app')).toBe('oriane')
    expect(extractSlugFromHostname('paul.sejour.app')).toBe('paul')
  })

  it('localhost → pas un domaine custom', () => {
    expect(isCustomDomain('localhost')).toBe(false)
  })

  it('vercel.app → pas un domaine custom', () => {
    expect(isCustomDomain('conciergori-web.vercel.app')).toBe(false)
  })

  it('port ignoré dans la résolution', () => {
    expect(isCustomDomain('localhost:3000')).toBe(false)
    // Avec strip du port, paul.sejour.app:3000 → paul.sejour.app → slug 'paul'
    expect(extractSlugFromHostname('paul.sejour.app')).toBe('paul')
  })
})
