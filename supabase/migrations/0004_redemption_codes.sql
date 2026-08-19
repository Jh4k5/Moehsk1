-- ============================================================================
-- 0004_redemption_codes.sql
-- Activation codes for influencers and direct sales. These are the ONLY way
-- to buy access until a payment gateway is chosen, so they must be complete:
-- single- and multi-use, expiry, revocation, attribution and a usage report.
-- ============================================================================

create table if not exists public.redemption_codes (
  id           uuid primary key default gen_random_uuid(),
  -- citext: the learner types it in whatever case they like.
  code         citext not null unique,
  kind         public.redemption_kind not null default 'subscription',
  -- Days of access granted. NULL is only legal for kind = 'lifetime'.
  grants_days  integer check (grants_days is null or grants_days > 0),
  max_uses     integer not null default 1 check (max_uses > 0),
  used_count   integer not null default 0 check (used_count >= 0),
  -- Codes stop working after this instant regardless of remaining uses.
  expires_at   timestamptz,
  revoked_at   timestamptz,
  revoked_by   uuid references auth.users(id) on delete set null,
  -- Free-text so the owner can record who the code went to.
  note         text,
  -- Bulk generations share a batch id, so a whole influencer drop is one line
  -- in the usage report and can be revoked together.
  batch_id     uuid,
  batch_label  text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint redemption_codes_days_matches_kind check (
    (kind = 'lifetime' and grants_days is null) or
    (kind <> 'lifetime' and grants_days is not null)
  )
);

comment on table public.redemption_codes is
  'Activation codes. Work with no payment gateway present.';
comment on column public.redemption_codes.note is
  'Who this code was issued to - the owner''s own record.';

create index if not exists redemption_codes_batch_idx on public.redemption_codes (batch_id);
create index if not exists redemption_codes_created_idx on public.redemption_codes (created_at desc);

drop trigger if exists set_updated_at on public.redemption_codes;
create trigger set_updated_at
  before update on public.redemption_codes
  for each row execute function public.tg_set_updated_at();

create table if not exists public.redemptions (
  id              uuid primary key default gen_random_uuid(),
  code_id         uuid not null references public.redemption_codes(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  -- Mirrors what was granted at redemption time. NULL = lifetime.
  granted_until   timestamptz,
  redeemed_at     timestamptz not null default now(),
  ip_hash         text,
  -- One user cannot burn two uses of the same code.
  unique (code_id, user_id)
);

create index if not exists redemptions_user_idx on public.redemptions (user_id, redeemed_at desc);

alter table public.redemption_codes enable row level security;
alter table public.redemptions      enable row level security;

-- Codes are NOT readable by learners: listing them would hand out free access.
-- Redemption happens through the SECURITY DEFINER function below.
drop policy if exists redemption_codes_admin_all on public.redemption_codes;
create policy redemption_codes_admin_all on public.redemption_codes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists redemptions_select_own on public.redemptions;
create policy redemptions_select_own on public.redemptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ── Redemption ──────────────────────────────────────────────────────────────
-- Atomic: the used_count increment, the redemption row and the subscription
-- all land in one transaction, and the row lock makes a race for the last use
-- of a multi-use code impossible.

create or replace function public.redeem_code(
  raw_code   text,
  uid        uuid default auth.uid(),
  client_ip_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  c            public.redemption_codes;
  normalized   citext := trim(raw_code)::citext;
  grant_until  timestamptz;
  sub          public.subscriptions;
  existing_sub public.subscriptions;
  found_sub    boolean := false;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;
  if normalized is null or length(normalized) = 0 then
    return jsonb_build_object('ok', false, 'error', 'code_required');
  end if;

  select * into c
    from public.redemption_codes
   where code = normalized
     for update;                                  -- serialises concurrent uses

  if not found then
    return jsonb_build_object('ok', false, 'error', 'code_not_found');
  end if;
  if c.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'code_revoked');
  end if;
  if c.expires_at is not null and c.expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'code_expired');
  end if;
  -- Ordered deliberately: someone re-entering a code they already used should
  -- be told "you already have this", not "sold out".
  if exists (select 1 from public.redemptions r
              where r.code_id = c.id and r.user_id = uid) then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;
  if c.used_count >= c.max_uses then
    return jsonb_build_object('ok', false, 'error', 'code_exhausted');
  end if;

  grant_until := case
    when c.kind = 'lifetime' then null
    else now() + make_interval(days => c.grants_days)
  end;

  -- Extend an existing redemption-sourced grant rather than stacking rows, so
  -- a learner who redeems two 30-day codes gets 60 days, not two subscriptions.
  select * into existing_sub
    from public.subscriptions
   where user_id = uid
     and source = 'redemption'
     and status in ('active', 'trialing')
   order by (current_period_end is null) desc, current_period_end desc nulls first
   limit 1
     for update;
  found_sub := found;

  if found_sub then
    update public.subscriptions
       set current_period_end = case
             when grant_until is null then null                       -- upgrade to lifetime
             when current_period_end is null then null                -- already lifetime
             else greatest(current_period_end, now()) + make_interval(days => c.grants_days)
           end,
           status = 'active',
           plan   = case when c.kind = 'lifetime' then 'lifetime' else plan end
     where id = existing_sub.id
    returning * into sub;
  else
    insert into public.subscriptions
      (user_id, status, plan, source, current_period_end, note)
    values (
      uid,
      (case when c.kind = 'trial' then 'trialing' else 'active' end)::public.subscription_status,
      case when c.kind = 'lifetime' then 'lifetime' else 'code' end,
      'redemption',
      grant_until,
      c.note
    )
    returning * into sub;
  end if;

  insert into public.redemptions (code_id, user_id, subscription_id, granted_until, ip_hash)
  values (c.id, uid, sub.id, sub.current_period_end, client_ip_hash);

  update public.redemption_codes
     set used_count = used_count + 1
   where id = c.id;

  return jsonb_build_object(
    'ok', true,
    'kind', c.kind,
    'granted_days', c.grants_days,
    'active_until', sub.current_period_end,
    'is_lifetime', sub.current_period_end is null,
    'subscription_id', sub.id
  );
end;
$$;

revoke all on function public.redeem_code(text, uuid, text) from public;
grant execute on function public.redeem_code(text, uuid, text) to authenticated, service_role;

-- ── Generation ──────────────────────────────────────────────────────────────
-- Crockford-style base32 minus the characters that get misread out loud
-- (I, L, O, U) so a code can be dictated over the phone without ambiguity.

create or replace function public.generate_code_string(len integer default 12)
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  result text := '';
  i integer;
begin
  for i in 1..len loop
    result := result || substr(
      alphabet,
      1 + (get_byte(gen_random_bytes(1), 0) % length(alphabet)),
      1
    );
  end loop;
  return result;
end;
$$;

create or replace function public.admin_generate_codes(
  quantity      integer,
  code_kind     public.redemption_kind default 'subscription',
  days          integer default 30,
  uses_per_code integer default 1,
  expires       timestamptz default null,
  code_note     text default null,
  label         text default null,
  code_prefix   text default 'JISR'
)
returns setof public.redemption_codes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor     uuid := auth.uid();
  batch     uuid := gen_random_uuid();
  i         integer;
  candidate text;
  attempts  integer;
  row_out   public.redemption_codes;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;
  if quantity is null or quantity < 1 or quantity > 1000 then
    raise exception 'quantity must be between 1 and 1000' using errcode = '22023';
  end if;

  for i in 1..quantity loop
    attempts := 0;
    loop
      attempts := attempts + 1;
      candidate := case
        when code_prefix is null or code_prefix = '' then public.generate_code_string(12)
        else upper(code_prefix) || '-' || public.generate_code_string(4)
             || '-' || public.generate_code_string(4)
      end;
      begin
        insert into public.redemption_codes
          (code, kind, grants_days, max_uses, expires_at, note,
           batch_id, batch_label, created_by)
        values (
          candidate::citext,
          code_kind,
          case when code_kind = 'lifetime' then null else days end,
          uses_per_code,
          expires,
          code_note,
          batch,
          label,
          actor
        )
        returning * into row_out;
        exit;                                   -- inserted, leave the retry loop
      exception when unique_violation then
        if attempts > 8 then raise; end if;     -- astronomically unlikely
      end;
    end loop;
    return next row_out;
  end loop;
end;
$$;

revoke all on function public.admin_generate_codes(
  integer, public.redemption_kind, integer, integer, timestamptz, text, text, text
) from public;
grant execute on function public.admin_generate_codes(
  integer, public.redemption_kind, integer, integer, timestamptz, text, text, text
) to authenticated, service_role;

create or replace function public.admin_revoke_code(target_code_id uuid)
returns public.redemption_codes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor  uuid := auth.uid();
  result public.redemption_codes;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  update public.redemption_codes
     set revoked_at = coalesce(revoked_at, now()),
         revoked_by = coalesce(revoked_by, actor)
   where id = target_code_id
  returning * into result;

  if result is null then
    raise exception 'code not found' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

revoke all on function public.admin_revoke_code(uuid) from public;
grant execute on function public.admin_revoke_code(uuid) to authenticated, service_role;

create or replace function public.admin_revoke_batch(target_batch_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor   uuid := auth.uid();
  changed integer;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  update public.redemption_codes
     set revoked_at = coalesce(revoked_at, now()),
         revoked_by = coalesce(revoked_by, actor)
   where batch_id = target_batch_id
     and revoked_at is null;

  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.admin_revoke_batch(uuid) from public;
grant execute on function public.admin_revoke_batch(uuid) to authenticated, service_role;

-- ── Usage report ────────────────────────────────────────────────────────────

create or replace view public.redemption_code_usage
with (security_invoker = true) as
  select
    c.id,
    c.code::text          as code,
    c.kind,
    c.grants_days,
    c.max_uses,
    c.used_count,
    greatest(c.max_uses - c.used_count, 0) as uses_left,
    c.expires_at,
    c.revoked_at,
    c.note,
    c.batch_id,
    c.batch_label,
    c.created_at,
    case
      when c.revoked_at is not null                           then 'revoked'
      when c.expires_at is not null and c.expires_at <= now() then 'expired'
      when c.used_count >= c.max_uses                         then 'exhausted'
      else 'available'
    end as state,
    (select max(r.redeemed_at) from public.redemptions r where r.code_id = c.id)
      as last_redeemed_at
  from public.redemption_codes c;

comment on view public.redemption_code_usage is
  'Admin usage report. security_invoker keeps the admin-only RLS of the base table.';

grant select on public.redemption_code_usage to authenticated, service_role;
