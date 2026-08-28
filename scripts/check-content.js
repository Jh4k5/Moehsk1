#!/usr/bin/env node
// ─── The content linter (CI gate) ───────────────────────────────────────────
//
// The brief asks for «مدقّق المحتوى (linter) يعمل في CI ويفحص: الاعتماد
// المسبق، اكتمال اللغتين، صحة البينين، تفرّد العناوين». This is that gate.
//
// It reuses `audit-content.js` for the measuring — one implementation, so the
// report and the gate can never disagree — and adds the thing an audit does not
// have: a BASELINE.
//
// ── Why a baseline and not a hard zero ──────────────────────────────────────
//
// Three of the four checks are already at zero and are gated at zero: pinyin,
// title uniqueness and teaching order were fixed, and any regression fails the
// build immediately.
//
// The prerequisite check is not. 430 words of 1,079 use a character in an
// example sentence that has not been taught yet, and fixing that means
// rewriting example sentences across the whole corpus — real authoring, not a
// script. Gating it at zero today would mean a permanently red build, which
// teaches everyone to ignore the gate; gating it at "no worse than today"
// means the number can only fall.
//
// The baseline is a RATCHET: when the count drops, the gate tells you to lower
// the recorded number, so progress is locked in and cannot silently slide back.

const { execFileSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const BASELINE_FILE = path.join(__dirname, 'content-baseline.json')

const raw = execFileSync('node', [path.join(__dirname, 'audit-content.js'), '--json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
const report = JSON.parse(raw)
const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'))

const pinyinProblems =
  report.pinyin.syllable.length +
  report.pinyin.markPlacement.length +
  report.pinyin.countMismatch.length +
  report.pinyin.tonesField.length +
  report.pinyin.rawField.length

const checks = [
  { key: 'pinyin', label: 'pinyin faults', actual: pinyinProblems },
  { key: 'duplicateTitles', label: 'units sharing a title', actual: report.titles.unitsAffected },
  { key: 'functionWordOpeners', label: 'units opening on a function word', actual: report.openers.length },
  { key: 'unsortedUnits', label: 'units out of teaching order', actual: report.wordOrder.length },
  { key: 'hardcodedArabic', label: 'unpaired Arabic in the engine', actual: report.engine.hits.length },
  { key: 'staleWordCount', label: '«150 words» claims', actual: report.wordCountClaim.length },
  { key: 'prerequisiteViolations', label: 'words using an untaught character', actual: report.prerequisites.offendingWordCount },
  { key: 'arabicOnEnglishRoute', label: 'strings still Arabic on /en', actual: report.englishRoute.total },
  { key: 'missingEnglishMnemonics', label: 'words with no English mnemonic', actual: report.bilingual.mnemonicEn.length },
  { key: 'missingEnglishSentences', label: 'sentences with no English', actual: report.bilingual.sentenceEn.length },
]

let failed = 0
let tightened = 0
const lines = []

for (const check of checks) {
  const allowed = baseline[check.key]
  if (allowed === undefined) {
    lines.push(`  ?  ${check.label}: ${check.actual} — no baseline recorded`)
    failed += 1
    continue
  }
  if (check.actual > allowed) {
    lines.push(`  ✗  ${check.label}: ${check.actual} (baseline ${allowed}) — this change made it worse`)
    failed += 1
  } else if (check.actual < allowed) {
    lines.push(`  ↓  ${check.label}: ${check.actual} (baseline ${allowed}) — improved, lower the baseline`)
    tightened += 1
  } else {
    lines.push(`  ${allowed === 0 ? '✓' : '·'}  ${check.label}: ${check.actual}`)
  }
}

console.log(`\ncontent: ${report.corpus.words.total} words over ${report.corpus.units} units`)
for (const line of lines) console.log(line)

if (failed > 0) {
  console.log(`\n✗ ${failed} content check(s) regressed`)
  process.exit(1)
}
if (tightened > 0) {
  console.log(`\n✗ ${tightened} check(s) improved — update scripts/content-baseline.json to lock it in`)
  process.exit(1)
}
console.log('\n✓ content holds: no check regressed')
