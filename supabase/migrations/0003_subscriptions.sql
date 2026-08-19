-- ============================================================================
-- 0003_subscriptions.sql
-- Entitlement facts. A user may hold several rows over time (a redemption, a
-- manual grant, later a gateway subscription); entitlement is the union.
-- ============================================================================

create table if not exists public.subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  status                    public.subscription_status not null default 'active',
  plan                      text not null default 'monthly',
  source                    public.subscription_source not null,
  current_period_start      timestamptz not null default now(),
  -- NULL means "never expires" (lifetime code / manual permanent grant).
  current_period_end        timestamptz,
  cancel_at_period_end      boolean not null default false,
  -- Gateway identifiers. Empty until a gateway is chosen.
  external_customer_id      text,
  external_subscription_id  text,
  metadata                  jsonb not null default '{}'::jsonb,
  note                      text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

comment on table public.subscriptions is
  'Entitlement grants. current_period_end NULL = lifetime.';

create index if not exists subscriptions_user_active_idx
  on public.subscriptions (user_id, status, current_period_end desc nulls first);

-- A gateway must never be able to create the same subscription twice on retry.
create unique index if not exists subscriptions_external_uniq
  on public.subscriptions (source, external_subscription_id)
  where external_subscription_id is not null;

drop trigger if exists set_updated_at on public.subscriptions;
create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.tg_set_updated_at();

alter table public.subscriptions enable row level security;

-- Read-only for the owner. Nothing client-side may mint entitlement: every
-- write path (redeem, webhook, admin grant) runs through the service role.
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ── Entitlement resolution ──────────────────────────────────────────────────
-- Single source of truth, used by the API layer. Kept in SQL so that a future
-- edge function or a direct SQL report resolves entitlement identically.

create or replace function public.get_entitlement(uid uuid default auth.uid())
returns table (
  is_entitled  boolean,
  is_lifetime  boolean,
  active_until timestamptz,
  source       public.subscription_source,
  plan         text,
  status       public.subscription_status
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with live as (
    select s.*
      from public.subscriptions s
     where s.user_id = uid
       and s.status in ('active', 'trialing')
       and (s.current_period_end is null or s.current_period_end > now())
  ),
  best as (
    select * from live
     order by (current_period_end is null) desc,  -- lifetime wins
              current_period_end desc nulls first
     limit 1
  )
  select
    (select count(*) from live) > 0                as is_entitled,
    coalesce((select current_period_end is null from best), false) as is_lifetime,
    (select current_period_end from best)          as active_until,
    (select source from best)                      as source,
    (select plan   from best)                      as plan,
    (select status from best)                      as status;
$$;

revoke all on function public.get_entitlement(uuid) from public;
grant execute on function public.get_entitlement(uuid) to authenticated, service_role;

comment on function public.get_entitlement(uuid) is
  'Resolves whether a user is entitled right now. NULL active_until = lifetime.';

-- ── Administrative grant / revoke ───────────────────────────────────────────
-- Callable only by an admin (or the service role, whose auth.uid() is NULL and
-- which bypasses RLS anyway). Used by the admin panel to comp an account.

create or replace function public.admin_grant_subscription(
  target_user uuid,
  days        integer,          -- NULL grants lifetime
  plan_name   text default 'manual',
  grant_note  text default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor  uuid := auth.uid();
  result public.subscriptions;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  insert into public.subscriptions
    (user_id, status, plan, source, current_period_end, note)
  values (
    target_user,
    'active',
    plan_name,
    'manual',
    case when days is null then null else now() + make_interval(days => days) end,
    grant_note
  )
  returning * into result;

  return result;
end;
$$;

revoke all on function public.admin_grant_subscription(uuid, integer, text, text) from public;
grant execute on function public.admin_grant_subscription(uuid, integer, text, text)
  to authenticated, service_role;

create or replace function public.admin_revoke_subscription(subscription_id uuid)
returns public.subscriptions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor  uuid := auth.uid();
  result public.subscriptions;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  update public.subscriptions
     set status = 'canceled',
         current_period_end = least(coalesce(current_period_end, now()), now())
   where id = subscription_id
  returning * into result;

  if result is null then
    raise exception 'subscription not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

revoke all on function public.admin_revoke_subscription(uuid) from public;
grant execute on function public.admin_revoke_subscription(uuid) to authenticated, service_role;
