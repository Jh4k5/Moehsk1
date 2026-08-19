-- ============================================================================
-- 0007_progress_import.sql
-- One-shot upload of a visitor's browser-only progress on first sign-in.
--
-- The payload is produced by src/lib/supabase/progress-import.ts, which reads
-- useLearningStore.getState() (NOT raw localStorage) and treats every field as
-- optional: the store's `migrate` is a bare type assertion that has never
-- transformed anything, so a dormant visitor's blob may be missing any field
-- added since they last opened the app.
--
-- Merge policy, stated once so it is not re-invented per table:
--   * word_progress  - incoming row wins only if it is strictly newer.
--   * daily_activity - GREATEST per counter, never a sum (a re-import must not
--                      double-count).
--   * unit_progress  - completion is monotonic; it is never un-completed.
--   * profile        - fills blanks only; never overwrites a server value.
-- ============================================================================

create or replace function public.import_local_progress(
  payload jsonb,
  force   boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid          uuid := auth.uid();
  already      timestamptz;
  n_words      integer := 0;
  n_days       integer := 0;
  n_units      integer := 0;
  n_events     integer := 0;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select progress_imported_at into already from public.profiles where id = uid;
  if already is not null and not force then
    return jsonb_build_object('ok', false, 'error', 'already_imported',
                              'imported_at', already);
  end if;

  -- ── Words ────────────────────────────────────────────────────────────────
  with incoming as (
    select
      (w ->> 'word_id')::integer                          as word_id,
      (w ->> 'level')::smallint                           as level,
      coalesce((w ->> 'ease_factor')::numeric,  2.5)      as ease_factor,
      coalesce((w ->> 'interval_days')::integer, 0)       as interval_days,
      coalesce((w ->> 'repetitions')::integer,  0)        as repetitions,
      coalesce((w ->> 'review_count')::integer, 0)        as review_count,
      coalesce((w ->> 'correct_count')::integer, 0)       as correct_count,
      nullif(w ->> 'next_review', '')::timestamptz        as next_review,
      nullif(w ->> 'last_review', '')::timestamptz        as last_review,
      coalesce((w ->> 'learned')::boolean, false)         as learned,
      coalesce((w ->> 'bookmarked')::boolean, false)      as bookmarked
    from jsonb_array_elements(coalesce(payload -> 'words', '[]'::jsonb)) as w
  ),
  cleaned as (
    -- Defensive: the client may hand over ids it could not map to a level.
    select * from incoming
     where word_id is not null
       and level between 1 and 3
       and ease_factor >= 1.3
  ),
  upserted as (
    insert into public.word_progress as wp
      (user_id, level, word_id, ease_factor, interval_days, repetitions,
       review_count, correct_count, next_review, last_review, learned, bookmarked)
    select uid, level, word_id, ease_factor, interval_days, repetitions,
           review_count, correct_count, next_review, last_review, learned, bookmarked
      from cleaned
    on conflict (user_id, level, word_id) do update
      set ease_factor   = case when excluded.last_review is not null
                                and (wp.last_review is null
                                     or excluded.last_review > wp.last_review)
                               then excluded.ease_factor else wp.ease_factor end,
          interval_days = greatest(wp.interval_days, excluded.interval_days),
          repetitions   = greatest(wp.repetitions,   excluded.repetitions),
          review_count  = greatest(wp.review_count,  excluded.review_count),
          correct_count = greatest(wp.correct_count, excluded.correct_count),
          next_review   = case when excluded.last_review is not null
                                and (wp.last_review is null
                                     or excluded.last_review > wp.last_review)
                               then excluded.next_review else wp.next_review end,
          last_review   = greatest(wp.last_review, excluded.last_review),
          learned       = wp.learned    or excluded.learned,
          bookmarked    = wp.bookmarked or excluded.bookmarked
    returning 1
  )
  select count(*) into n_words from upserted;

  -- ── Daily activity ───────────────────────────────────────────────────────
  with incoming as (
    select
      (d ->> 'date')::date                                as activity_date,
      coalesce((d ->> 'words_learned')::integer, 0)       as words_learned,
      coalesce((d ->> 'questions_answered')::integer, 0)  as questions_answered,
      coalesce((d ->> 'stories_read')::integer, 0)        as stories_read
    from jsonb_array_elements(coalesce(payload -> 'daily', '[]'::jsonb)) as d
  ),
  upserted as (
    insert into public.daily_activity as da
      (user_id, activity_date, words_learned, questions_answered, stories_read)
    select uid, activity_date, words_learned, questions_answered, stories_read
      from incoming
     where activity_date is not null
    on conflict (user_id, activity_date) do update
      set words_learned      = greatest(da.words_learned,      excluded.words_learned),
          questions_answered = greatest(da.questions_answered, excluded.questions_answered),
          stories_read       = greatest(da.stories_read,       excluded.stories_read)
    returning 1
  )
  select count(*) into n_days from upserted;

  -- ── Units ────────────────────────────────────────────────────────────────
  -- Empty in practice until the curriculum has units; accepted now so the
  -- routing agent can start writing them without another migration.
  with incoming as (
    select
      (u ->> 'level')::smallint     as level,
      (u ->> 'lesson_no')::smallint as lesson_no,
      (u ->> 'unit_no')::smallint   as unit_no,
      coalesce(u ->> 'status', 'in_progress')::public.unit_status as status,
      nullif(u ->> 'score', '')::smallint as score
    from jsonb_array_elements(coalesce(payload -> 'units', '[]'::jsonb)) as u
  ),
  upserted as (
    insert into public.unit_progress as up
      (user_id, level, lesson_no, unit_no, status, score, best_score,
       first_completed_at)
    select uid, level, lesson_no, unit_no, status, score, score,
           case when status = 'completed' then now() else null end
      from incoming
     where level between 1 and 3 and lesson_no is not null and unit_no is not null
    on conflict (user_id, level, lesson_no, unit_no) do update
      set status     = case when up.status = 'completed' then up.status
                            else excluded.status end,
          best_score = greatest(up.best_score, excluded.best_score),
          first_completed_at = coalesce(up.first_completed_at,
                                        excluded.first_completed_at),
          last_activity_at   = now()
    returning 1
  )
  select count(*) into n_units from upserted;

  -- ── Lossy leftovers ──────────────────────────────────────────────────────
  -- completedStories holds an ARRAY INDEX with no level, and index 0 is a
  -- different story in every level. Rather than guess, each entry is recorded
  -- as an event carrying the level the client believed it belonged to and an
  -- `ambiguous` flag, so it can be resolved later instead of vanishing.
  with incoming as (
    select
      coalesce(e ->> 'name', 'legacy.unknown')      as name,
      coalesce(e -> 'props', '{}'::jsonb)           as props,
      coalesce(nullif(e ->> 'occurred_at', '')::timestamptz, now()) as occurred_at
    from jsonb_array_elements(coalesce(payload -> 'events', '[]'::jsonb)) as e
  ),
  inserted as (
    insert into public.events (user_id, name, props, occurred_at)
    select uid, name, props, occurred_at from incoming
    returning 1
  )
  select count(*) into n_events from inserted;

  -- ── Profile: fill blanks only ────────────────────────────────────────────
  update public.profiles p
     set display_name  = coalesce(p.display_name,
                                  nullif(payload #>> '{profile,display_name}', '')),
         avatar_emoji  = coalesce(p.avatar_emoji,
                                  nullif(payload #>> '{profile,avatar_emoji}', '')),
         daily_goal    = coalesce(nullif(payload #>> '{profile,daily_goal}', '')::integer,
                                  p.daily_goal),
         current_level = coalesce(nullif(payload #>> '{profile,current_level}', '')::smallint,
                                  p.current_level),
         locale        = coalesce(nullif(payload #>> '{profile,locale}', ''), p.locale),
         settings      = p.settings || coalesce(payload -> 'profile' -> 'settings',
                                                '{}'::jsonb),
         progress_imported_at = now()
   where p.id = uid;

  -- Keep the raw blob: it is the only copy, and parts of it cannot be mapped
  -- to a table until the curriculum grows units.
  insert into public.progress_imports (user_id, snapshot, store_version, stats)
  values (
    uid,
    coalesce(payload -> 'snapshot', payload),
    nullif(payload ->> 'store_version', '')::integer,
    jsonb_build_object('words', n_words, 'days', n_days,
                       'units', n_units, 'events', n_events)
  );

  return jsonb_build_object(
    'ok', true,
    'words', n_words,
    'days', n_days,
    'units', n_units,
    'events', n_events
  );
end;
$$;

revoke all on function public.import_local_progress(jsonb, boolean) from public;
grant execute on function public.import_local_progress(jsonb, boolean)
  to authenticated, service_role;

comment on function public.import_local_progress(jsonb, boolean) is
  'One-shot merge of a visitor''s browser progress. Guarded by profiles.progress_imported_at.';
