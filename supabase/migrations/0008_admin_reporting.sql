-- ============================================================================
-- 0008_admin_reporting.sql
-- Read models for the admin panel. Kept as SECURITY DEFINER functions rather
-- than views because they read auth.users, which no view may expose to the
-- authenticated role.
-- ============================================================================

create or replace function public.admin_list_users(
  search   text default null,
  list_filter text default 'all',     -- all | subscribers | free | admins
  page_size integer default 50,
  page_offset integer default 0
)
returns table (
  id            uuid,
  email         text,
  display_name  text,
  role          public.app_role,
  current_level smallint,
  created_at    timestamptz,
  last_sign_in_at timestamptz,
  is_entitled   boolean,
  is_lifetime   boolean,
  active_until  timestamptz,
  sub_source    public.subscription_source,
  sub_status    public.subscription_status,
  words_learned bigint,
  total_count   bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  return query
  with base as (
    select
      p.id,
      p.email,
      p.display_name,
      p.role,
      p.current_level,
      p.created_at,
      u.last_sign_in_at,
      e.is_entitled,
      e.is_lifetime,
      e.active_until,
      e.source as sub_source,
      e.status as sub_status,
      (select count(*) from public.word_progress w
        where w.user_id = p.id and w.learned) as words_learned
    from public.profiles p
    left join auth.users u on u.id = p.id
    cross join lateral public.get_entitlement(p.id) e
    where (search is null or search = ''
           or p.email ilike '%' || search || '%'
           or p.display_name ilike '%' || search || '%')
      and (
        list_filter = 'all'
        or (list_filter = 'subscribers' and e.is_entitled)
        or (list_filter = 'free'        and not e.is_entitled)
        or (list_filter = 'admins'      and p.role = 'admin')
      )
  )
  select b.*, (select count(*) from base) as total_count
    from base b
   order by b.created_at desc
   limit greatest(least(page_size, 200), 1)
  offset greatest(page_offset, 0);
end;
$$;

revoke all on function public.admin_list_users(text, text, integer, integer) from public;
grant execute on function public.admin_list_users(text, text, integer, integer)
  to authenticated, service_role;

-- ── Metrics ─────────────────────────────────────────────────────────────────

create or replace function public.admin_metrics(window_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor uuid := auth.uid();
  since timestamptz := now() - make_interval(days => greatest(window_days, 1));
  result jsonb;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'window_days', greatest(window_days, 1),
    'users_total', (select count(*) from public.profiles),
    'users_new',   (select count(*) from public.profiles where created_at >= since),
    'subscribers_active', (
      select count(distinct s.user_id) from public.subscriptions s
       where s.status in ('active','trialing')
         and (s.current_period_end is null or s.current_period_end > now())
    ),
    'subscribers_lifetime', (
      select count(distinct s.user_id) from public.subscriptions s
       where s.status = 'active' and s.current_period_end is null
    ),
    'subscribers_expiring_30d', (
      select count(distinct s.user_id) from public.subscriptions s
       where s.status in ('active','trialing')
         and s.current_period_end between now() and now() + interval '30 days'
    ),
    'codes_total',     (select count(*) from public.redemption_codes),
    'codes_available', (
      select count(*) from public.redemption_codes c
       where c.revoked_at is null
         and (c.expires_at is null or c.expires_at > now())
         and c.used_count < c.max_uses
    ),
    'redemptions_total',  (select count(*) from public.redemptions),
    'redemptions_window', (select count(*) from public.redemptions
                            where redeemed_at >= since),
    'active_learners_window', (
      select count(distinct user_id) from public.daily_activity
       where activity_date >= since::date
    ),
    'units_completed_window', (
      select count(*) from public.unit_progress
       where status = 'completed' and coalesce(first_completed_at, last_activity_at) >= since
    ),
    'signups_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('date', d, 'count', n) order by d)
        from (
          select created_at::date as d, count(*) as n
            from public.profiles
           where created_at >= since
           group by 1
        ) s
    ), '[]'::jsonb),
    'subscribers_by_source', coalesce((
      select jsonb_object_agg(source, n)
        from (
          select s.source::text as source, count(distinct s.user_id) as n
            from public.subscriptions s
           where s.status in ('active','trialing')
             and (s.current_period_end is null or s.current_period_end > now())
           group by 1
        ) t
    ), '{}'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_metrics(integer) from public;
grant execute on function public.admin_metrics(integer) to authenticated, service_role;

-- ── Bootstrap the first admin ───────────────────────────────────────────────
-- Chicken and egg: only an admin can promote an admin. This function is
-- callable ONLY by the service role (auth.uid() is null), so the very first
-- promotion happens from a server route holding the service key, guarded by
-- ADMIN_BOOTSTRAP_EMAILS in the environment.

create or replace function public.bootstrap_admin(target_email text)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.profiles;
begin
  if auth.uid() is not null then
    raise exception 'bootstrap_admin is service-role only' using errcode = '42501';
  end if;

  update public.profiles
     set role = 'admin'
   where lower(email) = lower(target_email)
  returning * into result;

  if result is null then
    raise exception 'no profile for %', target_email using errcode = 'P0002';
  end if;
  return result;
end;
$$;

revoke all on function public.bootstrap_admin(text) from public;
grant execute on function public.bootstrap_admin(text) to service_role;
