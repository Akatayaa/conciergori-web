import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://conciergori.fr'

  const { data: tenant } = await supabase
    .from('tenants').select('id').eq('slug', 'conciergori').single()

  const { data: properties } = await supabase
    .from('properties').select('id, updated_at').eq('tenant_id', tenant?.id ?? '')

  const propertyUrls = (properties ?? []).map(p => ({
    url: `${base}/logements/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/logements`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/confier-mon-bien`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...propertyUrls,
  ]
}
