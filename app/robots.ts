import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/conciergori/', '/api/'],
      },
    ],
    sitemap: 'https://conciergori.fr/sitemap.xml',
  }
}
