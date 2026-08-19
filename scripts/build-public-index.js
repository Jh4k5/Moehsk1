#!/usr/bin/env node
// Generates src/data/public-index.generated.ts — the curriculum's PUBLIC face.
//
// Lesson titles and counts, and nothing else. Every field here is already
// printed on the marketing pages that exist to be indexed by Google, so
// shipping it to a browser gives nothing away.
//
// GRAMMAR NAMES ARE NOT HERE, and that is deliberate. They looked public —
// «المقارنة بـ 比 (bǐ)» is a category name, not a lesson — but many of them
// gloss the construction in Arabic beside its Chinese: «因为…所以… (لأنّ…
// لذلك…)». That is a character↔meaning pair, which is the product. The bundle
// scan caught them after everything else had been closed.
// The grammar a learner is currently on comes from the gated level bundle.
//
// It exists so client components can render the path — "Lesson 3 · التسوّق ·
// 8 words" — without importing the vocabulary modules, which is how the whole
// paid curriculum ended up in a 918 KB public chunk.
//
//   node scripts/build-public-index.js

const fs = require('node:fs')
const path = require('node:path')
const { load } = require('./ts-load')

const LEVELS = {
  1: {
    lessons: load('src/data/lessons.ts').lessons,
    vocab: load('src/data/vocabulary.ts').vocabulary,
    grammar: load('src/data/grammar.ts').grammarRules,
  },
  2: {
    lessons: load('src/data/hsk2/lessons2.ts').lessons2,
    vocab: load('src/data/hsk2/vocabulary2.ts').vocabulary2,
    grammar: load('src/data/hsk2/grammar2.ts').grammarRules2,
  },
  3: {
    lessons: load('src/data/hsk3/lessons3.ts').lessons3,
    vocab: load('src/data/hsk3/vocabulary3.ts').vocabulary3,
    grammar: load('src/data/hsk3/grammar3.ts').grammarRules3,
  },
}

const lines = []
lines.push('// ─────────────────────────────────────────────────────────────────────────────')
lines.push('// GENERATED FILE — do not edit by hand.')
lines.push('// Produced by `node scripts/build-public-index.js`.')
lines.push('//')
lines.push('// The curriculum\'s PUBLIC face: lesson titles, grammar names, counts. No word,')
lines.push('// no meaning, no example sentence. Everything here is already on the indexed')
lines.push('// marketing pages, so a client component may hold it — which is the point:')
lines.push('// rendering the path must not require importing the vocabulary.')
lines.push('// ─────────────────────────────────────────────────────────────────────────────')
lines.push('')
lines.push('export interface PublicLesson {')
lines.push('  id: number')
lines.push('  title: string')
lines.push('  titleZh: string')
lines.push('  /** How many words the lesson holds. A count, never the words. */')
lines.push('  wordCount: number')
lines.push('}')
lines.push('')
lines.push('export interface PublicLevelIndex {')
lines.push('  level: 1 | 2 | 3')
lines.push('  label: string')
lines.push('  wordCount: number')
lines.push('  lessons: PublicLesson[]')
lines.push('  /** How many grammar rules the level has. A count — the names gloss')
lines.push('   *  their Chinese in Arabic, so they are gated with the rest. */')
lines.push('  grammarCount: number')
lines.push('}')
lines.push('')
lines.push('export const PUBLIC_INDEX: Record<1 | 2 | 3, PublicLevelIndex> = {')

for (const level of [1, 2, 3]) {
  const { lessons, vocab, grammar } = LEVELS[level]
  lines.push(`  ${level}: {`)
  lines.push(`    level: ${level},`)
  lines.push(`    label: 'HSK ${level}',`)
  lines.push(`    wordCount: ${vocab.length},`)
  lines.push('    lessons: [')
  for (const l of lessons) {
    lines.push(
      `      { id: ${l.id}, title: ${JSON.stringify(l.title)}, titleZh: ${JSON.stringify(l.titleZh ?? '')}, wordCount: ${(l.vocabularyIds ?? []).length} },`,
    )
  }
  lines.push('    ],')
  lines.push(`    grammarCount: ${grammar.length},`)
  lines.push('  },')
}
lines.push('}')
lines.push('')
lines.push('export function publicLevel(level: number): PublicLevelIndex {')
lines.push('  return PUBLIC_INDEX[(level as 1 | 2 | 3)] ?? PUBLIC_INDEX[1]')
lines.push('}')
lines.push('')

const out = path.join(__dirname, '..', 'src/data/public-index.generated.ts')
fs.writeFileSync(out, lines.join('\n'))

const totals = [1, 2, 3].map((l) => `HSK${l}: ${LEVELS[l].lessons.length} lessons, ${LEVELS[l].grammar.length} rules`)
console.log(`✓ src/data/public-index.generated.ts — ${totals.join(' · ')}`)
