import { NextResponse, type NextRequest } from 'next/server'
import { getVocabularyForViewer, getLevelExtrasForViewer } from '@/lib/entitlement'
import { levelContent } from '@/lib/curriculum/content-source'

// ─── GET /api/content/[level] ───────────────────────────────────────────────
//
// The ONLY way a paid level's vocabulary reaches a browser.
//
// It exists because the alternative had been shipping the whole curriculum to
// everyone. `src/lib/levels.ts` was a `'use client'` module that statically
// imported all three levels, and the navigation shell imported it — so every
// page of the platform, including the ones a stranger loads, carried a 918 KB
// chunk holding every HSK2 and HSK3 word with its Arabic meaning. The paid
// product, complete, by "save as", with no account and no trace.
//
// Now the level is fetched, and `getVocabularyForViewer` decides what comes
// back: everything for a subscriber, the free lessons' words for everyone else,
// and a COUNT of what is withheld rather than the words themselves.
//
// The filtering happens on this side of the wall. A response that contained the
// locked words plus a "locked: true" flag would be the same leak wearing a hat.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ level: string }> },
) {
  const { level: raw } = await params
  const level = Number(raw)
  if (![1, 2, 3].includes(level)) {
    return NextResponse.json({ error: 'unknown_level' }, { status: 404 })
  }

  const result = await getVocabularyForViewer(level)

  // The rest of the level's material — the daily questions, the stories, the
  // picture dictionary, the grammar — is part of the same paid product as the
  // words, so it rides the same decision.
  //
  // But "the same decision" is NOT "all or nothing", and treating it that way
  // was a real defect. The words beside it were already sliced: the free
  // lessons' vocabulary comes through for everyone. These four were not, so a
  // visitor on the free tier got 30 genuine HSK2 words and then four blank
  // screens — a product that looks deleted rather than sampled. Whatever the
  // free tier contains, it must contain a real example of EVERY kind of
  // material, or it teaches the visitor that the platform is empty.
  //
  // `getLevelExtrasForViewer` returns the viewer's share as a limit function;
  // applying it here keeps the collections themselves on the server until the
  // moment they are cut.
  //
  // Assembled here rather than imported by the screens: `QASection` importing
  // `@/data/hsk3/qa3` directly is what kept a handful of HSK3 pairs in the
  // public bundle after the vocabulary itself was gated.
  const content = levelContent(level as 1 | 2 | 3)
  const access = await getLevelExtrasForViewer(level)

  const cut = <T,>(items: T[], limit: ((total: number) => number) | null): T[] =>
    limit === null ? items : items.slice(0, limit(items.length))

  const qa = cut(content.qa, access.qaLimit)
  const stories = cut(content.stories, access.storyLimit)
  const pictures = cut(content.pictures, access.pictureLimit)

  const extras = {
    qa,
    stories,
    pictures,
    grammar: access.grammar,
    // Counts, never the items. A screen showing "٥ من ٣٣ — والبقية بالاشتراك"
    // is honest about being a sample; one showing five with no total reads as
    // all there is, which is the impression that cost us this bug report.
    lockedExtras: {
      qa: content.qa.length - qa.length,
      stories: content.stories.length - stories.length,
      pictures: content.pictures.length - pictures.length,
      grammar: 0,
    },
  }

  return NextResponse.json({ ...result, ...extras }, {
    headers: {
      // Per-viewer by definition: two people get different word lists for the
      // same URL. A shared cache holding one of those answers would hand a
      // subscriber's copy to a stranger.
      'Cache-Control': 'private, no-store',
    },
  })
}
