import type { MetadataRoute } from 'next'

// ─── /robots.txt ───────────────────────────────────────────────────────────
//
// A route rather than a static file, so the `Sitemap:` line cannot fall out of
// step with the domain. The previous static file had no `Sitemap:` line at all,
// which is the single cheapest thing a site can give a crawler.
//
// The app routes are disallowed: `/ar/home`, `/ar/path`, `/ar/admin` are for a
// signed-in reader and carry no indexable content. Crawling them spends the
// site's crawl budget on pages that render as a skeleton to a visitor with no
// stored progress — budget that belongs to the 104 lesson pages.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moehsk1.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/ar/admin', '/en/admin', '/ar/me', '/en/me'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
