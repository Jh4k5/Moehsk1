#!/usr/bin/env node
// ─── Content migrations ─────────────────────────────────────────────────────
//
// The owner's rule: content changes happen through runnable, reversible
// scripts — never by hand-editing a data file. This is the runner.
//
//   node scripts/migrate.js status          what has been applied
//   node scripts/migrate.js up              apply everything pending
//   node scripts/migrate.js up 0001         apply one
//   node scripts/migrate.js down 0001       undo one
//
// WHY EXACT STRING PAIRS AND NOT A REGEX REWRITE. Every edit names the text it
// expects to find and the text it will leave behind. If the file has moved on,
// the edit does not match and the migration REFUSES rather than doing something
// approximate — and `down` is then just the same pair, reversed. A regex that
// "usually" matches is how a content fix silently becomes a content loss.
//
// State lives in `scripts/migrations/.applied.json`, which is committed: the
// repository is the only database these files have, so which migrations have
// run has to travel with them.

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const DIR = path.join(__dirname, 'migrations')
const STATE = path.join(DIR, '.applied.json')

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE, 'utf8')) } catch { return { applied: [] } }
}
function saveState(state) {
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n')
}

function migrations() {
  return fs.readdirSync(DIR)
    .filter((f) => /^\d{4}-.*\.js$/.test(f))
    .sort()
    .map((f) => ({ file: f, ...require(path.join(DIR, f)) }))
}

/**
 * Apply a list of {file, from, to} edits. Every `from` must be present exactly
 * once, or nothing is written at all.
 */
function applyEdits(edits, direction) {
  // ONE WORKING COPY PER FILE. The first version of this function read the file
  // fresh for every edit and pushed a whole-file string per edit; three edits
  // on one file therefore produced three near-identical copies of the ORIGINAL,
  // each carrying only its own change, and writing them in turn left just the
  // last one. Two of the three fixes vanished with the runner reporting
  // "3 edits" — a silent partial migration, which is the exact failure this
  // whole mechanism exists to prevent.
  const working = new Map()
  const read = (full) => {
    if (!working.has(full)) working.set(full, fs.readFileSync(full, 'utf8'))
    return working.get(full)
  }

  for (const edit of edits) {
    const full = path.join(ROOT, edit.file)
    const before = read(full)
    const from = direction === 'up' ? edit.from : edit.to
    const to = direction === 'up' ? edit.to : edit.from
    const count = before.split(from).length - 1
    if (count === 0) throw new Error(`${edit.file}: text to replace is not there\n  looking for: ${JSON.stringify(from.slice(0, 90))}`)
    if (count > 1) throw new Error(`${edit.file}: text to replace appears ${count} times — not unique enough to be safe`)
    working.set(full, before.split(from).join(to))
  }
  // Write only after every edit has been verified, so a failure halfway
  // through leaves the tree untouched rather than half-migrated.
  for (const [full, text] of working) fs.writeFileSync(full, text)
  return edits.length
}

const [, , command = 'status', only] = process.argv
const state = loadState()
const all = migrations()

if (command === 'status') {
  for (const m of all) {
    const done = state.applied.includes(m.id)
    console.log(`${done ? '✓' : '·'} ${m.id}  ${m.describe}`)
  }
  process.exit(0)
}

if (command === 'up' || command === 'down') {
  const wanted = only ? all.filter((m) => m.id.startsWith(only)) : all
  if (wanted.length === 0) { console.error(`no migration matching «${only}»`); process.exit(1) }

  const ordered = command === 'down' ? [...wanted].reverse() : wanted
  let ran = 0
  for (const m of ordered) {
    const done = state.applied.includes(m.id)
    if (command === 'up' && done) continue
    if (command === 'down' && !done) continue
    const edits = m.edits()
    const n = applyEdits(edits, command)
    state.applied = command === 'up'
      ? [...state.applied, m.id]
      : state.applied.filter((id) => id !== m.id)
    console.log(`${command === 'up' ? '↑' : '↓'} ${m.id}  ${m.describe}  (${n} edit${n === 1 ? '' : 's'})`)
    ran += 1
  }
  saveState(state)
  if (ran === 0) console.log('nothing to do')
  process.exit(0)
}

console.error('usage: migrate.js status | up [id] | down [id]')
process.exit(1)
