#!/usr/bin/env node
// ─── Is the payment layer safe with nothing configured? ────────────────────
//
// The platform ships with no gateway. That is a deliberate state, not a
// half-finished one, and the properties below are what make it safe:
//
//   * NO PRICE IN THE SOURCE. A price literal anywhere in `src/` can go stale
//     against `app_config` and lie to a customer. The owner edits the price
//     from the admin panel; the code must never carry a second copy.
//   * NO SECRET IN THE SOURCE. Provider keys come from the environment only.
//   * CHECKOUT CANNOT HALF-WORK. Selecting a provider whose keys are absent
//     must leave checkout off, not produce a button that 500s.
//   * CODES WORK WITHOUT A GATEWAY. That is the platform's first revenue path.
//   * WEBHOOKS ARE ROUTED BY URL AND VERIFIED. A delivery must be checked
//     against the secret of the provider it claims to be, never one chosen by
//     inspecting the payload.
//
// Static analysis, no server and no network needed.

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.join(__dirname, '..')
const failures = []
const notes = []

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) walk(rel, out)
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(rel)
  }
  return out
}

const sources = walk('src')

// ── 1. No price literal anywhere in src/ ────────────────────────────────────
const PRICE_PATTERNS = [
  /\bPRICE\s*[:=]\s*['"`]/,          // PRICE: '$9'
  /['"`]\$\s?\d+(\.\d+)?['"`]/,       // '$9', "$ 19.99"
  /\b(price|amount)\s*[:=]\s*\d+(\.\d+)?\b/i,
]
for (const file of sources) {
  const text = read(file)
  text.split('\n').forEach((line, i) => {
    // Comments explaining the rule are not violations of it.
    const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')
    if (/^\s*\*/.test(line)) return
    for (const pattern of PRICE_PATTERNS) {
      if (pattern.test(code)) failures.push(`price literal in ${file}:${i + 1} — ${line.trim().slice(0, 80)}`)
    }
  })
}

// ── 2. No provider secret in the source ─────────────────────────────────────
const SECRET_HINTS = [/pdl_(live|sdbx)_[A-Za-z0-9]/, /\bsk_live_[A-Za-z0-9]/, /lsq?_[A-Za-z0-9]{30,}/]
for (const file of sources.concat(['.env.example'])) {
  const text = read(file)
  for (const hint of SECRET_HINTS) {
    if (hint.test(text)) failures.push(`possible provider secret committed in ${file}`)
  }
}

// ── 3. The default state is "no gateway" ────────────────────────────────────
const schema = read('src/lib/config/schema.ts')
if (!/provider:\s*'none'/.test(schema)) failures.push("DEFAULT_CONFIG.gateway.provider is not 'none'")
if (!/checkoutEnabled:\s*false/.test(schema)) failures.push('DEFAULT_CONFIG.features.checkoutEnabled is not false')
if (!/monthlyAmount:\s*null/.test(schema)) failures.push('DEFAULT_CONFIG.pricing.monthlyAmount is not null')
if (!/redemptionEnabled:\s*true/.test(schema)) failures.push('redemption is off by default — codes are the first revenue path')

// ── 4. Checkout cannot half-work ────────────────────────────────────────────
const factory = read('src/lib/payments/index.ts')
if (!/isConfigured\(\)\s*\?\s*gateway\s*:\s*noneGateway/.test(factory)) {
  failures.push('activeGateway() does not fall back to noneGateway when the provider is unconfigured')
}
if (!/checkoutEnabled/.test(factory)) failures.push('activeGateway() ignores the checkoutEnabled feature flag')

// ── 5. Webhooks: routed by URL, verified, idempotent ────────────────────────
const webhook = read('src/app/api/webhook/[provider]/route.ts')
if (!/gatewayForPath\(/.test(webhook)) failures.push('webhook route does not resolve the provider from the URL')
if (!/request\.text\(\)/.test(webhook)) failures.push('webhook route parses the body before verifying the raw bytes')
if (!/gateway_record_event/.test(webhook)) failures.push('webhook route does not record the event before acting (no idempotency)')
if (!/SignatureError/.test(webhook)) failures.push('webhook route does not handle signature failure distinctly')

for (const [file, header] of [
  ['src/lib/payments/paddle.ts', 'paddle-signature'],
  ['src/lib/payments/lemonsqueezy.ts', 'x-signature'],
]) {
  const text = read(file)
  if (!text.includes(header)) failures.push(`${file} does not read its provider's signature header (${header})`)
  if (!/timingSafeEqual/.test(text)) failures.push(`${file} compares signatures without timingSafeEqual`)
}

// ── 6. The service-role key can never reach the browser ─────────────────────
for (const file of sources) {
  const text = read(file)
  if (!text.includes('SUPABASE_SERVICE_ROLE_KEY')) continue
  if (file === 'src/lib/supabase/env.ts') continue
  if (!text.startsWith("import 'server-only'")) {
    failures.push(`${file} reads SUPABASE_SERVICE_ROLE_KEY without \`import 'server-only'\` on line 1`)
  }
}

// ── 7. Every env var the code reads is documented ───────────────────────────
const envExample = read('.env.example')
const referenced = new Set()
for (const file of sources) {
  for (const match of read(file).matchAll(/process\.env\.([A-Z0-9_]+)/g)) referenced.add(match[1])
}
for (const name of [...referenced].sort()) {
  if (name === 'NODE_ENV') continue
  if (name === 'npm_package_version') continue
  if (!envExample.includes(name)) failures.push(`${name} is read by the code but absent from .env.example`)
}
notes.push(`${referenced.size} environment variables referenced, all documented`)

// ── 8. The migration exists and revokes its functions ───────────────────────
const migration = read('supabase/migrations/0009_gateway.sql')
for (const fn of ['gateway_record_event', 'gateway_apply_subscription', 'gateway_mark_processed']) {
  if (!new RegExp(`revoke all on function public\\.${fn}`).test(migration)) {
    failures.push(`0009_gateway.sql does not revoke ${fn} from anon/authenticated`)
  }
}
if (!/create unique index if not exists gateway_events_uniq/.test(migration)) {
  failures.push('gateway_events has no unique index — webhook retries would double-grant')
}

console.log(`payments: ${sources.length} source files scanned`)
for (const note of notes) console.log(`  · ${note}`)
if (failures.length) {
  console.log(`\n✗ ${failures.length} problem(s):`)
  for (const f of failures) console.log('   ' + f)
  process.exit(1)
}
console.log('✓ no price or secret in the source; checkout is off and cannot half-open; webhooks verified, URL-routed and idempotent')
