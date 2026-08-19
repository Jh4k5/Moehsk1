#!/usr/bin/env node
// ─── Does a paid lesson's content actually stay on the server? ──────────────
//
// Hiding paid content with CSS or a client-side `if` is not a paywall: the
// words are still in the HTML, and "view source" is the whole bypass. This
// checks the only thing that matters — what the server SENDS.
//
// For every lesson, fetch its public page and look for the lesson's own
// vocabulary in the response body. Free lessons must contain theirs (otherwise
// the free tier is broken and nobody can evaluate the product); paid lessons
// must contain none of theirs.
//
// Characters that appear in the lesson's own Chinese TITLE are excluded: the
// title is deliberately public — it is the page's <h1> and its <title> — so a
// word that happens to share a character with it is not a leak.
//
//   node scripts/check-paywall.js [baseUrl]      (default http://localhost:3000)

const { load } = require('./ts-load')

const BASE = process.argv[2] || 'http://localhost:3000'
const FREE_LEVEL = 1
const FREE_LESSON_COUNT = 2

const LEVELS = {
  1: { lessons: load('src/data/lessons.ts').lessons, vocab: load('src/data/vocabulary.ts').vocabulary },
  2: { lessons: load('src/data/hsk2/lessons2.ts').lessons2, vocab: load('src/data/hsk2/vocabulary2.ts').vocabulary2 },
  3: { lessons: load('src/data/hsk3/lessons3.ts').lessons3, vocab: load('src/data/hsk3/vocabulary3.ts').vocabulary3 },
}

async function main() {
  let failures = 0
  let checked = 0

  for (const level of [1, 2, 3]) {
    const { lessons, vocab } = LEVELS[level]
    const byId = new Map(vocab.map((w) => [w.id, w]))

    for (const [index, lesson] of lessons.entries()) {
      const slug = `hsk${level}-${lesson.id}`
      const free = level === FREE_LEVEL && index < FREE_LESSON_COUNT
      const res = await fetch(`${BASE}/ar/lesson/${slug}`)
      if (!res.ok) {
        console.log(`✗ /ar/lesson/${slug} → HTTP ${res.status}`)
        failures++
        continue
      }
      const body = await res.text()
      checked++

      // The title is public by design, so its characters cannot count as a leak.
      const titleChars = new Set(lesson.titleZh)
      const words = lesson.vocabularyIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .filter((w) => [...w.zh].some((ch) => !titleChars.has(ch)))

      const present = words.filter((w) => body.includes(w.zh))

      if (free && present.length === 0) {
        console.log(`✗ ${slug} is FREE but ships none of its ${words.length} words — the free tier is empty`)
        failures++
      } else if (!free && present.length > 0) {
        console.log(
          `✗ ${slug} is PAID but ships ${present.length} of its words: ${present.slice(0, 6).map((w) => w.zh).join(' ')}`,
        )
        failures++
      }
    }
  }

  console.log(
    failures === 0
      ? `✓ paywall holds — ${checked} lesson pages checked, no paid vocabulary in any response body`
      : `✗ ${failures} paywall failure(s) across ${checked} lesson pages`,
  )
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('check-paywall failed to run:', err.message)
  console.error('Is the server up? Start it with `npx next start -p 3000` after `npm run build`.')
  process.exit(2)
})
