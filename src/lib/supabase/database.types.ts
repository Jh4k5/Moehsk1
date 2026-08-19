// Hand-written to mirror supabase/migrations/*.sql.
//
// Regenerate once the schema is deployed to a project:
//   npx supabase gen types typescript --project-id <ref> --schema public \
//     > src/lib/supabase/database.types.ts
// Until then this file is the contract, and it is the file to change when a
// migration changes a column.

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[]

export type AppRole = 'user' | 'admin'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
export type SubscriptionSource =
  | 'redemption' | 'manual' | 'paddle' | 'lemonsqueezy' | 'stripe' | 'gumroad'
export type RedemptionKind = 'subscription' | 'trial' | 'lifetime'
export type UnitStatus = 'in_progress' | 'completed'

export interface ProfileRow {
  id: string
  email: string | null
  display_name: string | null
  avatar_emoji: string | null
  role: AppRole
  locale: 'ar' | 'en'
  daily_goal: number
  current_level: number
  settings: Json
  progress_imported_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionRow {
  id: string
  user_id: string
  status: SubscriptionStatus
  plan: string
  source: SubscriptionSource
  current_period_start: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  external_customer_id: string | null
  external_subscription_id: string | null
  metadata: Json
  note: string | null
  created_at: string
  updated_at: string
}

export interface RedemptionCodeRow {
  id: string
  code: string
  kind: RedemptionKind
  grants_days: number | null
  max_uses: number
  used_count: number
  expires_at: string | null
  revoked_at: string | null
  revoked_by: string | null
  note: string | null
  batch_id: string | null
  batch_label: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RedemptionCodeUsageRow {
  id: string
  code: string
  kind: RedemptionKind
  grants_days: number | null
  max_uses: number
  used_count: number
  uses_left: number
  expires_at: string | null
  revoked_at: string | null
  note: string | null
  batch_id: string | null
  batch_label: string | null
  created_at: string
  state: 'available' | 'revoked' | 'expired' | 'exhausted'
  last_redeemed_at: string | null
}

export interface RedemptionRow {
  id: string
  code_id: string
  user_id: string
  subscription_id: string | null
  granted_until: string | null
  redeemed_at: string
  ip_hash: string | null
}

export interface UnitProgressRow {
  user_id: string
  level: number
  lesson_no: number
  unit_no: number
  status: UnitStatus
  score: number | null
  best_score: number | null
  attempts: number
  seconds_spent: number
  first_started_at: string
  first_completed_at: string | null
  last_activity_at: string
}

export interface WordProgressRow {
  user_id: string
  level: number
  word_id: number
  ease_factor: number
  interval_days: number
  repetitions: number
  review_count: number
  correct_count: number
  next_review: string | null
  last_review: string | null
  learned: boolean
  bookmarked: boolean
  created_at: string
  updated_at: string
}

export interface DailyActivityRow {
  user_id: string
  activity_date: string
  words_learned: number
  questions_answered: number
  stories_read: number
  units_completed: number
  seconds_studied: number
}

export interface EventRow {
  id: number
  user_id: string | null
  name: string
  props: Json
  occurred_at: string
}

export interface ProgressImportRow {
  id: string
  user_id: string
  snapshot: Json
  stats: Json
  store_version: number | null
  imported_at: string
  replayed_at: string | null
}

export interface AppConfigRow {
  key: string
  value: Json
  value_type: 'number' | 'string' | 'boolean' | 'json'
  group_key: string
  label_ar: string
  hint_ar: string | null
  is_public: boolean
  sort_order: number
  updated_by: string | null
  updated_at: string
}

export interface AppConfigHistoryRow {
  id: number
  key: string
  old_value: Json
  new_value: Json
  changed_by: string | null
  changed_at: string
}

export interface EntitlementRow {
  is_entitled: boolean
  is_lifetime: boolean
  active_until: string | null
  source: SubscriptionSource | null
  plan: string | null
  status: SubscriptionStatus | null
}

export interface AdminUserRow {
  id: string
  email: string | null
  display_name: string | null
  role: AppRole
  current_level: number
  created_at: string
  last_sign_in_at: string | null
  is_entitled: boolean
  is_lifetime: boolean
  active_until: string | null
  sub_source: SubscriptionSource | null
  sub_status: SubscriptionStatus | null
  words_learned: number
  total_count: number
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow>
      subscriptions: Table<SubscriptionRow>
      redemption_codes: Table<RedemptionCodeRow>
      redemptions: Table<RedemptionRow>
      unit_progress: Table<UnitProgressRow>
      word_progress: Table<WordProgressRow>
      daily_activity: Table<DailyActivityRow>
      events: Table<EventRow>
      progress_imports: Table<ProgressImportRow>
      app_config: Table<AppConfigRow>
      app_config_history: Table<AppConfigHistoryRow>
    }
    Views: {
      redemption_code_usage: { Row: RedemptionCodeUsageRow; Relationships: [] }
    }
    Functions: {
      get_entitlement: { Args: { uid?: string }; Returns: EntitlementRow[] }
      redeem_code: {
        Args: { raw_code: string; uid?: string; client_ip_hash?: string | null }
        Returns: Json
      }
      import_local_progress: {
        Args: { payload: Json; force?: boolean }
        Returns: Json
      }
      is_admin: { Args: { uid?: string }; Returns: boolean }
      admin_set_config: { Args: { entries: Json }; Returns: AppConfigRow[] }
      admin_list_users: {
        Args: {
          search?: string | null
          list_filter?: string
          page_size?: number
          page_offset?: number
        }
        Returns: AdminUserRow[]
      }
      admin_metrics: { Args: { window_days?: number }; Returns: Json }
      admin_generate_codes: {
        Args: {
          quantity: number
          code_kind?: RedemptionKind
          days?: number | null
          uses_per_code?: number
          expires?: string | null
          code_note?: string | null
          label?: string | null
          code_prefix?: string
        }
        Returns: RedemptionCodeRow[]
      }
      admin_revoke_code: { Args: { target_code_id: string }; Returns: RedemptionCodeRow }
      admin_revoke_batch: { Args: { target_batch_id: string }; Returns: number }
      admin_grant_subscription: {
        Args: {
          target_user: string
          days: number | null
          plan_name?: string
          grant_note?: string | null
        }
        Returns: SubscriptionRow
      }
      admin_revoke_subscription: {
        Args: { subscription_id: string }
        Returns: SubscriptionRow
      }
      bootstrap_admin: { Args: { target_email: string }; Returns: ProfileRow }
    }
    Enums: {
      app_role: AppRole
      subscription_status: SubscriptionStatus
      subscription_source: SubscriptionSource
      redemption_kind: RedemptionKind
      unit_status: UnitStatus
    }
    CompositeTypes: Record<string, never>
  }
}
