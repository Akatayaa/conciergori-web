/**
 * Utilitaire côté serveur pour passer la config tenant aux composants.
 * Usage : const config = await getTenantConfig(hostname)
 */
import { headers } from 'next/headers'
import { getTenantFromRequest } from './tenant'
import type { TenantConfig } from './tenant'

export async function getTenantConfigFromHeaders(): Promise<TenantConfig | null> {
  const headersList = await headers()
  const hostname = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost'
  return getTenantFromRequest(hostname)
}

export type { TenantConfig }
