// define regras do robots.txt para crawlers
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.veruscientifica.com.br'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/editor/',
          '/login',
          '/unauthorized',
          // '/search' removido para permitir indexação da página de busca
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
