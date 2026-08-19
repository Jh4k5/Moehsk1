// The typed shape of app_config.
//
// PRICE IS DATA, NOT CODE. Every amount below defaults to null on purpose:
// there is no price literal anywhere in src/, so a forgotten default can never
// be mistaken for the real price. Until the owner sets it from the admin panel
// the UI renders an "unpriced" state, which is loud, rather than a plausible
// wrong number, which is silent.

import { z } from 'zod'

// ── Value schemas ───────────────────────────────────────────────────────────

const amount = z.number().finite().nonnegative().nullable()
const text = z.string().min(1).nullable()

export const configSchema = z.object({
  pricing: z.object({
    monthlyAmount: amount,
    annualAmount: amount,
    lifetimeAmount: amount,
    currency: z.string().length(3),
    noteAr: text,
  }),
  access: z.object({
    freePrimer: z.boolean(),
    /** How many lessons of a free level open without a subscription. */
    freeLessonCount: z.number().int().min(0),
    /** Levels that contain any free lesson at all. */
    freeLevels: z.array(z.number().int().min(1).max(3)),
  }),
  trial: z.object({
    enabled: z.boolean(),
    days: z.number().int().min(0),
  }),
  features: z.object({
    checkoutEnabled: z.boolean(),
    redemptionEnabled: z.boolean(),
    tutorEnabled: z.boolean(),
    tutorDailyLimit: z.number().int().min(0),
    signupEnabled: z.boolean(),
  }),
  announcement: z.object({
    enabled: z.boolean(),
    textAr: text,
    textEn: text,
    href: text,
    variant: z.enum(['info', 'success', 'warning']),
  }),
  /** Server-only. Stripped before the config reaches the browser. */
  gateway: z.object({
    provider: z.enum(['none', 'paddle', 'lemonsqueezy', 'stripe']),
    checkoutUrl: text,
    productId: text,
  }),
})

export type AppConfig = z.infer<typeof configSchema>
export type PublicAppConfig = Omit<AppConfig, 'gateway'>

// ── Defaults ────────────────────────────────────────────────────────────────
// Used when the database is unreachable or a key has never been written. They
// must be safe to ship: nothing here grants access or claims a price.

export const DEFAULT_CONFIG: AppConfig = {
  pricing: {
    monthlyAmount: null,
    annualAmount: null,
    lifetimeAmount: null,
    currency: 'USD',
    noteAr: null,
  },
  access: {
    freePrimer: true,
    freeLessonCount: 2,
    freeLevels: [1],
  },
  trial: {
    enabled: false,
    days: 0,
  },
  features: {
    checkoutEnabled: false,
    redemptionEnabled: true,
    tutorEnabled: true,
    tutorDailyLimit: 20,
    signupEnabled: true,
  },
  announcement: {
    enabled: false,
    textAr: null,
    textEn: null,
    href: null,
    variant: 'info',
  },
  gateway: {
    provider: 'none',
    checkoutUrl: null,
    productId: null,
  },
}

// ── Key registry ────────────────────────────────────────────────────────────
// Maps a database key to its place in the typed object. The admin panel drives
// its editor off this list, so adding a setting means adding one row here, one
// row in the schema above, one default above and one seed row in the migration.

export interface ConfigKeyDef {
  /** app_config.key */
  key: string
  /** Dotted path into AppConfig, e.g. ['pricing', 'monthlyAmount']. */
  path: readonly [keyof AppConfig, string]
  editor: 'number' | 'text' | 'boolean' | 'json' | 'select'
  options?: readonly string[]
  /** Private keys never leave the server. */
  isPublic: boolean
}

export const CONFIG_KEYS: readonly ConfigKeyDef[] = [
  { key: 'pricing.monthly_amount', path: ['pricing', 'monthlyAmount'], editor: 'number', isPublic: true },
  { key: 'pricing.annual_amount', path: ['pricing', 'annualAmount'], editor: 'number', isPublic: true },
  { key: 'pricing.lifetime_amount', path: ['pricing', 'lifetimeAmount'], editor: 'number', isPublic: true },
  { key: 'pricing.currency', path: ['pricing', 'currency'], editor: 'text', isPublic: true },
  { key: 'pricing.note_ar', path: ['pricing', 'noteAr'], editor: 'text', isPublic: true },

  { key: 'access.free_primer', path: ['access', 'freePrimer'], editor: 'boolean', isPublic: true },
  { key: 'access.free_lesson_count', path: ['access', 'freeLessonCount'], editor: 'number', isPublic: true },
  { key: 'access.free_levels', path: ['access', 'freeLevels'], editor: 'json', isPublic: true },

  { key: 'trial.enabled', path: ['trial', 'enabled'], editor: 'boolean', isPublic: true },
  { key: 'trial.days', path: ['trial', 'days'], editor: 'number', isPublic: true },

  { key: 'features.checkout_enabled', path: ['features', 'checkoutEnabled'], editor: 'boolean', isPublic: true },
  { key: 'features.redemption_enabled', path: ['features', 'redemptionEnabled'], editor: 'boolean', isPublic: true },
  { key: 'features.tutor_enabled', path: ['features', 'tutorEnabled'], editor: 'boolean', isPublic: true },
  { key: 'features.tutor_daily_limit', path: ['features', 'tutorDailyLimit'], editor: 'number', isPublic: true },
  { key: 'features.signup_enabled', path: ['features', 'signupEnabled'], editor: 'boolean', isPublic: true },

  { key: 'announcement.enabled', path: ['announcement', 'enabled'], editor: 'boolean', isPublic: true },
  { key: 'announcement.text_ar', path: ['announcement', 'textAr'], editor: 'text', isPublic: true },
  { key: 'announcement.text_en', path: ['announcement', 'textEn'], editor: 'text', isPublic: true },
  { key: 'announcement.href', path: ['announcement', 'href'], editor: 'text', isPublic: true },
  {
    key: 'announcement.variant',
    path: ['announcement', 'variant'],
    editor: 'select',
    options: ['info', 'success', 'warning'],
    isPublic: true,
  },

  { key: 'gateway.provider', path: ['gateway', 'provider'], editor: 'select', options: ['none', 'paddle', 'lemonsqueezy', 'stripe'], isPublic: false },
  { key: 'gateway.checkout_url', path: ['gateway', 'checkoutUrl'], editor: 'text', isPublic: false },
  { key: 'gateway.product_id', path: ['gateway', 'productId'], editor: 'text', isPublic: false },
] as const

export const CONFIG_KEY_BY_NAME: ReadonlyMap<string, ConfigKeyDef> = new Map(
  CONFIG_KEYS.map((d) => [d.key, d]),
)

// ── Row -> object ───────────────────────────────────────────────────────────

type RawRow = { key: string; value: unknown }

/**
 * Folds app_config rows onto DEFAULT_CONFIG. A row that fails validation is
 * dropped and the default kept: a malformed setting must degrade the app, not
 * break it. Returns the parse problems so a caller can log them.
 */
export function applyConfigRows(rows: readonly RawRow[]): {
  config: AppConfig
  problems: string[]
} {
  const problems: string[] = []
  const draft: AppConfig = structuredClone(DEFAULT_CONFIG)

  for (const row of rows) {
    const def = CONFIG_KEY_BY_NAME.get(row.key)
    if (!def) {
      problems.push(`unknown key ${row.key}`)
      continue
    }
    const [group, field] = def.path
    const groupDraft = draft[group] as unknown as Record<string, unknown>
    // NULL in the database means "not configured": keep the default. For the
    // price the default is itself null, which is exactly the unpriced state.
    if (row.value === null || row.value === undefined) {
      groupDraft[field] = null
      continue
    }
    groupDraft[field] = row.value
  }

  const parsed = configSchema.safeParse(draft)
  if (parsed.success) return { config: parsed.data, problems }

  // Fall back per group so one bad key cannot blank the whole config.
  const repaired: AppConfig = structuredClone(DEFAULT_CONFIG)
  for (const group of Object.keys(DEFAULT_CONFIG) as (keyof AppConfig)[]) {
    const groupSchema = configSchema.shape[group]
    const candidate = groupSchema.safeParse(draft[group])
    if (candidate.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(repaired as any)[group] = candidate.data
    } else {
      problems.push(`group ${group} fell back to defaults: ${candidate.error.message}`)
    }
  }
  return { config: repaired, problems }
}

export function toPublicConfig(config: AppConfig): PublicAppConfig {
  const { gateway: _gateway, ...rest } = config
  return rest
}
