#!/usr/bin/env node
// ─── Does paid content actually stay on the server? ────────────────────────
//
// Two surfaces, because the first version of this script only checked one and
// therefore passed green while the product was being given away.
//
//   A. THE HTML of every lesson page. A paid lesson must not print its words.
//   B. THE JAVASCRIPT BUNDLES. This is the one that was missed. `.next/static`
//      is served to anyone who loads any page, so a level's vocabulary sitting
//      in a shared chunk is the paid product delivered by "save as" — no
//      account, no payment, no trace. It is worse than a leak in the HTML,
//      because nothing in the rendered page reveals it.
//
// Surface B needs no server: it reads the build output. Surface A needs one and
// is skipped when nothing answers on the base URL, so this stays runnable in CI.
//
//   node scripts/check-paywall.js [baseUrl]

const fs = require('node:fs')
const path = require('node:path')
const { load } = require('./ts-load')

const ROOT = path.join(__dirname, '..')
const BASE = process.argv[2] || 'http://localhost:3000'
const FREE_LEVEL = 1
const FREE_LESSON_COUNT = 2
// EVERY paid-only word is probed, not a sample.
//
// This was `const PROBE_SIZE = 40` and it reported the paywall closed while two
// pairs were still in a public chunk — they simply were not among the first
// forty. A sample that misses is worse than no check, because it is believed.
// The full sweep costs about a second.

const LEVELS = {
  1: { lessons: load('src/data/lessons.ts').lessons, vocab: load('src/data/vocabulary.ts').vocabulary },
  2: { lessons: load('src/data/hsk2/lessons2.ts').lessons2, vocab: load('src/data/hsk2/vocabulary2.ts').vocabulary2 },
  3: { lessons: load('src/data/hsk3/lessons3.ts').lessons3, vocab: load('src/data/hsk3/vocabulary3.ts').vocabulary3 },
}

/** Everything the free tier legitimately ships. A word appearing in any of
 *  these is not evidence of a paid-level leak. */
const FREE_SOURCES = [
  'src/data/vocabulary.ts',
  'src/data/lessons.ts',
  'src/data/grammar.ts',
  'src/data/conversations.ts',
  'src/data/stories.ts',
  'src/data/visualDict.ts',
  'src/data/hsk1/extras.ts',
  'src/data/examBank.ts',
  'src/data/grammarPracticeQuestions.ts',
]

const failures = []
const notes = []

// ── Surface B: the client bundles ───────────────────────────────────────────
//
// A word counts as leaked only when its CHARACTERS AND its Arabic meaning both
// appear in the same file. A lone Chinese character proves nothing — it may be
// in a UI string or a shared radical — but a character next to its translation
// is the product.

function clientChunks() {
  const dir = path.join(ROOT, '.next/static/chunks')
  if (!fs.existsSync(dir)) return []
  const out = []
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.js')) out.push(full)
    }
  }
  walk(dir)
  return out
}

function checkBundles() {
  const chunks = clientChunks()
  if (chunks.length === 0) {
    notes.push('no build output found — run `npm run build` first (bundle check skipped)')
    return
  }
  notes.push(`${chunks.length} client chunks scanned`)

  // Only levels that are entirely behind the paywall. HSK1 is the free level:
  // its first lessons are the trial, and the plan's requirement is specifically
  // that HSK2 and HSK3 never reach a non-subscriber's browser.
  //
  // The probe excludes any word that the FREE content also contains. 48 HSK2
  // words and 52 HSK3 words also appear in HSK1 — 介绍 and 意思 carry identical
  // Arabic in both — so finding them in a bundle proves only that HSK1 is
  // there, which it is supposed to be. Probing with them produced confident
  // reports of leaks that were not leaks, which is the fastest way to make a
  // security check ignored.
  //
  // Lesson TITLES are public by design in both languages — `/ar/lesson/hsk2-5`
  // prints «في الفندق والانتظار / 在酒店» because the plan requires those pages
  // to be indexed. So a probe word that lives inside a title is not evidence of
  // anything: 酒店 sits in that Chinese title and فندق in that Arabic one, and
  // the check reported the pair as a leak until this was accounted for.
  const publicTitles = [1, 2, 3]
    .flatMap((l) => LEVELS[l].lessons)
    .flatMap((lesson) => [lesson.title ?? '', lesson.titleZh ?? ''])
    .join('\n')

  const freeText =
    FREE_SOURCES.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n') + '\n' + publicTitles

  for (const level of [2, 3]) {
    const probe = LEVELS[level].vocab
      .filter((w) => w.zh && w.meaning && w.zh.length > 1)
      // Out if the free content has it, or if it hides inside a public title.
      .filter((w) => !freeText.includes(w.zh))
      .filter((w) => !publicTitles.includes(w.meaning))

    if (probe.length < 10) {
      failures.push(`HSK${level}: only ${probe.length} words are unique enough to probe with — the check would be meaningless`)
      continue
    }

    // Every offending file, worst first — the first hit is often a small
    // shared chunk while the real payload sits in a much larger one, and
    // reporting only the first sends the fix to the wrong place.
    const offenders = []
    for (const file of chunks) {
      const text = fs.readFileSync(file, 'utf8')
      const leaked = probe.filter((w) => text.includes(w.zh) && text.includes(w.meaning))
      // ANY hit counts. The threshold used to be ">2" to absorb noise from
      // words HSK1 also contains; the free-content filter above removes that
      // noise at the source, so a single character↔meaning pair from a paid
      // level is now what it always was — a leak.
      if (leaked.length > 0) {
        offenders.push({ file, leaked, kb: Math.round(fs.statSync(file).size / 1024) })
      }
    }
    offenders.sort((a, b) => b.leaked.length - a.leaked.length)
    for (const { file, leaked, kb } of offenders.slice(0, 3)) {
      failures.push(
        `HSK${level}: ${leaked.length}/${probe.length} paid-only words WITH their Arabic meanings are in ` +
        `${path.relative(ROOT, file)} (${kb} KB) — served to every visitor. ` +
        `e.g. ${leaked.slice(0, 3).map((w) => `${w.zh}=${w.meaning}`).join(' · ')}`,
      )
    }
    if (offenders.length > 3) {
      failures.push(`HSK${level}: and ${offenders.length - 3} more chunk(s) carrying it`)
    }
    notes.push(`HSK${level}: probed with all ${probe.length} words found nowhere in the free content or a public title`)
  }
}

// ── Surface A: the lesson pages ─────────────────────────────────────────────

async function checkPages() {
  let reachable = true
  try {
    const ping = await fetch(`${BASE}/ar`, { signal: AbortSignal.timeout(3000) })
    reachable = ping.ok
  } catch {
    reachable = false
  }
  if (!reachable) {
    notes.push(`no server on ${BASE} — lesson-page check skipped`)
    return
  }

  let checked = 0
  for (const level of [1, 2, 3]) {
    const { lessons, vocab } = LEVELS[level]
    const byId = new Map(vocab.map((w) => [w.id, w]))

    for (const [index, lesson] of lessons.entries()) {
      const slug = `hsk${level}-${lesson.id}`
      const free = level === FREE_LEVEL && index < FREE_LESSON_COUNT
      const res = await fetch(`${BASE}/ar/lesson/${slug}`)
      if (!res.ok) { failures.push(`/ar/lesson/${slug} → HTTP ${res.status}`); continue }
      const body = await res.text()
      checked++

      // The lesson's own Chinese title is public by design — it is the <h1> —
      // so a word sharing a character with it is not a leak.
      const titleChars = new Set(lesson.titleZh)
      const words = lesson.vocabularyIds
        .map((id) => byId.get(id))
        .filter(Boolean)
        .filter((w) => [...w.zh].some((ch) => !titleChars.has(ch)))
      const present = words.filter((w) => body.includes(w.zh))

      if (free && present.length === 0) {
        failures.push(`${slug} is FREE but ships none of its ${words.length} words — the free tier is empty`)
      } else if (!free && present.length > 0) {
        failures.push(`${slug} is PAID but its HTML ships ${present.length} of its words`)
      }
    }
  }
  notes.push(`${checked} lesson pages checked`)
}

async function main() {
  checkBundles()
  await checkPages()

  for (const note of notes) console.log(`· ${note}`)
  if (failures.length) {
    console.log(`\n✗ ${failures.length} paywall failure(s):`)
    for (const f of failures) console.log('   ' + f)
    process.exit(1)
  }
  console.log('✓ paywall holds — no paid vocabulary in any lesson page or client bundle')
}

main().catch((err) => {
  console.error('check-paywall failed to run:', err.message)
  process.exit(2)
})
