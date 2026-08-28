// ─── Pinyin, as rules rather than as a lookup table ─────────────────────────
//
// Shared by the auditor and the content linter. No data imports, no I/O: given
// a string it answers whether that string is legal Hanyu Pinyin and, if so,
// what its syllables and tones are.
//
// WHY A RULE ENGINE AND NOT A DICTIONARY. A dictionary of the ~410 legal
// syllables is easy to write and easy to get subtly wrong, and a wrong entry
// silently blesses a typo forever. The syllable inventory below is generated
// from the initial × final table plus the short list of syllables that exist
// with no initial, so an illegal combination fails because the language has no
// such combination, not because someone forgot to type it.

const INITIALS = [
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h',
  'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's',
]

// Finals in their WRITTEN form after a consonant.
const FINALS = [
  'a', 'o', 'e', 'ê', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'er',
  'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong',
  'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang', 'ueng',
  'ü', 'üe', 'üan', 'ün',
]

// The combinations the language actually uses. Anything outside this is a typo
// even though both halves are individually real.
const ALLOWED = {
  b: 'a o ai ei ao ou an en ang eng i ie iao ian in ing u',
  p: 'a o ai ei ao ou an en ang eng i ie iao ian in ing u',
  m: 'a o e ai ei ao ou an en ang eng i ie iao iu ian in ing u',
  f: 'a o ei ou an en ang eng u',
  d: 'a e ai ei ao ou an en ang eng ong i ia ie iao iu ian ing u uo ui uan un',
  t: 'a e ai ei ao ou an en ang eng ong i ie iao ian ing u uo ui uan un',
  n: 'a e ai ei ao ou an en ang eng ong i ia ie iao iu ian in iang ing u uo uan un ü üe',
  l: 'a o e ai ei ao ou an en ang eng ong i ia ie iao iu ian in iang ing u uo uan un ü üe',
  g: 'a e ai ei ao ou an en ang eng ong u ua uo uai ui uan un uang',
  k: 'a e ai ei ao ou an en ang eng ong u ua uo uai ui uan un uang',
  h: 'a e ai ei ao ou an en ang eng ong u ua uo uai ui uan un uang',
  // After j/q/x the ü is WRITTEN u — «ju», not «jü» — because those initials
  // never combine with a true u, so the umlaut carries no information. Both
  // spellings are accepted here: the written one is what the corpus holds, and
  // rejecting it flagged 64 perfectly correct readings (xué, qù, juéde) as
  // illegal in the first run of this auditor.
  j: 'i ia ie iao iu ian in iang ing iong ü üe üan ün u ue uan un',
  q: 'i ia ie iao iu ian in iang ing iong ü üe üan ün u ue uan un',
  x: 'i ia ie iao iu ian in iang ing iong ü üe üan ün u ue uan un',
  zh: 'a e ai ei ao ou an en ang eng ong i u ua uo uai ui uan un uang',
  ch: 'a e ai ao ou an en ang eng ong i u ua uo uai ui uan un uang',
  sh: 'a e ai ei ao ou an en ang eng i u ua uo uai ui uan un uang',
  r: 'e ao ou an en ang eng ong i u uo ui uan un',
  z: 'a e ai ei ao ou an en ang eng ong i u uo ui uan un',
  c: 'a e ai ao ou an en ang eng ong i u uo ui uan un',
  s: 'a e ai ao ou an en ang eng ong i u uo ui uan un',
}

// Syllables written with no initial. `yi`, `wu`, `yu` etc. are the written
// forms of finals standing alone, and are legal syllables in their own right.
const ZERO_INITIAL = `a o e ê ai ei ao ou an en ang eng er
  yi ya ye yao you yan yin yang ying yong
  wu wa wo wai wei wan wen wang weng
  yu yue yuan yun`.split(/\s+/).filter(Boolean)

const SYLLABLES = new Set(ZERO_INITIAL)
for (const [ini, finals] of Object.entries(ALLOWED)) {
  for (const fin of finals.split(' ')) SYLLABLES.add(ini + fin)
}
// `n`, `ng`, `hm`, `hng` and `m` exist as interjections.
const STANDALONE_ONLY = new Set(['n', 'ng', 'm', 'hm', 'hng', 'ea', 'o', 'e', 'ê'])
for (const s of ['n', 'ng', 'm', 'hm', 'hng', 'ea']) SYLLABLES.add(s)

// ERHUA. A syllable can take a retroflex «r» suffix — «nàr», «yìdiǎnr»,
// «hǎowánr» — which is a real and very common ending, not a typo. Adding the
// suffixed forms to the inventory is what lets the segmenter split «yìdiǎnr»
// instead of declaring it not-pinyin. `er` itself is already a syllable and
// does not double.
for (const base of [...SYLLABLES]) {
  if (base !== 'er' && !base.endsWith('r')) SYLLABLES.add(base + 'r')
}

// ── Tone marks ──────────────────────────────────────────────────────────────

const MARKED = {
  ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4],
  ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4],
  ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4],
  ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4],
  ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4],
  ǖ: ['ü', 1], ǘ: ['ü', 2], ǚ: ['ü', 3], ǜ: ['ü', 4],
  ń: ['n', 2], ň: ['n', 3], ǹ: ['n', 4], ḿ: ['m', 2],
  ê̄: ['ê', 1], ế: ['ê', 2], ê̌: ['ê', 3], ề: ['ê', 4],
}

/** Strip tone marks from one syllable and return [bare, tone]. 0 = neutral. */
function stripTone(syllable) {
  let tone = 0
  let bare = ''
  for (const ch of syllable) {
    const hit = MARKED[ch]
    if (hit) {
      bare += hit[0]
      tone = hit[1]
    } else {
      bare += ch
    }
  }
  return [bare, tone]
}

/**
 * Where the tone mark belongs, by the standard rule:
 * an `a` or `e` takes it; otherwise in `ou` the `o` takes it; otherwise the
 * LAST vowel takes it. Returns an index into the bare syllable.
 */
function toneMarkIndex(bare) {
  const lower = bare.toLowerCase()
  const a = lower.indexOf('a')
  if (a >= 0) return a
  const e = lower.indexOf('e')
  if (e >= 0) return e
  const ou = lower.indexOf('ou')
  if (ou >= 0) return ou
  let last = -1
  for (let i = 0; i < lower.length; i += 1) if ('aoeiuü'.includes(lower[i])) last = i
  return last
}

/** `v` and `u:` are keyboard stand-ins for `ü`. Accepted, then normalised. */
function normalise(text) {
  return String(text || '')
    .replace(/u:/g, 'ü')
    .replace(/([jqxy])v/g, '$1u')
    .replace(/([nl])v/g, '$1ü')
    .normalize('NFC')
}

/** Split a pinyin string into syllable tokens, keeping separators out. */
function syllables(text) {
  return normalise(text)
    .split(/[\s'·,.!?;:—–\-()"“”，。！？；：、《》]+/u)
    .filter(Boolean)
}

/**
 * Split a written WORD into its syllables.
 *
 * Pinyin joins the syllables of one word with no space — «xièxie», «zhōngguó»,
 * «péngyou» — so a token is not a syllable and cannot be checked as one. This
 * walks the token taking the LONGEST legal syllable at each step and backtracks
 * when the remainder cannot be split, which is what makes «xian» resolve as one
 * syllable while «xi'an» stays two.
 *
 * Returns an array of syllables, or null when no split works — which is the
 * signal that the token is not pinyin at all.
 */
function segment(token) {
  const lower = normalise(token).toLowerCase()
  const memo = new Map()

  // WHY FEWEST SYLLABLES AND NOT LONGEST-FIRST. Longest-first is the obvious
  // greedy rule and it is wrong: «bàngōngshì» takes «bàng» first and is then
  // forced into «ō»+«ng»+«shì», four syllables for a three-character word, all
  // of them individually legal. Minimising the number of syllables picks
  // «bàn»+«gōng»+«shì» — the reading a speaker would give — because a spurious
  // split always costs more pieces than the true one.
  const walk = (pos) => {
    if (pos === lower.length) return []
    if (memo.has(pos)) return memo.get(pos)
    memo.set(pos, null) // guard against re-entry on the same position
    let best = null
    for (let end = Math.min(lower.length, pos + 7); end > pos; end -= 1) {
      const piece = lower.slice(pos, end)
      const [bare] = stripTone(piece)
      if (!SYLLABLES.has(bare)) continue
      // Interjections stand alone. Letting «ng» or «m» appear mid-word is what
      // lets a wrong split look legal.
      if (STANDALONE_ONLY.has(bare) && !(pos === 0 && end === lower.length)) continue
      const rest = walk(end)
      if (!rest) continue
      if (best === null || rest.length + 1 < best.length) best = [piece, ...rest]
    }
    memo.set(pos, best)
    return best
  }

  return walk(0)
}

/**
 * Check one syllable. Returns null when it is fine, or a reason string.
 */
function checkSyllable(raw) {
  const token = raw.toLowerCase()
  if (!token) return null
  if (/\d/.test(token)) return 'tone number in a display field'
  const [bare, tone] = stripTone(token)
  if (!/^[a-zü]+$/.test(bare)) return `not pinyin letters: ${raw}`
  if (!SYLLABLES.has(bare)) {
    // Not one syllable — but it may legitimately be several written together.
    const parts = segment(token)
    if (!parts) return `not a Mandarin syllable: ${bare}`
    for (const part of parts) {
      const problem = checkSyllable(part)
      if (problem) return problem
    }
    return null
  }
  if (tone !== 0) {
    // Exactly one mark, and on the right vowel.
    const marks = [...token].filter((ch) => MARKED[ch]).length
    if (marks > 1) return `more than one tone mark: ${raw}`
    const idx = [...token].findIndex((ch) => MARKED[ch])
    const want = toneMarkIndex(bare)
    if (idx !== want) return `tone mark on the wrong vowel: ${raw} (expected on «${bare[want]}»)`
  }
  return null
}

/** Tones of a pinyin string, one per syllable. 0 = neutral. */
function tonesOf(text) {
  return syllables(text).flatMap((token) => {
    const parts = segment(token) || [token]
    return parts.map((s) => stripTone(s.toLowerCase())[1])
  })
}

/** Bare syllables, tones removed. */
function bareOf(text) {
  return syllables(text).flatMap((token) => {
    const parts = segment(token) || [token]
    return parts.map((s) => stripTone(s.toLowerCase())[0])
  })
}

const HANZI = /[\u4e00-\u9fff]/

function hanziOf(text) {
  return [...String(text || '')].filter((c) => HANZI.test(c))
}

module.exports = {
  SYLLABLES, MARKED,
  stripTone, toneMarkIndex, normalise, syllables, segment, checkSyllable, tonesOf, bareOf,
  hanziOf, HANZI,
}
