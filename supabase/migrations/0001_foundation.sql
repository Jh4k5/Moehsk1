-- ============================================================================
-- 0001_foundation.sql
-- Extensions, shared enums, helper functions and triggers.
-- Everything below is idempotent so the file can be re-applied safely.
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid(), gen_random_bytes()
create extension if not exists "citext";     -- case-insensitive redemption codes

-- ── Shared enums ────────────────────────────────────────────────────────────

do $$ begin
  create type public.app_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum
    ('active', 'trialing', 'past_due', 'canceled', 'expired');
exception when duplicate_object then null; end $$;

-- Payment gateway is deliberately undecided. 'redemption' and 'manual' work
-- today with no gateway at all; the rest are placeholders the adapter fills in.
do $$ begin
  create type public.subscription_source as enum
    ('redemption', 'manual', 'paddle', 'lemonsqueezy', 'stripe', 'gumroad');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.redemption_kind as enum ('subscription', 'trial', 'lifetime');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.unit_status as enum ('in_progress', 'completed');
exception when duplicate_object then null; end $$;

-- ── updated_at trigger ──────────────────────────────────────────────────────

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
