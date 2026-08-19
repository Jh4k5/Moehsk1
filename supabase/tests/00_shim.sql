-- ============================================================================
-- supabase/tests/00_shim.sql
--
-- LOCAL VALIDATION ONLY. Never applied to a Supabase project - Supabase brings
-- all of this itself. It exists so the migrations can be applied and their RLS
-- exercised against a plain `postgres` container, which is how they were
-- verified in CI-less development.
--
--   psql -f supabase/tests/00_shim.sql
--   psql -f supabase/migrations/0001_foundation.sql   (…and the rest, in order)
-- ============================================================================

create schema if not exists auth;

do $$ begin create role anon           nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated  nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role   nologin bypassrls; exception when duplicate_object then null; end $$;
do $$ begin create role authenticator  noinherit login password 'shim'; exception when duplicate_object then null; end $$;

grant anon, authenticated, service_role to authenticator;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth  to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;

-- A minimal stand-in for GoTrue's users table: only the columns the migrations
-- actually read.
create table if not exists auth.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique,
  raw_user_meta_data  jsonb default '{}'::jsonb,
  last_sign_in_at     timestamptz,
  created_at          timestamptz not null default now()
);

-- Supabase derives auth.uid() from the request JWT. Locally we read the same
-- GUC that Supabase sets, so the policies under test are the real ones.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon');
$$;

grant execute on function auth.uid()  to anon, authenticated, service_role;
grant execute on function auth.role() to anon, authenticated, service_role;
grant select on auth.users to service_role;
