-- ============================================================================
-- 0005_progress.sql
-- Learner progress. Content itself stays in TypeScript files in the repo;
-- nothing here stores a Chinese word, a sentence or a lesson body.
-- ============================================================================

-- ── unit_progress ───────────────────────────────────────────────────────────
-- Composite primary key on (user_id, level, lesson_no, unit_no).
-- Lesson ids restart at 1 in every level (1..15, 1..15, 1..18), so a key of
-- (user_id, lesson_id, unit_no) would collide across levels roughly 30 times.

create table if not exists public.unit_progress (
  user_id           uuid     not null references auth.users(id) on delete cascade,
  level             smallint not null check (level between 1 and 3),
  lesson_no         smallint not null check (lesson_no >= 0),
  -- unit_no 0 is reserved for the beginner primer that sits before lesson 1.
  unit_no           smallint not null check (unit_no >= 0),
  status            public.unit_status not null default 'in_progress',
  score             smallint check (score between 0 and 100),
  best_score        smallint check (best_score between 0 and 100),
  attempts          integer  not null default 0 check (attempts >= 0),
  seconds_spent     integer  not null default 0 check (seconds_spent >= 0),
  first_started_at  timestamptz not null default now(),
  first_completed_at timestamptz,
  last_activity_at  timestamptz not null default now(),
  primary key (user_id, level, lesson_no, unit_no)
);

comment on table public.unit_progress is
  'Per-unit completion. PK is composite because lesson ids repeat per level.';

create index if not exists unit_progress_user_recent_idx
  on public.unit_progress (user_id, last_activity_at desc);

-- ── word_progress ───────────────────────────────────────────────────────────
-- SM-2 state, mirroring src/lib/srs.ts. `level` is an EXPLICIT column: word id
-- ranges happen to be disjoint today, but inferring level from an id range is
-- a rule nothing enforces and the content files are free to break.

create table if not exists public.word_progress (
  user_id       uuid     not null references auth.users(id) on delete cascade,
  level         smallint not null check (level between 1 and 3),
  word_id       integer  not null,
  ease_factor   numeric(4,2) not null default 2.5 check (ease_factor >= 1.3),
  interval_days integer  not null default 0 check (interval_days >= 0),
  repetitions   integer  not null default 0 check (repetitions >= 0),
  review_count  integer  not null default 0 check (review_count >= 0),
  correct_count integer  not null default 0 check (correct_count >= 0),
  next_review   timestamptz,
  last_review   timestamptz,
  learned       boolean  not null default false,
  bookmarked    boolean  not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  primary key (user_id, level, word_id)
);

comment on column public.word_progress.level is
  'Explicit. Never derive this from the word id range.';

create index if not exists word_progress_due_idx
  on public.word_progress (user_id, next_review)
  where next_review is not null;

drop trigger if exists set_updated_at on public.word_progress;
create trigger set_updated_at
  before update on public.word_progress
  for each row execute function public.tg_set_updated_at();

-- ── daily_activity ──────────────────────────────────────────────────────────

create table if not exists public.daily_activity (
  user_id            uuid not null references auth.users(id) on delete cascade,
  activity_date      date not null,
  words_learned      integer not null default 0 check (words_learned >= 0),
  questions_answered integer not null default 0 check (questions_answered >= 0),
  stories_read       integer not null default 0 check (stories_read >= 0),
  units_completed    integer not null default 0 check (units_completed >= 0),
  seconds_studied    integer not null default 0 check (seconds_studied >= 0),
  primary key (user_id, activity_date)
);

-- ── events ──────────────────────────────────────────────────────────────────
-- Append-only analytics + an audit trail for anything lossy (see the progress
-- import, which parks unmappable legacy facts here rather than dropping them).

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null check (length(name) between 1 and 120),
  props       jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists events_user_time_idx on public.events (user_id, occurred_at desc);
create index if not exists events_name_time_idx on public.events (name, occurred_at desc);

-- ── progress_imports ────────────────────────────────────────────────────────
-- The raw localStorage snapshot, kept verbatim.
--
-- Why this table exists: the curriculum has no units yet (they are built in a
-- later phase), and the legacy store records `completedStories` as an ARRAY
-- INDEX with no level attached. Some of what a long-dormant visitor uploads
-- therefore cannot be mapped to a row in unit_progress today. Throwing it away
-- would be irreversible; parking the blob here lets the import be replayed
-- once the unit map exists.

create table if not exists public.progress_imports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  snapshot    jsonb not null,
  stats       jsonb not null default '{}'::jsonb,
  store_version integer,
  imported_at timestamptz not null default now(),
  replayed_at timestamptz
);

create index if not exists progress_imports_user_idx
  on public.progress_imports (user_id, imported_at desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Every progress table follows one rule: a user reads and writes only rows
-- whose user_id is their own; an admin may read.

alter table public.unit_progress    enable row level security;
alter table public.word_progress    enable row level security;
alter table public.daily_activity   enable row level security;
alter table public.events           enable row level security;
alter table public.progress_imports enable row level security;

drop policy if exists unit_progress_select on public.unit_progress;
create policy unit_progress_select on public.unit_progress
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists unit_progress_insert on public.unit_progress;
create policy unit_progress_insert on public.unit_progress
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists unit_progress_update on public.unit_progress;
create policy unit_progress_update on public.unit_progress
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists unit_progress_delete on public.unit_progress;
create policy unit_progress_delete on public.unit_progress
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists word_progress_select on public.word_progress;
create policy word_progress_select on public.word_progress
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists word_progress_insert on public.word_progress;
create policy word_progress_insert on public.word_progress
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists word_progress_update on public.word_progress;
create policy word_progress_update on public.word_progress
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists word_progress_delete on public.word_progress;
create policy word_progress_delete on public.word_progress
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists daily_activity_select on public.daily_activity;
create policy daily_activity_select on public.daily_activity
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists daily_activity_insert on public.daily_activity;
create policy daily_activity_insert on public.daily_activity
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists daily_activity_update on public.daily_activity;
create policy daily_activity_update on public.daily_activity
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Events are append-only for the learner: insert own, read own, never update.
drop policy if exists events_select_own on public.events;
create policy events_select_own on public.events
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists progress_imports_select_own on public.progress_imports;
create policy progress_imports_select_own on public.progress_imports
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists progress_imports_insert_own on public.progress_imports;
create policy progress_imports_insert_own on public.progress_imports
  for insert to authenticated with check (user_id = auth.uid());
