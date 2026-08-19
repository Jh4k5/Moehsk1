-- ============================================================================
-- 0009_gateway.sql
-- The payment gateway's side of the wall.
--
-- No provider is named in this file beyond the enum that already existed. The
-- platform is not committed to Paddle or Lemon Squeezy: a webhook arrives, is
-- verified in the API layer, and lands here as "this external subscription id,
-- for this user, until this date". Switching provider changes a config row and
-- an env var, not this schema.
--
-- Everything here runs as the service role. A webhook has no session — that is
-- exactly why it must never be able to do anything a session could not audit,
-- so every write is recorded in gateway_events first and the grant is derived
-- from it.
-- ============================================================================

-- ── The raw event log ───────────────────────────────────────────────────────
-- Written BEFORE the grant, and unique on (provider, event_id). A gateway that
-- retries a webhook — and they all do — replays into this table and is ignored,
-- so a customer cannot be granted twice or charged-and-not-granted because a
-- retry raced the first delivery.

create table if not exists public.gateway_events (
  id            uuid primary key default gen_random_uuid(),
  provider      public.subscription_source not null,
  -- The provider's own event id. The idempotency key.
  event_id      text not null,
  event_type    text not null,
  -- Whole verified payload, for reconciling a dispute months later.
  payload       jsonb not null,
  -- Set once the event has been turned into a grant.
  processed_at  timestamptz,
  -- Populated when processing failed, so a stuck event is visible, not silent.
  error         text,
  received_at   timestamptz not null default now()
);

create unique index if not exists gateway_events_uniq
  on public.gateway_events (provider, event_id);

create index if not exists gateway_events_unprocessed_idx
  on public.gateway_events (received_at desc)
  where processed_at is null;

comment on table public.gateway_events is
  'Verified webhook deliveries. Unique on (provider, event_id) so retries are idempotent.';

alter table public.gateway_events enable row level security;

-- Admins read; nobody else sees payment payloads. Writes are service-role only,
-- so no policy grants insert.
drop policy if exists gateway_events_admin_read on public.gateway_events;
create policy gateway_events_admin_read on public.gateway_events
  for select to authenticated
  using (public.is_admin());

-- ── Linking a gateway customer to a user ────────────────────────────────────
-- A webhook identifies the buyer by the provider's customer id and an email.
-- The email is how the first event finds the account; the customer id is how
-- every event after it does, because an email can change.

create table if not exists public.gateway_customers (
  provider              public.subscription_source not null,
  external_customer_id  text not null,
  user_id               uuid not null references auth.users(id) on delete cascade,
  email                 citext,
  created_at            timestamptz not null default now(),
  primary key (provider, external_customer_id)
);

create index if not exists gateway_customers_user_idx
  on public.gateway_customers (user_id);

alter table public.gateway_customers enable row level security;

drop policy if exists gateway_customers_read_own on public.gateway_customers;
create policy gateway_customers_read_own on public.gateway_customers
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ── Recording an event ──────────────────────────────────────────────────────
-- Returns false when the event has been seen before, so the caller can stop
-- without doing the work twice.

create or replace function public.gateway_record_event(
  p_provider   public.subscription_source,
  p_event_id   text,
  p_event_type text,
  p_payload    jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted boolean;
begin
  insert into public.gateway_events (provider, event_id, event_type, payload)
  values (p_provider, p_event_id, p_event_type, p_payload)
  on conflict (provider, event_id) do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.gateway_record_event(public.subscription_source, text, text, jsonb) from public, anon, authenticated;

-- ── Applying an event ───────────────────────────────────────────────────────
-- The one way a gateway grants entitlement.
--
-- Idempotent on (source, external_subscription_id): the unique index on
-- subscriptions already forbids duplicates, and this upserts against it. So a
-- replayed "subscription.updated" moves the period end and creates nothing.

create or replace function public.gateway_apply_subscription(
  p_provider          public.subscription_source,
  p_external_sub_id   text,
  p_external_cust_id  text,
  p_email             text,
  p_plan              text,
  p_status            public.subscription_status,
  p_period_start      timestamptz,
  p_period_end        timestamptz,
  p_cancel_at_end     boolean default false,
  p_metadata          jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_user uuid;
  sub         public.subscriptions;
begin
  if p_external_sub_id is null or length(trim(p_external_sub_id)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'external_subscription_id_required');
  end if;

  -- Who is this? The customer link first — it survives an email change.
  select user_id into target_user
  from public.gateway_customers
  where provider = p_provider and external_customer_id = p_external_cust_id;

  -- Then the email, which is how the FIRST event for a customer finds them.
  if target_user is null and p_email is not null then
    select id into target_user from public.profiles where email = p_email::citext limit 1;
  end if;

  -- A payment for an address with no account is NOT dropped. The event stays in
  -- gateway_events unprocessed and an admin can see it; the alternative is a
  -- customer who paid and has nothing, with no record of why.
  if target_user is null then
    return jsonb_build_object('ok', false, 'error', 'no_matching_user', 'email', p_email);
  end if;

  if p_external_cust_id is not null then
    insert into public.gateway_customers (provider, external_customer_id, user_id, email)
    values (p_provider, p_external_cust_id, target_user, p_email::citext)
    on conflict (provider, external_customer_id)
      do update set user_id = excluded.user_id, email = excluded.email;
  end if;

  insert into public.subscriptions as s (
    user_id, status, plan, source,
    current_period_start, current_period_end, cancel_at_period_end,
    external_customer_id, external_subscription_id, metadata
  )
  values (
    target_user, p_status, coalesce(p_plan, 'monthly'), p_provider,
    coalesce(p_period_start, now()), p_period_end, coalesce(p_cancel_at_end, false),
    p_external_cust_id, p_external_sub_id, coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (source, external_subscription_id) where external_subscription_id is not null
  do update set
    status               = excluded.status,
    plan                 = excluded.plan,
    current_period_start = excluded.current_period_start,
    current_period_end   = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    external_customer_id = excluded.external_customer_id,
    metadata             = excluded.metadata,
    updated_at           = now()
  returning * into sub;

  return jsonb_build_object('ok', true, 'user_id', target_user, 'subscription_id', sub.id, 'status', sub.status);
end;
$$;

revoke all on function public.gateway_apply_subscription(
  public.subscription_source, text, text, text, text,
  public.subscription_status, timestamptz, timestamptz, boolean, jsonb
) from public, anon, authenticated;

-- ── Closing the loop ────────────────────────────────────────────────────────

create or replace function public.gateway_mark_processed(
  p_provider public.subscription_source,
  p_event_id text,
  p_error    text default null
)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.gateway_events
     set processed_at = case when p_error is null then now() else processed_at end,
         error        = p_error
   where provider = p_provider and event_id = p_event_id;
$$;

revoke all on function public.gateway_mark_processed(public.subscription_source, text, text) from public, anon, authenticated;

-- ── Admin view of anything stuck ────────────────────────────────────────────
-- A payment that could not be matched to an account must be VISIBLE. This is
-- the query the admin panel's "payments needing attention" list runs.

create or replace function public.admin_pending_gateway_events(limit_count integer default 50)
returns setof public.gateway_events
language sql
security definer
set search_path = public, pg_temp
as $$
  select *
    from public.gateway_events
   where public.is_admin()
     and processed_at is null
   order by received_at desc
   limit greatest(1, least(coalesce(limit_count, 50), 500));
$$;
