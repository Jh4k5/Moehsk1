#!/usr/bin/env node
// ─── The content audit ──────────────────────────────────────────────────────
//
// Measures the defects named in the owner's brief, so that every claim in the
// report is a number produced by running this file rather than an impression.
// Read-only: it changes nothing and is safe to run at any time.
//
//   node scripts/audit-content.js            human-readable report
//   node scripts/audit-content.js --json     machine-readable, for CI
//
// The checks are deliberately independent. A failure in one must not stop the
// others, because the point of a first audit is a complete picture.

const path = require('path')
const fs = require('fs')
const { load, ROOT } = require('./ts-load.js')
const P = require('./lib/pinyin-core.js')
const { isFunctionWord, byTeachingOrder } = require('./lib/teaching-order.js')

const JSON_OUT = process.argv.includes('--json')

// ── Load every level ────────────────────────────────────────────────────────

const units = load('src/data/units/units.generated.ts').unitsGenerated
const LEVELS = {
  1: {
    vocab: load('src/data/vocabulary.ts').vocabulary,
    lessons: load('src/data/lessons.ts').lessons,
    grammar: load('src/data/grammar.ts').grammarRules,
    stories: load('src/data/stories.ts').stories,
    qa: [],
  },
  2: {
    vocab: load('src/data/hsk2/vocabulary2.ts').vocabulary2,
    lessons: load('src/data/hsk2/lessons2.ts').lessons2,
    grammar: load('src/data/hsk2/grammar2.ts').grammarRules2,
    stories: load('src/data/hsk2/stories2.ts').stories2,
    qa: load('src/data/hsk2/qa2.ts').dailyQA2,
  },
  3: {
    vocab: load('src/data/hsk3/vocabulary3.ts').vocabulary3,
    lessons: load('src/data/hsk3/lessons3.ts').lessons3,
    grammar: load('src/data/hsk3/grammar3.ts').grammarRules3,
    stories: load('src/data/hsk3/stories3.ts').stories3,
    qa: load('src/data/hsk3/qa3.ts').dailyQA3,
  },
}

const ALL_WORDS = [1, 2, 3].flatMap((l) => LEVELS[l].vocab.map((w) => ({ ...w, level: Number(l) })))
const report = {}

// ── [2.9] Pinyin ────────────────────────────────────────────────────────────
//
// Four independent faults, counted separately because they need different
// fixes: an illegal syllable is a typo, a mark on the wrong vowel is a
// transcription slip, a syllable/character mismatch is a missing or extra
// reading, and a `tones` array that disagrees with the marks is stale metadata.

function auditPinyin() {
  const bad = { syllable: [], markPlacement: [], countMismatch: [], tonesField: [], rawField: [] }

  for (const w of ALL_WORDS) {
    const where = `HSK${w.level} #${w.id} ${w.zh}`

    for (const token of P.syllables(w.pinyin)) {
      const problem = P.checkSyllable(token)
      if (!problem) continue
      const bucket = problem.startsWith('tone mark on the wrong vowel') ? 'markPlacement' : 'syllable'
      bad[bucket].push({ where, pinyin: w.pinyin, problem })
    }

    // One syllable per character — with two honest exceptions, both of which
    // this auditor reported as defects on its first run before they were
    // understood:
    //
    //   * ERHUA. The «儿» of «那儿» is a character but not a syllable; it
    //     fuses onto the one before it, «nàr». Every erhua word therefore has
    //     one more character than syllables, correctly.
    //   * OPTIONAL characters. «有（一）点儿» writes the optional 一 in
    //     brackets; the reading «yǒu diǎnr» omits it, correctly.
    const bracketed = (w.zh.match(/[（(][^）)]*[）)]/g) || []).join('')
    const optional = P.hanziOf(bracketed).length
    //     Erhua is OPTIONAL, not automatic: «那儿» is one syllable «nàr», but
    //     «女儿» is two, «nǚ'ér» — the same character, fused in one word and
    //     full in the other. So a trailing 儿 makes BOTH counts acceptable
    //     rather than mandating the smaller one.
    const chars = P.hanziOf(w.zh).length - optional
    const sylls = P.bareOf(w.pinyin).length
    const erhuaOk = /儿$/.test(w.zh) && !/^儿/.test(w.zh) && sylls === chars - 1
    if (chars > 0 && sylls !== chars && !erhuaOk) {
      bad.countMismatch.push({ where, pinyin: w.pinyin, chars, sylls })
    }

    // `tones` is what the tone drills read. If it disagrees with the pinyin
    // the learner is graded against a number nobody can see.
    if (Array.isArray(w.tones) && w.tones.length > 0) {
      const actual = P.tonesOf(w.pinyin)
      if (actual.length === w.tones.length) {
        const disagree = actual.some((t, i) => t !== 0 && w.tones[i] !== 0 && t !== w.tones[i])
        if (disagree) bad.tonesField.push({ where, pinyin: w.pinyin, stored: w.tones, actual })
      } else {
        bad.tonesField.push({ where, pinyin: w.pinyin, stored: w.tones, actual, note: 'length' })
      }
    }

    // `pinyinRaw` is the numbered spelling. It must round-trip to the marks.
    if (typeof w.pinyinRaw === 'string' && w.pinyinRaw.trim()) {
      // A NEUTRAL tone is written with no digit at all, so «xue2sheng» is the
      // correct numbered spelling of «xuésheng» and must not be flagged. Only
      // the letters are compared, plus a cap on how many tones are marked.
      const digits = w.pinyinRaw.match(/\d/g) || []
      const letters = w.pinyinRaw.replace(/\d/g, '')
      const bareFromMarks = P.bareOf(w.pinyin).join('').replace(/[\s'\u2019-]+/g, '')
      // Both apostrophes: the syllable divider is typed as ' in the numbered
      // field and as ’ in the marked one, and comparing them literally makes
      // a correct pair look wrong.
      const bareFromRaw = P.normalise(letters).toLowerCase().replace(/[\s'\u2019-]+/g, '')
      if (bareFromRaw !== bareFromMarks || digits.length > chars) {
        bad.rawField.push({ where, pinyin: w.pinyin, raw: w.pinyinRaw, expected: bareFromMarks })
      }
    }
  }
  return bad
}

// ── [2.14] Prerequisite: never use a word before it is taught ───────────────
//
// Teaching order is the unit order. A word is "taught" once the unit that owns
// it has been reached; a card that uses a character from a LATER unit asks the
// learner to read something nobody has shown them.

function teachingOrder() {
  const order = [...units].sort((a, b) =>
    a.ref.level - b.ref.level || a.ref.lesson - b.ref.lesson || a.ref.unit - b.ref.unit)
  const charFirstSeen = new Map()   // char -> index in `order`
  const wordUnitIndex = new Map()   // "level:id" -> index
  order.forEach((u, i) => {
    const vocab = LEVELS[u.ref.level].vocab
    for (const id of u.wordIds) {
      const w = vocab.find((v) => v.id === id)
      if (!w) continue
      wordUnitIndex.set(`${u.ref.level}:${id}`, i)
      for (const ch of P.hanziOf(w.zh)) if (!charFirstSeen.has(ch)) charFirstSeen.set(ch, i)
    }
  })
  return { order, charFirstSeen, wordUnitIndex }
}

function auditPrerequisites() {
  const { order, charFirstSeen, wordUnitIndex } = teachingOrder()
  const violations = []
  const offendingWords = new Set()

  for (const u of order) {
    const idx = order.indexOf(u)
    const vocab = LEVELS[u.ref.level].vocab
    for (const id of u.wordIds) {
      const w = vocab.find((v) => v.id === id)
      if (!w) continue
      // Every example sentence attached to this word.
      const texts = [w.exZh, ...(w.sentences || []).map((s) => s.zh)].filter(Boolean)
      const unseen = new Set()
      for (const t of texts) {
        for (const ch of P.hanziOf(t)) {
          const seen = charFirstSeen.get(ch)
          if (seen === undefined || seen > idx) unseen.add(ch)
        }
      }
      if (unseen.size > 0) {
        offendingWords.add(`${u.ref.level}:${id}`)
        violations.push({
          unit: u.key, word: w.zh, id: w.id, level: u.ref.level,
          unseen: [...unseen].join(''),
        })
      }
    }
  }
  return { violations, offendingWordCount: offendingWords.size, totalWords: ALL_WORDS.length }
}

// ── [2.12] A unit must not open on a grammatical particle ───────────────────
//
// «吗» before «你好» is the case the owner named. A particle has no meaning to
// show and no situation to use it in until there is a sentence to attach it to.

function auditOpeners() {
  const offenders = []
  for (const u of units) {
    const vocab = LEVELS[u.ref.level].vocab
    const first = vocab.find((v) => v.id === u.wordIds[0])
    if (!first) continue
    if (isFunctionWord(first)) offenders.push({ unit: u.key, word: first.zh, pos: first.pos, title: u.title })
  }
  return offenders
}

// ── [2.13] Word order inside a unit ─────────────────────────────────────────
//
// The pedagogical order is: what a learner meets most often, first. The corpus
// carries `frequencyRank` on every word, so "is this unit ordered?" is a
// measurable question, not a matter of taste.

function auditWordOrder() {
  // Checked against the SAME key the generator sorts by, re-derived here rather
  // than imported, so a change to one has to be made deliberately in the other.
  //
  // The first version of this check compared raw `frequencyRank` alone and
  // reported 185 of 191 units "unsorted". That number was never wrong about
  // there being no order — there wasn't one — but it could not have gone to
  // zero either, because frequency is only the second of four criteria. A check
  // that cannot be satisfied by doing the right thing is not a check.
  const unsorted = []
  for (const u of units) {
    const vocab = LEVELS[u.ref.level].vocab
    const words = u.wordIds.map((id) => vocab.find((v) => v.id === id)).filter(Boolean)
    if (words.length < 2) continue
    let inversions = 0
    for (let i = 0; i < words.length - 1; i += 1) if (byTeachingOrder(words[i], words[i + 1]) > 0) inversions += 1
    if (inversions > 0) unsorted.push({ unit: u.key, inversions, of: words.length - 1 })
  }
  return unsorted
}

// ── [2.15] Unit titles ──────────────────────────────────────────────────────

function auditTitles() {
  const byTitle = new Map()
  for (const u of units) {
    if (!byTitle.has(u.title)) byTitle.set(u.title, [])
    byTitle.get(u.title).push(u.key)
  }
  const duplicated = [...byTitle.entries()]
    .filter(([, keys]) => keys.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
  const unitsAffected = duplicated.reduce((n, [, keys]) => n + keys.length, 0)
  return { distinct: byTitle.size, total: units.length, duplicated, unitsAffected }
}

// ── [2.16] A sentence translation that is really a word gloss ───────────────

function auditSentenceGloss() {
  const suspects = []
  for (const w of ALL_WORDS) {
    for (const s of w.sentences || []) {
      if (!s || !s.ar) continue
      const ar = s.ar.trim()
      // The sentence carries several characters but its Arabic is the word's
      // own meaning verbatim — the gloss was pasted into the wrong field.
      if (ar === String(w.meaning || '').trim() && P.hanziOf(s.zh).length > P.hanziOf(w.zh).length) {
        suspects.push({ level: w.level, id: w.id, zh: w.zh, sentence: s.zh, ar })
      }
    }
  }
  return suspects
}

// ── [4.4] [4.5] Both languages, or neither ──────────────────────────────────

function auditBilingual() {
  const missing = { english: [], mnemonicEn: [], exEnIsArabic: [], sentenceEn: [] }
  const arabic = /[؀-ۿ]/
  for (const w of ALL_WORDS) {
    if (!String(w.english || '').trim()) missing.english.push(`${w.level}:${w.id}`)
    if (!String(w.mnemonicEn || '').trim()) missing.mnemonicEn.push(`${w.level}:${w.id}`)
    if (arabic.test(String(w.exEn || ''))) missing.exEnIsArabic.push(`${w.level}:${w.id}`)
    for (const s of w.sentences || []) {
      if (!String(s.en || '').trim()) missing.sentenceEn.push(`${w.level}:${w.id}`)
    }
  }
  // The primer and the unit titles are Arabic-only by construction.
  const primer = load('src/data/primer.ts')
  const chapters = primer.PRIMER || []
  const primerEn = chapters.filter((c) => String(c.titleEn || '').trim()).length
  const unitsEn = units.filter((u) => String(u.titleEn || '').trim()).length
  return { ...missing, primerChapters: chapters.length, primerEn, units: units.length, unitsEn }
}

// ── [4.2] Arabic frozen into the engine ─────────────────────────────────────

function auditHardcodedArabic() {
  const files = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full)
    }
  }
  walk(path.join(ROOT, 'src/lib/curriculum'))

  const ARABIC = /[\u0600-\u06FF]/
  const hits = []

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    const lines = text.split('\n')

    // Which `const NAME_AR` blocks have a `NAME_EN` twin in this file. An
    // entry inside one of those is the bilingual convention, not a defect.
    const pairedMaps = new Set()
    for (const m of text.matchAll(/const\s+([A-Z0-9_]+)_AR\b/g)) {
      if (new RegExp(`const\\s+${m[1]}_EN\\b`).test(text)) pairedMaps.add(`${m[1]}_AR`)
    }

    let inPairedMap = null
    let depth = 0
    let inBlockComment = false

    lines.forEach((raw, i) => {
      let line = raw

      // Strip comments — prose for whoever reads the code, never learner copy.
      if (inBlockComment) {
        const close = line.indexOf('*/')
        if (close === -1) return
        line = line.slice(close + 2)
        inBlockComment = false
      }
      line = line.replace(/\/\*[^]*?\*\//g, '')
      const open = line.indexOf('/*')
      if (open !== -1) {
        inBlockComment = true
        line = line.slice(0, open)
      }
      line = line.replace(/\/\/.*$/, '')

      // Track entry into and out of a paired *_AR map.
      const mapStart = /const\s+([A-Z0-9_]+_AR)\b/.exec(line)
      if (mapStart && pairedMaps.has(mapStart[1])) {
        inPairedMap = mapStart[1]
        depth = 0
      }
      if (inPairedMap) {
        depth += (line.match(/[{[]/g) || []).length - (line.match(/[}\]]/g) || []).length
        if (depth <= 0 && !mapStart) inPairedMap = null
      }

      if (!ARABIC.test(line)) return
      if (inPairedMap) return

      // A key ending in `Ar` whose `En` twin exists in this file.
      const key = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(line)?.[1]
      if (key && /Ar$/.test(key) && new RegExp(`\\b${key.slice(0, -2)}En\\b`).test(text)) return

      // A line carrying BOTH an Arabic string and a Latin-script string — an
      // inline `{ ar: '…', en: '…' }`, or a call taking both spellings. This is
      // the pattern the whole codebase uses; flagging it reported 33 defects of
      // which every single one was the fix already in place.
      const strings = line.match(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g) || []
      const hasArabicString = strings.some((x) => ARABIC.test(x))
      const hasLatinString = strings.some((x) => !ARABIC.test(x) && /[A-Za-z]{3}/.test(x))
      if (hasArabicString && hasLatinString) return

      // A multi-line `{ ar: '…', en: '…' }`: the Arabic sits on one line and
      // its twin on the next. Looking only at the current line reported six of
      // these as unpaired when the pairing was one line below.
      const near = lines.slice(i + 1, i + 3).join('\n')
      if (/^\s*ar\s*:/.test(line) && /^\s*en\s*:/m.test(near)) return
      // The same twin rule for any key: `options:` paired with `optionsEn:` on
      // the following line is the convention working, not a defect.
      if (key && new RegExp(`^\\s*${key}En\\s*:`, 'm').test(near)) return

      hits.push({ file: path.relative(ROOT, file), line: i + 1, text: raw.trim().slice(0, 90) })
    })
  }

  // `locale` is not threaded through the engine; both languages travel in the
  // payload instead, which keeps `buildActivityStream` pure and lets one built
  // stream serve both routes. Counted anyway, because a future change that
  // starts reading a locale inside the engine is worth noticing.
  const engine = path.join(ROOT, 'src/lib/curriculum/activity-engine.ts')
  const localeMentions = (fs.readFileSync(engine, 'utf8').match(/locale/g) || []).length
  return { hits, localeMentions }
}

// ── [4.1] What an English reader actually sees ──────────────────────────────
//
// The strongest form of the bilingual check: build every unit's stream, take
// every string the /en route would render, and count what is still Arabic.
//
// It measures the OUTPUT, so it cannot be satisfied by adding an `en` field
// that nothing reads — which is precisely how 1,890 English sentences and a
// full set of English glosses sat in the data for months while every screen
// rendered Arabic. A field-presence check would have called that corpus
// bilingual.

function auditEnglishRoute() {
  const { buildActivityStream } = load('src/lib/curriculum/activity-engine.ts')
  const { levelContent } = load('src/lib/curriculum/content-source.ts')
  const { emptyLearnerState, say } = load('src/lib/curriculum/types.ts')
  const ARABIC = /[\u0600-\u06FF]/

  let checked = 0
  const offenders = new Map()

  for (const unit of units) {
    let stream
    try {
      stream = buildActivityStream(unit, emptyLearnerState(7), levelContent(unit.ref.level))
    } catch {
      continue
    }
    for (const a of stream) {
      const texts = []
      if (a.question) {
        for (const c of a.question.choices) texts.push([`${a.kind}:choice`, c.labelEn ?? c.label])
        texts.push([`${a.kind}:explanation`, say(a.question.explanation, 'en') || ''])
      }
      for (const field of ['prompt', 'hint', 'title']) {
        const v = a[field]
        if (v && typeof v === 'object' && 'en' in v) texts.push([`${a.kind}:${field}`, say(v, 'en')])
      }
      for (const [where, text] of texts) {
        checked += 1
        if (text && ARABIC.test(text)) offenders.set(where, (offenders.get(where) ?? 0) + 1)
      }
    }
  }

  const total = [...offenders.values()].reduce((n, v) => n + v, 0)
  return { checked, total, offenders: [...offenders.entries()].sort((a, b) => b[1] - a[1]) }
}

// ── [2.17] Exam banks ───────────────────────────────────────────────────────

function auditExams() {
  const { levelContent } = load('src/lib/curriculum/content-source.ts')
  return [1, 2, 3].map((l) => ({ level: l, items: levelContent(l).exam.length }))
}

// ── [2.10] The stale "150 words" claim ──────────────────────────────────────

function auditWordCountClaim() {
  const hits = []
  // `.claude/worktrees` holds abandoned agent checkouts — copies of old
  // trees, not the product. Counting them turns 3 real hits into 92.
  const skip = /node_modules|\.next|\.git|\.claude|package-lock|scripts\/audit-content/
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (skip.test(full)) continue
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx|md|json|css|sql|js)$/.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8')
        text.split('\n').forEach((line, i) => {
          // A CLAIM, not an array element or a viewBox coordinate. Both digit
          // systems: the primer writes it «١٥٠» in Arabic-Indic numerals, which
          // an ASCII-only search misses entirely — it did, on the first run,
          // and reported zero occurrences of a claim that is really there.
          // Deliberately WIDE: the number as a standalone token anywhere on a
          // line that also talks about vocabulary. A tight pattern anchored to
          // «150 كلمة» missed the one occurrence that actually matters —
          // «وHSK 1 يبدأ بـ١٥٠ منها فقط» in the primer, where the noun is six
          // words away and on the other side of the number. Over-reporting is
          // cheap here because a human classifies the handful of hits; missing
          // the real one is what this check exists to prevent.
          const token = /(^|[^\d,،.\u0660-\u0669])(150|١٥٠)([^\d,.\u0660-\u0669]|$)/
          const topic = /(كلم|مفرد|رمز|رموز|حرف|حرو|HSK|word|character|vocab)/i
          if (token.test(line) && topic.test(line)) {
            hits.push({ file: path.relative(ROOT, full), line: i + 1, text: line.trim().slice(0, 100) })
          }
        })
      }
    }
  }
  // PRODUCT CODE ONLY. Scanning the whole repository returned eleven hits, of
  // which every single one was documentation ABOUT this defect, the migration
  // that fixes it, or this checker's own label — and none was the defect. A
  // gate that fires on its own description is noise, and noise is what makes a
  // gate get ignored.
  walk(path.join(ROOT, 'src'))
  return hits
}

// ── Run ─────────────────────────────────────────────────────────────────────

report.corpus = {
  words: { 1: LEVELS[1].vocab.length, 2: LEVELS[2].vocab.length, 3: LEVELS[3].vocab.length, total: ALL_WORDS.length },
  units: units.length,
}
report.pinyin = auditPinyin()
report.prerequisites = auditPrerequisites()
report.openers = auditOpeners()
report.wordOrder = auditWordOrder()
report.titles = auditTitles()
report.sentenceGloss = auditSentenceGloss()
report.bilingual = auditBilingual()
report.engine = auditHardcodedArabic()
report.englishRoute = auditEnglishRoute()
report.exams = auditExams()
report.wordCountClaim = auditWordCountClaim()

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const n = (x) => String(x).padStart(5)
console.log(`\ncorpus: ${report.corpus.words.total} words (HSK1 ${report.corpus.words[1]} · HSK2 ${report.corpus.words[2]} · HSK3 ${report.corpus.words[3]}) over ${report.corpus.units} units\n`)

console.log('[2.9]  pinyin')
console.log(`  ${n(report.pinyin.syllable.length)}  illegal syllables`)
console.log(`  ${n(report.pinyin.markPlacement.length)}  tone mark on the wrong vowel`)
console.log(`  ${n(report.pinyin.countMismatch.length)}  syllable count ≠ character count`)
console.log(`  ${n(report.pinyin.tonesField.length)}  \`tones\` disagrees with the written pinyin`)
console.log(`  ${n(report.pinyin.rawField.length)}  \`pinyinRaw\` does not round-trip`)
for (const s of report.pinyin.markPlacement.slice(0, 3)) console.log(`         e.g. ${s.where}: ${s.problem}`)
for (const s of report.pinyin.rawField.slice(0, 3)) console.log(`         e.g. ${s.where}: «${s.pinyin}» vs raw «${s.raw}»`)

console.log('\n[2.14] prerequisites')
console.log(`  ${n(report.prerequisites.offendingWordCount)}  of ${report.prerequisites.totalWords} words show an untaught character (${(report.prerequisites.offendingWordCount / report.prerequisites.totalWords * 100).toFixed(1)}%)`)
for (const v of report.prerequisites.violations.slice(0, 3)) console.log(`         e.g. ${v.unit} «${v.word}» uses ${v.unseen}`)

console.log('\n[2.12] units opening on a function word')
console.log(`  ${n(report.openers.length)}  of ${report.corpus.units} units`)
for (const o of report.openers.slice(0, 3)) console.log(`         e.g. ${o.unit} opens on «${o.word}» (${o.pos})`)

console.log('\n[2.13] word order inside the unit')
console.log(`  ${n(report.wordOrder.length)}  of ${report.corpus.units} units are not in teaching order`)

console.log('\n[2.15] unit titles')
console.log(`  ${n(report.titles.unitsAffected)}  of ${report.titles.total} units carry a duplicated title (${report.titles.distinct} distinct titles)`)
for (const [title, keys] of report.titles.duplicated.slice(0, 3)) console.log(`         «${title}» × ${keys.length}`)

console.log('\n[2.16] sentence translation that is really the word gloss')
console.log(`  ${n(report.sentenceGloss.length)}  sentences`)

console.log('\n[2.17] exam bank')
for (const e of report.exams) console.log(`  ${n(e.items)}  HSK${e.level}`)

console.log('\n[4.1] [4.2] the engine')
console.log(`  ${n(report.engine.localeMentions)}  mentions of \`locale\` in activity-engine.ts`)
console.log(`  ${n(report.engine.hits.length)}  lines of Arabic frozen into src/lib/curriculum`)
console.log(`  ${n(report.englishRoute.total)}  of ${report.englishRoute.checked} rendered strings still Arabic on /en`)
for (const [where, count] of report.englishRoute.offenders.slice(0, 4)) {
  console.log(`         ${String(count).padStart(5)}  ${where}`)
}

console.log('\n[4.4] [4.5] bilingual completeness')
const b = report.bilingual
console.log(`  ${n(b.english.length)}  words with no English gloss`)
console.log(`  ${n(b.mnemonicEn.length)}  words with no English mnemonic (the field does not exist yet)`)
console.log(`  ${n(b.exEnIsArabic.length)}  words whose \`exEn\` holds Arabic`)
console.log(`  ${n(b.sentenceEn.length)}  example sentences with no English`)
console.log(`  ${n(b.primerChapters - b.primerEn)}  of ${b.primerChapters} primer chapters with no English`)
console.log(`  ${n(b.units - b.unitsEn)}  of ${b.units} unit titles with no English`)

console.log('\n[2.10] the stale "150 words" claim')
console.log(`  ${n(report.wordCountClaim.length)}  occurrences`)
for (const h of report.wordCountClaim.slice(0, 5)) console.log(`         ${h.file}:${h.line}  ${h.text}`)
console.log()
