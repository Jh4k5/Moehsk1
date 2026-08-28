// ─── [2.12] [2.13] The order words are met in — ONE definition ──────────────
//
// Shared by `build-units.js`, which sorts by it, and `audit-content.js`, which
// asserts the stored order matches it. They had separate copies for exactly one
// commit and already disagreed: the generator's list of function words did not
// contain «在», the auditor's did, and the auditor also treated every adverb as
// a function word. The generator reported 0 offending units and the auditor
// reported 13, for the same file, on the same run.
//
// Two lists is two definitions, and a check measuring something other than what
// the generator enforces is worse than no check — it produces a number nobody
// can act on.

/**
 * Parts of speech that cannot open a unit.
 *
 * ADVERBS ARE DELIBERATELY NOT HERE. «真» (really), «不要» (don't) and «也»
 * (also) are adverbs, and unlike «吗» they have a meaning that can be shown on
 * a card and a situation they can be used in. The defect the owner named was a
 * unit opening on a bare grammatical marker — «吗» before «你好» — not a unit
 * opening on a word whose part of speech happens to be functional. Excluding
 * adverbs too would push perfectly teachable words to the back of every unit
 * for no gain.
 */
const FUNCTION_POS = new Set(['particle', 'conjunction', 'preposition', 'measure'])

/** Characters the part-of-speech field alone does not catch. */
const FUNCTION_ZH = new Set([
  '吗', '呢', '吧', '了', '的', '地', '得', '着', '过', '啊', '呀', '嘛',
  '和', '与', '或', '但', '而', '就', '才', '也', '还', '再',
  '不', '没', '别', '被', '把', '给', '让', '对', '从', '向', '往', '于', '为',
])

function isFunctionWord(word) {
  return FUNCTION_ZH.has(word.zh) || FUNCTION_POS.has(String(word.pos || ''))
}

/**
 * How hard a word is to SAY, roughly.
 *
 * Syllable count dominates; a third tone adds a little because it is the one
 * that changes shape beside another third tone, and a first meeting with a word
 * should not also be a first meeting with tone sandhi.
 */
function pronunciationCost(word) {
  const tones = Array.isArray(word.tones) ? word.tones : []
  return (tones.length || 1) * 10 + tones.filter((t) => t === 3).length * 2
}

/**
 * The sort key, lowest first. The brief's precedence, in the brief's order:
 *
 *   تواتر الاستعمال ← بساطة النطق ← بساطة الحرف ← الاعتماد على ما سبق
 *
 * A key rather than a heuristic pass, so the order is total, deterministic and
 * re-derivable by a checker.
 */
function teachingOrderKey(word) {
  return [
    // 1. A function word never opens a unit. It is not exiled to the end — it
    //    still belongs here — it simply cannot be first.
    isFunctionWord(word) ? 1 : 0,
    // 2. Frequency: what a learner meets most, they meet first.
    typeof word.frequencyRank === 'number' && word.frequencyRank > 0 ? word.frequencyRank : 999999,
    // 3. Ease of pronunciation.
    pronunciationCost(word),
    // 4. Ease of writing.
    typeof word.strokeCount === 'number' && word.strokeCount > 0 ? word.strokeCount : 99,
    // 5. Stable tie-break, so the generator stays deterministic run to run.
    word.id,
  ]
}

function byTeachingOrder(a, b) {
  const ka = teachingOrderKey(a)
  const kb = teachingOrderKey(b)
  for (let i = 0; i < ka.length; i += 1) if (ka[i] !== kb[i]) return ka[i] - kb[i]
  return 0
}

module.exports = {
  FUNCTION_POS,
  FUNCTION_ZH,
  isFunctionWord,
  pronunciationCost,
  teachingOrderKey,
  byTeachingOrder,
}
