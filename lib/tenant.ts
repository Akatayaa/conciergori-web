import { createClient } from '@supabase/supabase-js'

export interface TenantConfig {
  id: string
  slug: string
  name: string
  site_name: string | null
  custom_domain: string | null
  contact_email: string | null
  logo_url: string | null
  brand_primary: string
  brand_secondary: string
  brand_accent: string
  brand_font_heading: string
  city: string | null
  country: string
  timezone: string
  locale: string
  owner_commission_default: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cache en mémoire simple (invalide après 5 min)
const cache = new Map<string, { config: TenantConfig; at: number }>()
const TTL = 5 * 60 * 1000

async function fetchTenant(where: { slug?: string; domain?: string }): Promise<TenantConfig | null> {
  const cacheKey = where.slug ?? where.domain ?? ''
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < TTL) return cached.config

  let result
  if (where.slug) {
    result = await supabase.from('tenants').select('*').eq('slug', where.slug).single()
  } else if (where.domain) {
    result = await supabase.from('tenants').select('*').eq('custom_domain', where.domain).single()
  } else {
    return null
  }

  if (!result.data) return null
  const config = result.data as TenantConfig
  cache.set(cacheKey, { config, at: Date.now() })
  return config
}

export async function getTenantBySlug(slug: string): Promise<TenantConfig | null> {
  return fetchTenant({ slug })
}

export async function getTenantByDomain(domain: string): Promise<TenantConfig | null> {
  // Retirer le port si présent (localhost:3000)
  const cleanDomain = domain.split(':')[0]
  return fetchTenant({ domain: cleanDomain })
}

export async function getTenantFromRequest(hostname: string): Promise<TenantConfig | null> {
  // 1. Essayer par domaine custom (conciergori.fr)
  const byDomain = await getTenantByDomain(hostname)
  if (byDomain) return byDomain

  // 2. Extraire le slug depuis un sous-domaine Vercel (tenant.sejour.app)
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    const subdomain = parts[0]
    const bySlug = await getTenantBySlug(subdomain)
    if (bySlug) return bySlug
  }

  // 3. Fallback env var
  const fallbackSlug = process.env.TENANT_SLUG || 'conciergori'
  return getTenantBySlug(fallbackSlug)
}
