import type { MetadataRoute } from 'next'
import { PUBLIC_INDEX } from '@/data/public-index.generated'
import { LOCALES } from '@/lib/locale'

// ─── /sitemap.xml ───────────────────────────────────────────────────────────
//
// 104 indexable pages existed with no way for a crawler to learn about most of
// them. The landing page links the three levels and HSK1's fifteen lessons;
// nothing links HSK2's or HSK3's, so two thirds of the deepest — and most
// specific — pages were reachable only by guessing the URL.
//
// Generated from the same index the path renders from, so a lesson added to the
// curriculum appears here without anyone remembering to add it.
//
// Every entry carries its `alternates.languages`, which is how a crawler learns
// that `/ar/lesson/hsk1-3` and `/en/lesson/hsk1-3` are one page in two
// languages rather than two pages competing with each other.

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moehsk1.vercel.app'

/** Both locales of one path, as a sitemap entry. */
function entry(
  pathAfterLocale: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
): MetadataRoute.Sitemap[number] {
  const suffix = pathAfterLocale ? `/${pathAfterLocale}` : ''
  return {
    url: `${SITE}/ar${suffix}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE}/${l}${suffix}`])),
    },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [entry('', 1, 'weekly')]

  for (const level of [1, 2, 3] as const) {
    pages.push(entry(`hsk/${level}`, 0.9, 'monthly'))
    for (const lesson of PUBLIC_INDEX[level].lessons) {
      // The deepest pages are the ones worth having: someone searching
      // «تعلم الصينية التحيات» wants a lesson, not a home page.
      pages.push(entry(`lesson/hsk${level}-${lesson.id}`, 0.7, 'monthly'))
    }
  }

  return pages
}
