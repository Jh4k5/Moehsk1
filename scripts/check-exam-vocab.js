#!/usr/bin/env node
// ─── Every exam character must already be taught ────────────────────────────
//
// An exam is the last place a learner should meet a character for the first
// time. A wrong answer there reads as "you failed to learn this" when in fact
// nobody ever showed it — the most demoralising thing an assessment can do, and
// invisible without a check, because each item looks perfectly fine on its own.
//
// So: every Chinese character in a level's exam bank must appear in that
// level's vocabulary or in a level below it.
//
// This check was written to police the newly authored HSK2 and HSK3 banks. On
// its first run it found three violations in those — and NINE in the HSK1 bank
// that had been shipping all along.

const { load } = require('./ts-load.js')

const VOCAB = {
  1: load('src/data/vocabulary.ts').vocabulary,
  2: load('src/data/hsk2/vocabulary2.ts').vocabulary2,
  3: load('src/data/hsk3/vocabulary3.ts').vocabulary3,
}

const BANKS = [{ level: 1, bank: load('src/data/examBank.ts').HSK1_EXAM_BANK, name: 'HSK1' }]
for (const [level, file, key, name] of [
  [2, 'src/data/hsk2/examBank2.ts', 'HSK2_EXAM_BANK', 'HSK2'],
  [3, 'src/data/hsk3/examBank3.ts', 'HSK3_EXAM_BANK', 'HSK3'],
]) {
  try {
    BANKS.push({ level, bank: load(file)[key], name })
  } catch {
    console.log(`  · ${name}: no exam bank yet`)
  }
}

const HANZI = /[一-鿿]/
const charsOf = (t) => [...String(t ?? '')].filter((c) => HANZI.test(c))

/** Characters taught at or below `level`. */
function taughtUpTo(level) {
  const set = new Set()
  for (let l = 1; l <= level; l += 1) for (const w of VOCAB[l]) for (const c of charsOf(w.zh)) set.add(c)
  return set
}

/**
 * Every Chinese string an item can hold, whatever its section's shape.
 *
 * Arabic explanation fields are skipped: they QUOTE the Chinese they explain,
 * and that quotation is the same material already checked on the item itself,
 * not new vocabulary being introduced.
 */
function stringsOf(item) {
  const out = []
  const visit = (v) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(visit)
    else if (v && typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) {
        if (k.endsWith('_ar') || k.endsWith('Ar') || k === 'label') continue
        visit(val)
      }
    }
  }
  visit(item)
  return out
}

let failures = 0
for (const { level, bank, name } of BANKS) {
  const taught = taughtUpTo(level)
  const unseen = new Map()
  let items = 0

  for (const section of Object.keys(bank)) {
    for (const item of bank[section] ?? []) {
      items += 1
      for (const text of stringsOf(item)) {
        for (const c of charsOf(text)) {
          if (taught.has(c)) continue
          if (!unseen.has(c)) unseen.set(c, [])
          unseen.get(c).push(`${section}/${item.id}`)
        }
      }
    }
  }

  if (unseen.size === 0) {
    console.log(`  ✓ ${name}: ${items} items, every character taught at or below level ${level}`)
  } else {
    failures += 1
    console.log(`  ✗ ${name}: ${items} items, ${unseen.size} untaught character(s)`)
    for (const [c, where] of [...unseen].slice(0, 12)) {
      console.log(`      ${c}  in ${[...new Set(where)].slice(0, 3).join(', ')}`)
    }
  }
}

console.log()
if (failures > 0) {
  console.log(`✗ ${failures} exam bank(s) use characters the learner has not been taught`)
  process.exit(1)
}
console.log('✓ exam banks stay inside what has been taught')
