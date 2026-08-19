-- ============================================================================
-- 0002_profiles.sql
-- One row per authenticated user. Created automatically by a trigger on
-- auth.users so a profile always exists by the time the first request lands.
-- ============================================================================

create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text,
  display_name          text,
  avatar_emoji          text,
  role                  public.app_role not null default 'user',
  locale                text not null default 'ar' check (locale in ('ar', 'en')),
  daily_goal            integer not null default 10 check (daily_goal between 1 and 500),
  current_level         smallint not null default 1 check (current_level between 1 and 3),
  -- UI preferences that are not progress: hanzi font scale, tts rate, voice uri…
  settings              jsonb not null default '{}'::jsonb,
  -- Set the first time a visitor's localStorage progress is uploaded, so the
  -- import runs once and is never allowed to overwrite server-side truth.
  progress_imported_at  timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.profiles is
  'Public mirror of auth.users plus learner preferences. Never holds content.';
comment on column public.profiles.role is
  'Authorisation role. Only an existing admin or the service role may change it.';

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- ── Admin predicate ─────────────────────────────────────────────────────────
-- SECURITY DEFINER so RLS policies elsewhere can consult profiles.role without
-- recursing through the policies on profiles itself. search_path is pinned —
-- a SECURITY DEFINER function with a mutable search_path is an escalation hole.

create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select p.role = 'admin'::public.app_role from public.profiles p where p.id = uid),
    false
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

comment on function public.is_admin(uuid) is
  'True when the given user (default: the caller) carries profiles.role = admin.';

-- ── Role escalation guard ───────────────────────────────────────────────────
-- RLS `with check` cannot express "you may update every column except this
-- one", so the guard lives in a trigger: a non-admin's UPDATE silently keeps
-- the stored role instead of the value they submitted.

create or replace function public.tg_profiles_guard_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is null or public.is_admin(auth.uid()) then
      -- service_role (auth.uid() is null) and admins may change roles.
      return new;
    end if;
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_role on public.profiles;
create trigger guard_role
  before update on public.profiles
  for each row execute function public.tg_profiles_guard_role();

-- ── Auto-provision on signup ────────────────────────────────────────────────

create or replace function public.tg_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_emoji)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_emoji', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Deliberately no DELETE policy: profiles die with the auth.users row.
