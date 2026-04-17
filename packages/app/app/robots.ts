import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/terms', '/cookies', '/privacy'], // Hide API routes and legal pages from crawlers
    },
    sitemap: 'https://www.loghead.dev/sitemap.xml',
  };
}
