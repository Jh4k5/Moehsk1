-- ============================================================================
-- 0010_tutor.sql
-- عدّاد المعلّم الذكي اليومي.
--
-- لماذا جدول جديد ولم يكفِ `events`؟ `events` سجلّ إلحاقي للتحليلات، وسياسته
-- تسمح للمستخدم بإدراج صفوفه بنفسه؛ العدّ منه يحتاج "اقرأ ثم اكتب"، وهما
-- عمليتان يمكن أن يتسابق عليهما طلبان متزامنان فيمرّان معاً فوق الحدّ. الحدّ
-- هنا حدّ تكلفة لا إحصاء، فيجب أن يكون الحجز ذرّياً في عبارة واحدة.
--
-- ثلاث قواعد يفرضها هذا الملف:
--   1. الحجز ذرّي: UPDATE ... WHERE model_calls < daily_limit في عبارة واحدة،
--      فطلبان متوازيان لا يمكن أن يمرّا معاً على آخر رصيد.
--   2. الحدّ ليس في الجدول: يأتي وسيطاً من `features.tutor_daily_limit` في
--      app_config، فتغييره من لوحة التحكم يسري فوراً بلا ترحيل.
--   3. لا يستدعي الدالتين إلا `service_role`. لو استطاع المستخدم استدعاء
--      الاسترجاع بنفسه لصار الحدّ زينة.
-- ============================================================================

create table if not exists public.tutor_usage (
  user_id       uuid    not null references auth.users(id) on delete cascade,
  -- اليوم بتوقيت UTC صراحةً: حدّ "يومي" يتبع منطقة المستخدم يعني حدّين لمن
  -- يسافر، وثغرة لمن يغيّر ساعة جهازه.
  usage_date    date    not null,
  model_calls   integer not null default 0 check (model_calls >= 0),
  first_call_at timestamptz not null default now(),
  last_call_at  timestamptz not null default now(),
  primary key (user_id, usage_date)
);

comment on table public.tutor_usage is
  'استهلاك المعلّم الذكي لكل مستخدم في اليوم (UTC). الحدّ نفسه في app_config.';

create index if not exists tutor_usage_date_idx on public.tutor_usage (usage_date desc);

alter table public.tutor_usage enable row level security;

-- قراءة فقط لصاحب الصف (ليرى رصيده) وللمدير. لا سياسة كتابة إطلاقاً: كل كتابة
-- تمرّ بدالة security definer يستدعيها الخادم.
drop policy if exists tutor_usage_select_own on public.tutor_usage;
create policy tutor_usage_select_own on public.tutor_usage
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ── الحجز الذرّي ────────────────────────────────────────────────────────────

create or replace function public.consume_tutor_credit(uid uuid, daily_limit integer)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  today date := (now() at time zone 'utc')::date;
  used  integer;
begin
  if uid is null then
    raise exception 'uid is required' using errcode = '22004';
  end if;

  if daily_limit is null or daily_limit <= 0 then
    select coalesce(t.model_calls, 0) into used
      from public.tutor_usage t where t.user_id = uid and t.usage_date = today;
    return json_build_object(
      'allowed', false, 'used', coalesce(used, 0),
      'limit', coalesce(daily_limit, 0), 'remaining', 0);
  end if;

  insert into public.tutor_usage (user_id, usage_date, model_calls)
  values (uid, today, 1)
  on conflict (user_id, usage_date) do update
     set model_calls  = public.tutor_usage.model_calls + 1,
         last_call_at = now()
   where public.tutor_usage.model_calls < daily_limit
  returning model_calls into used;

  -- لا صف عائد = شرط الـ WHERE سقط = الرصيد نفد.
  if used is null then
    select t.model_calls into used
      from public.tutor_usage t where t.user_id = uid and t.usage_date = today;
    return json_build_object(
      'allowed', false, 'used', coalesce(used, daily_limit),
      'limit', daily_limit, 'remaining', 0);
  end if;

  return json_build_object(
    'allowed', true, 'used', used, 'limit', daily_limit,
    'remaining', greatest(daily_limit - used, 0));
end;
$$;

comment on function public.consume_tutor_credit(uuid, integer) is
  'يحجز سؤالاً واحداً إن بقي رصيد اليوم. ذرّي: لا يمرّ طلبان فوق الحدّ.';

revoke all on function public.consume_tutor_credit(uuid, integer) from public;
grant execute on function public.consume_tutor_credit(uuid, integer) to service_role;

-- ── الاسترجاع ───────────────────────────────────────────────────────────────
-- يُستدعى حين يفشل استدعاء النموذج بعد الحجز: عطل عندنا لا يُخصم من الطالب.

create or replace function public.refund_tutor_credit(uid uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  today date := (now() at time zone 'utc')::date;
  used  integer;
begin
  update public.tutor_usage
     set model_calls = greatest(model_calls - 1, 0)
   where user_id = uid and usage_date = today
  returning model_calls into used;
  return coalesce(used, 0);
end;
$$;

revoke all on function public.refund_tutor_credit(uuid) from public;
grant execute on function public.refund_tutor_credit(uuid) to service_role;

-- ── القراءة بلا حجز ─────────────────────────────────────────────────────────
-- لعرض «بقي لك N اليوم» قبل أن يسأل الطالب شيئاً.

create or replace function public.peek_tutor_usage(uid uuid, daily_limit integer)
returns json
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select json_build_object(
    'used', coalesce(t.model_calls, 0),
    'limit', coalesce(daily_limit, 0),
    'remaining', greatest(coalesce(daily_limit, 0) - coalesce(t.model_calls, 0), 0))
    from (select 1) one
    left join public.tutor_usage t
      on t.user_id = uid and t.usage_date = (now() at time zone 'utc')::date;
$$;

revoke all on function public.peek_tutor_usage(uuid, integer) from public;
grant execute on function public.peek_tutor_usage(uuid, integer) to service_role;
