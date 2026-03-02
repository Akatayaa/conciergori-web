export type Plan = 'starter' | 'pro' | 'enterprise'

export interface Tenant {
  id: string
  slug: string
  name: string
  plan: Plan
  customDomain?: string
  brandingConfig?: BrandingConfig
  createdAt: string
}

export interface BrandingConfig {
  primaryColor?: string
  logo?: string
  fontFamily?: string
}

export interface TenantUser {
  id: string
  tenantId: string
  userId: string
  role: 'owner' | 'staff' | 'viewer'
}
