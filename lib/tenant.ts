// Helpers pour la résolution et la gestion des tenants

export interface Tenant {
  id: string
  slug: string
  name: string
  plan: 'starter' | 'pro' | 'enterprise'
  customDomain?: string
  brandingConfig?: Record<string, unknown>
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  // TODO: Query Supabase
  return null
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  // TODO: Query Supabase
  return null
}
