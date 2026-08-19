-- ============================================================================
-- supabase/tests/10_rls_and_flows.sql
--
-- LOCAL VALIDATION ONLY. Exercises the policies and RPCs the app depends on.
-- Every check raises on failure, so the script either prints PASS lines to the
-- end or aborts.
--
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/00_shim.sql
--   …migrations…
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/10_rls_and_flows.sql
-- ============================================================================

\set ON_ERROR_STOP on
\timing off

create or replace function pg_temp.check(label text, condition boolean)
returns void language plpgsql as $$
begin
  if condition then
    raise notice 'PASS  %', label;
  else
    raise exception 'FAIL  %', label;
  end if;
end $$;

-- ── Fixtures ────────────────────────────────────────────────────────────────
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.test',   '{"full_name":"المالك"}'),
  ('22222222-2222-2222-2222-222222222222', 'learner@example.test', '{"full_name":"متعلم"}'),
  ('33333333-3333-3333-3333-333333333333', 'other@example.test',   '{"full_name":"آخر"}');

select pg_temp.check('signup trigger creates a profile per user',
  (select count(*) from public.profiles) = 3);

select public.bootstrap_admin('owner@example.test');
select pg_temp.check('bootstrap_admin promotes the owner',
  public.is_admin('11111111-1111-1111-1111-111111111111'));

-- ── Role escalation guard ───────────────────────────────────────────────────
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;

update public.profiles set role = 'admin' where id = auth.uid();
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('a learner cannot promote themselves to admin',
  not public.is_admin('22222222-2222-2222-2222-222222222222'));

-- ── profiles RLS ────────────────────────────────────────────────────────────
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;
select pg_temp.check('a learner sees only their own profile',
  (select count(*) from public.profiles) = 1);
reset role;
reset "request.jwt.claim.sub";

set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
select pg_temp.check('an admin sees every profile',
  (select count(*) from public.profiles) = 3);
reset role;
reset "request.jwt.claim.sub";

-- ── app_config RLS ──────────────────────────────────────────────────────────
set role anon;
select pg_temp.check('anon reads public config keys',
  (select count(*) from public.app_config where key = 'pricing.monthly_amount') = 1);
select pg_temp.check('anon cannot read private gateway keys',
  (select count(*) from public.app_config where group_key = 'gateway') = 0);
reset role;
reset "request.jwt.claim.sub";

select pg_temp.check('the seeded price is NULL - no price literal anywhere',
  (select value from public.app_config where key = 'pricing.monthly_amount') is null);

set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;
update public.app_config set value = '1'::jsonb where key = 'pricing.monthly_amount';
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('a learner cannot rewrite the price',
  (select value from public.app_config where key = 'pricing.monthly_amount') is null);

set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
select public.admin_set_config('{"pricing.monthly_amount": 19, "pricing.currency": "AED"}'::jsonb);
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('an admin can set the price',
  (select value from public.app_config where key = 'pricing.monthly_amount') = '19'::jsonb);
select pg_temp.check('every config change is recorded in history',
  (select count(*) from public.app_config_history where key = 'pricing.monthly_amount') >= 1);

do $$ begin
  begin
    perform public.admin_set_config('{"pricing.nonexistent": 1}'::jsonb);
    raise exception 'FAIL  unknown config keys must be rejected';
  exception when sqlstate '22023' then
    raise notice 'PASS  unknown config keys are rejected';
  end;
end $$;

-- ── Redemption codes ────────────────────────────────────────────────────────
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;
select pg_temp.check('a learner cannot list redemption codes',
  (select count(*) from public.redemption_codes) = 0);
do $$ begin
  begin
    perform public.admin_generate_codes(1);
    raise exception 'FAIL  a learner must not be able to mint codes';
  exception when sqlstate '42501' then
    raise notice 'PASS  a learner cannot mint codes';
  end;
end $$;
reset role;
reset "request.jwt.claim.sub";

set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
create temp table minted as
  select * from public.admin_generate_codes(
    quantity      => 5,
    code_kind     => 'subscription',
    days          => 30,
    uses_per_code => 1,
    expires       => null,
    code_note     => 'حملة المؤثر فلان',
    label         => 'influencer-aug',
    code_prefix   => 'JISR'
  );
reset role;
reset "request.jwt.claim.sub";

select pg_temp.check('bulk generation makes the requested number of codes',
  (select count(*) from minted) = 5);
select pg_temp.check('bulk generation shares one batch id',
  (select count(distinct batch_id) from minted) = 1);
select pg_temp.check('the note travels with the code',
  (select bool_and(note = 'حملة المؤثر فلان') from minted));

-- Single use, and codes are case-insensitive.
select pg_temp.check('redeeming in the wrong case still works',
  (public.redeem_code(
     lower((select code::text from minted order by code limit 1)),
     '22222222-2222-2222-2222-222222222222') ->> 'ok')::boolean);

select pg_temp.check('redemption grants entitlement',
  (select is_entitled from public.get_entitlement('22222222-2222-2222-2222-222222222222')));
select pg_temp.check('a 30-day code expires in ~30 days',
  (select active_until::date from public.get_entitlement('22222222-2222-2222-2222-222222222222'))
    = (now() + interval '30 days')::date);

select pg_temp.check('the same user cannot redeem the same code twice',
  (public.redeem_code(
     (select code::text from minted order by code limit 1),
     '22222222-2222-2222-2222-222222222222') ->> 'error') = 'already_redeemed');

select pg_temp.check('a single-use code is exhausted for the next person',
  (public.redeem_code(
     (select code::text from minted order by code limit 1),
     '33333333-3333-3333-3333-333333333333') ->> 'error') = 'code_exhausted');

-- Stacking: a second code extends rather than duplicating.
select public.redeem_code(
  (select code::text from minted order by code offset 1 limit 1),
  '22222222-2222-2222-2222-222222222222');
select pg_temp.check('a second code extends the same subscription to 60 days',
  (select active_until::date from public.get_entitlement('22222222-2222-2222-2222-222222222222'))
    = (now() + interval '60 days')::date);
select pg_temp.check('stacking does not create a second subscription row',
  (select count(*) from public.subscriptions
    where user_id = '22222222-2222-2222-2222-222222222222'
      and source = 'redemption') = 1);

-- Multi-use.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
create temp table multi as
  select * from public.admin_generate_codes(1, 'subscription', 7, 3, null,
                                            'كود جماعي', 'group', 'JISR');
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('multi-use code accepts a second person',
  (public.redeem_code((select code::text from multi), '33333333-3333-3333-3333-333333333333')
    ->> 'ok')::boolean);
select pg_temp.check('used_count tracks each redemption',
  (select used_count from public.redemption_codes
    where id = (select id from multi)) = 1);

-- Expiry.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
create temp table stale as
  select * from public.admin_generate_codes(1, 'subscription', 7, 1,
                                            now() - interval '1 day', null, null, 'JISR');
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('an expired code is refused',
  (public.redeem_code((select code::text from stale), '11111111-1111-1111-1111-111111111111')
    ->> 'error') = 'code_expired');

-- Revocation.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
select public.admin_revoke_code((select id from minted order by code offset 2 limit 1));
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('a revoked code is refused',
  (public.redeem_code(
     (select code::text from minted order by code offset 2 limit 1),
     '11111111-1111-1111-1111-111111111111') ->> 'error') = 'code_revoked');

select pg_temp.check('unknown codes are refused',
  (public.redeem_code('JISR-NOPE-NOPE', '11111111-1111-1111-1111-111111111111')
    ->> 'error') = 'code_not_found');

-- Lifetime.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
create temp table forever as
  select * from public.admin_generate_codes(1, 'lifetime', null, 1, null,
                                            'وصول دائم', null, 'JISR');
reset role;
reset "request.jwt.claim.sub";
select public.redeem_code((select code::text from forever), '33333333-3333-3333-3333-333333333333');
select pg_temp.check('a lifetime code never expires',
  (select is_lifetime from public.get_entitlement('33333333-3333-3333-3333-333333333333')));

-- Usage report.
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
select pg_temp.check('the usage report classifies every code',
  (select count(*) from public.redemption_code_usage
    where state in ('available','revoked','expired','exhausted'))
   = (select count(*) from public.redemption_codes));
reset role;
reset "request.jwt.claim.sub";

set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;
select pg_temp.check('the usage report is invisible to a learner',
  (select count(*) from public.redemption_code_usage) = 0);
reset role;
reset "request.jwt.claim.sub";

-- ── Progress RLS ────────────────────────────────────────────────────────────
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;
insert into public.word_progress (user_id, level, word_id, learned)
  values (auth.uid(), 1, 1, true);
do $$ begin
  begin
    insert into public.word_progress (user_id, level, word_id)
      values ('33333333-3333-3333-3333-333333333333', 1, 2);
    raise exception 'FAIL  a learner must not write another learner''s progress';
  exception when insufficient_privilege then
    raise notice 'PASS  a learner cannot write another learner''s progress';
  end;
end $$;
reset role;
reset "request.jwt.claim.sub";

-- Same word id, different level: the composite key keeps them apart.
insert into public.word_progress (user_id, level, word_id)
  values ('22222222-2222-2222-2222-222222222222', 2, 1);
select pg_temp.check('word_progress keys on (user, level, word) so levels cannot collide',
  (select count(*) from public.word_progress
    where user_id = '22222222-2222-2222-2222-222222222222' and word_id = 1) = 2);

-- Lesson 1 exists in all three levels; the composite key keeps them apart too.
insert into public.unit_progress (user_id, level, lesson_no, unit_no, status) values
  ('22222222-2222-2222-2222-222222222222', 1, 1, 1, 'completed'),
  ('22222222-2222-2222-2222-222222222222', 2, 1, 1, 'in_progress'),
  ('22222222-2222-2222-2222-222222222222', 3, 1, 1, 'in_progress');
select pg_temp.check('unit_progress keys on (user, level, lesson, unit)',
  (select count(*) from public.unit_progress
    where user_id = '22222222-2222-2222-2222-222222222222' and lesson_no = 1) = 3);

-- ── Progress import ─────────────────────────────────────────────────────────
set "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';
set role authenticated;
create temp table import_result as select public.import_local_progress($json$
{
  "store_version": 2,
  "profile": { "display_name": "زائر قديم", "avatar_emoji": "🐼", "daily_goal": 15,
               "current_level": 2, "locale": "ar",
               "settings": { "hanziFontScale": 1.2 } },
  "words": [
    { "word_id": 5,    "level": 1, "ease_factor": 2.3, "repetitions": 4,
      "review_count": 9, "correct_count": 7, "last_review": "2026-01-02T00:00:00Z",
      "next_review": "2026-02-02T00:00:00Z", "learned": true },
    { "word_id": 2100, "level": 2, "learned": true },
    { "word_id": 9,    "level": 9, "learned": true }
  ],
  "daily": [ { "date": "2026-01-02", "words_learned": 6, "questions_answered": 12 } ],
  "units": [],
  "events": [
    { "name": "legacy.story_completed",
      "props": { "index": 0, "level": 2, "ambiguous": true } }
  ],
  "snapshot": { "learnedWords": [5, 2100] }
}
$json$::jsonb) as r;
reset role;
reset "request.jwt.claim.sub";

select pg_temp.check('import reports success',
  ((select r from import_result) ->> 'ok')::boolean);
select pg_temp.check('import drops rows whose level could not be resolved',
  ((select r from import_result) ->> 'words')::int = 2);
select pg_temp.check('import parks ambiguous story indexes in events',
  (select count(*) from public.events
    where user_id = '33333333-3333-3333-3333-333333333333'
      and name = 'legacy.story_completed') = 1);
select pg_temp.check('import keeps the raw snapshot for later replay',
  (select count(*) from public.progress_imports
    where user_id = '33333333-3333-3333-3333-333333333333') = 1);
select pg_temp.check('import fills profile blanks',
  (select avatar_emoji from public.profiles
    where id = '33333333-3333-3333-3333-333333333333') = '🐼');

set "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';
set role authenticated;
select pg_temp.check('import runs once and refuses to run again',
  (public.import_local_progress('{"words":[]}'::jsonb) ->> 'error') = 'already_imported');
reset role;
reset "request.jwt.claim.sub";

-- ── Admin reporting ─────────────────────────────────────────────────────────
set "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set role authenticated;
do $$ begin
  begin
    perform public.admin_metrics();
    raise exception 'FAIL  a learner must not read metrics';
  exception when sqlstate '42501' then
    raise notice 'PASS  a learner cannot read metrics';
  end;
end $$;
reset role;
reset "request.jwt.claim.sub";

set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
select pg_temp.check('metrics count the three fixtures',
  (public.admin_metrics() ->> 'users_total')::int = 3);
select pg_temp.check('metrics count active subscribers',
  (public.admin_metrics() ->> 'subscribers_active')::int = 2);
select pg_temp.check('admin_list_users filters to subscribers',
  (select count(*) from public.admin_list_users(null, 'subscribers')) = 2);
select pg_temp.check('admin_list_users searches by email',
  (select count(*) from public.admin_list_users('learner')) = 1);
reset role;
reset "request.jwt.claim.sub";

-- ── Manual grant / revoke ───────────────────────────────────────────────────
set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
create temp table granted as
  select * from public.admin_grant_subscription(
    '11111111-1111-1111-1111-111111111111', 90, 'manual', 'حساب المالك');
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('a manual grant entitles',
  (select is_entitled from public.get_entitlement('11111111-1111-1111-1111-111111111111')));

set "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set role authenticated;
select public.admin_revoke_subscription((select id from granted));
reset role;
reset "request.jwt.claim.sub";
select pg_temp.check('revoking a grant removes entitlement',
  not (select is_entitled from public.get_entitlement('11111111-1111-1111-1111-111111111111')));

select 'ALL CHECKS PASSED' as result;
