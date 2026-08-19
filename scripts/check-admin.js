#!/usr/bin/env node
// ─── Can anyone but the owner reach the owner's screens? ───────────────────
//
// The admin panel edits the price, mints activation codes and lists every
// subscriber. Its authorisation has to hold in three independent places, and
// this checks all three statically:
//
//   1. THE SERVER, BEFORE RENDER. A client-side `if (!isAdmin) return null`
//      still ships the panel's markup and its data-fetching code to whoever
//      asked for the URL.
//   2. THE API ROUTES. Every /api/admin/* handler must call `requireAdmin`
//      before it does anything — a screen that is hidden is not a screen that
//      is protected.
//   3. THE DATABASE. The privileged functions must be revoked from `anon` and
//      `authenticated`, so a stolen anon key cannot call them directly and
//      bypass the application entirely.
//
// It also enforces the rule the owner set: no price literal in the source.

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')
const exists = (rel) => fs.existsSync(path.join(ROOT, rel))

const failures = []
const notes = []

// ── 1. The panel is guarded on the server ───────────────────────────────────
const layout = 'src/app/[locale]/admin/layout.tsx'
if (!exists(layout)) {
  failures.push('no admin layout — the panel has no shared guard')
} else {
  const text = read(layout)
  if (text.includes("'use client'")) failures.push(`${layout} is a Client Component — its guard runs after the markup is already sent`)
  if (!/getCurrentProfile|requireAdmin/.test(text)) failures.push(`${layout} does not resolve the caller's profile`)
  if (!/role !== 'admin'/.test(text)) failures.push(`${layout} does not check profiles.role`)
  if (!/notFound\(\)/.test(text)) failures.push(`${layout} should 404 a non-admin, not 403 — a 403 confirms the path exists`)
  notes.push('admin layout: server component, checks profiles.role, 404s a non-admin')
}

// ── 2. Every admin API route authorises first ───────────────────────────────
const apiDir = path.join(ROOT, 'src/app/api/admin')
if (!fs.existsSync(apiDir)) {
  failures.push('no /api/admin routes found')
} else {
  const routes = []
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === 'route.ts') routes.push(path.relative(ROOT, full))
    }
  }
  walk(apiDir)

  for (const route of routes) {
    const text = read(route)
    const isBootstrap = route.includes('bootstrap')
    if (isBootstrap) {
      // The one route that cannot require admin — it is how the first one is
      // made. It must instead check the VERIFIED session email against the
      // env allow-list, never an address from the request body.
      if (!/adminBootstrapEmails/.test(text)) failures.push(`${route} does not consult ADMIN_BOOTSTRAP_EMAILS`)
      if (!/requireUser/.test(text)) failures.push(`${route} does not require a signed-in user`)
      if (/body.*email|email.*await request\.json/.test(text)) {
        failures.push(`${route} appears to read an email from the request body — it must use the session's`)
      }
      continue
    }
    if (!/requireAdmin\(\)/.test(text)) failures.push(`${route} does not call requireAdmin()`)
    // The service-role client bypasses RLS. In a mutating admin route the only
    // thing left protecting the data would be this file's own check.
    if (/createAdminClient/.test(text) && /export async function (POST|PUT|PATCH|DELETE)/.test(text)) {
      failures.push(`${route} mutates through the service-role client — use the user's client so the database enforces the rule too`)
    }
  }
  notes.push(`${routes.length} admin API routes checked`)
}

// ── 3. The database revokes the privileged functions ────────────────────────
const migrations = fs
  .readdirSync(path.join(ROOT, 'supabase/migrations'))
  .filter((f) => f.endsWith('.sql'))
  .map((f) => read(`supabase/migrations/${f}`))
  .join('\n')

for (const fn of ['admin_set_config', 'admin_generate_codes', 'admin_list_users', 'admin_metrics', 'bootstrap_admin']) {
  if (!new RegExp(`create or replace function public\\.${fn}`).test(migrations)) {
    failures.push(`${fn} is called by the panel but not defined in any migration`)
    continue
  }
  const guarded = new RegExp(`revoke all on function public\\.${fn}`).test(migrations)
  const checks = new RegExp(`${fn}[\\s\\S]{0,3000}?is_admin\\(\\)`).test(migrations)
  if (!guarded && !checks) {
    failures.push(`${fn} neither revokes execute from anon/authenticated nor calls is_admin() — a stolen anon key could call it directly`)
  }
}
notes.push('privileged SQL functions checked for revoke/is_admin')

// ── 4. Still no price in the code ───────────────────────────────────────────
const schema = read('src/lib/config/schema.ts')
if (!/monthlyAmount:\s*null/.test(schema)) failures.push('DEFAULT_CONFIG carries a monthly amount — the price must come from app_config only')
const settings = exists('src/app/[locale]/admin/SettingsEditor.tsx') ? read('src/app/[locale]/admin/SettingsEditor.tsx') : ''
if (/\bvalue=\{?\s*\d+\s*\}?/.test(settings) && !/value=\{0\}/.test(settings)) {
  failures.push('SettingsEditor hardcodes a numeric value — every amount must come from the row')
}

console.log('admin:')
for (const note of notes) console.log(`  · ${note}`)
if (failures.length) {
  console.log(`\n✗ ${failures.length} problem(s):`)
  for (const f of failures) console.log('   ' + f)
  process.exit(1)
}
console.log('✓ panel guarded server-side, every route authorises, SQL functions locked, no price in the code')
