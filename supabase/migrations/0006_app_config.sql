-- ============================================================================
-- 0006_app_config.sql
-- Owner-editable runtime settings. PRICE LIVES HERE AND NOWHERE ELSE.
--
-- The seeded price value is deliberately NULL. Price is not content and is not
-- a constant: the codebase must contain zero price literals, including in this
-- migration, so the owner is forced to set it once from the admin panel. Until
-- then the app renders an "unpriced" state rather than a wrong number.
-- ============================================================================

create table if not exists public.app_config (
  key          text primary key check (key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'),
  value        jsonb,
  value_type   text not null check (value_type in ('number','string','boolean','json')),
  group_key    text not null default 'general',
  label_ar     text not null,
  hint_ar      text,
  -- Public keys are readable by anyone, signed in or not (the marketing page
  -- has to render the price). Private keys never leave the server.
  is_public    boolean not null default true,
  sort_order   integer not null default 100,
  updated_by   uuid references auth.users(id) on delete set null,
  updated_at   timestamptz not null default now()
);

comment on table public.app_config is
  'Runtime settings edited from the admin panel. The single source of price.';

drop trigger if exists set_updated_at on public.app_config;
create trigger set_updated_at
  before update on public.app_config
  for each row execute function public.tg_set_updated_at();

-- Every change is recorded. A price is money; it should never change without
-- a trace of who changed it and what it was before.
create table if not exists public.app_config_history (
  id         bigint generated always as identity primary key,
  key        text not null,
  old_value  jsonb,
  new_value  jsonb,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists app_config_history_key_idx
  on public.app_config_history (key, changed_at desc);

create or replace function public.tg_app_config_history()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and new.value is not distinct from old.value then
    return new;
  end if;
  insert into public.app_config_history (key, old_value, new_value, changed_by)
  values (
    new.key,
    case when tg_op = 'UPDATE' then old.value else null end,
    new.value,
    coalesce(new.updated_by, auth.uid())
  );
  return new;
end;
$$;

drop trigger if exists record_history on public.app_config;
create trigger record_history
  after insert or update on public.app_config
  for each row execute function public.tg_app_config_history();

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- World-readable for public keys (anon included: the price shows on the
-- marketing page before sign-in). Writable only by an admin.

alter table public.app_config         enable row level security;
alter table public.app_config_history enable row level security;

-- Two policies rather than one OR: policies are OR-ed anyway, and this keeps
-- anon off is_admin() entirely instead of granting the anonymous role execute
-- on the admin predicate.
drop policy if exists app_config_public_read on public.app_config;
create policy app_config_public_read on public.app_config
  for select to anon, authenticated
  using (is_public);

drop policy if exists app_config_admin_read on public.app_config;
create policy app_config_admin_read on public.app_config
  for select to authenticated
  using (public.is_admin());

drop policy if exists app_config_admin_write on public.app_config;
create policy app_config_admin_write on public.app_config
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_config_history_admin_read on public.app_config_history;
create policy app_config_history_admin_read on public.app_config_history
  for select to authenticated using (public.is_admin());

-- ── Admin write RPC ─────────────────────────────────────────────────────────
-- Rejects unknown keys, so a typo cannot silently create a setting nothing
-- reads, and stamps updated_by from the caller rather than trusting the body.

create or replace function public.admin_set_config(entries jsonb)
returns setof public.app_config
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor uuid := auth.uid();
  k     text;
  v     jsonb;
  out_row public.app_config;
begin
  if actor is not null and not public.is_admin(actor) then
    raise exception 'forbidden: admin role required' using errcode = '42501';
  end if;

  for k, v in select * from jsonb_each(entries) loop
    if not exists (select 1 from public.app_config c where c.key = k) then
      raise exception 'unknown config key: %', k using errcode = '22023';
    end if;

    update public.app_config
       set value = case when v = 'null'::jsonb then null else v end,
           updated_by = actor
     where key = k
    returning * into out_row;

    return next out_row;
  end loop;
end;
$$;

revoke all on function public.admin_set_config(jsonb) from public;
grant execute on function public.admin_set_config(jsonb) to authenticated, service_role;

-- ── Seed ────────────────────────────────────────────────────────────────────
-- `on conflict do nothing` on the value: re-running a migration must never
-- reset a price the owner has already set. Labels and hints DO get refreshed.

insert into public.app_config
  (key, value, value_type, group_key, label_ar, hint_ar, is_public, sort_order)
values
  -- Pricing. Amounts are intentionally NULL until the owner sets them.
  ('pricing.monthly_amount', null, 'number', 'pricing',
   'سعر الاشتراك الشهري', 'الرقم فقط بلا رمز عملة. لا يُعرض أي سعر قبل ضبطه.', true, 10),
  ('pricing.annual_amount', null, 'number', 'pricing',
   'سعر الاشتراك السنوي', 'اتركه فارغاً إن لم تُفعّل الخطة السنوية.', true, 20),
  ('pricing.lifetime_amount', null, 'number', 'pricing',
   'سعر الوصول الدائم', 'اتركه فارغاً إن لم تُفعّل الخطة الدائمة.', true, 30),
  ('pricing.currency', '"USD"', 'string', 'pricing',
   'العملة', 'رمز العملة بثلاثة أحرف مثل USD أو AED أو EGP.', true, 40),
  ('pricing.note_ar', null, 'string', 'pricing',
   'ملاحظة تظهر تحت السعر', 'مثال: يشمل كل المستويات والتحديثات القادمة.', true, 50),

  -- Free tier: the beginner primer plus the first two lessons.
  ('access.free_primer', 'true', 'boolean', 'access',
   'تمهيد المبتدئ مجاني', 'الوحدة الصفرية قبل الدرس الأول.', true, 10),
  ('access.free_lesson_count', '2', 'number', 'access',
   'عدد الدروس المجانية', 'أول كم درساً من كل مستوى يُفتح بلا اشتراك.', true, 20),
  -- قرار المالك: الدرسان الأولان مجانيان في مستوى المتعلّم الذي اختاره، لا
  -- في HSK1 وحده. طالبُ المستوى الثاني لا يبدأ من الأول.
  ('access.free_levels', '[1,2,3]', 'json', 'access',
   'المستويات التي تحوي دروساً مجانية', 'مصفوفة أرقام. الدرسان الأولان مجانيان في كل مستوى.', true, 30),

  -- Trial behaviour. Off by default: the free tier is the trial.
  -- قرار المالك: بقية الأقسام تُفتح ٤٨ ساعة بعد إنشاء حساب ثم تُقفل.
  ('trial.enabled', 'true', 'boolean', 'trial',
   'تفعيل التجربة المجانية المؤقتة', 'تفتح بقية الأقسام مؤقتاً بعد إنشاء حساب.', true, 10),
  ('trial.days', '2', 'number', 'trial',
   'مدة التجربة بالأيام', 'تُحتسب من أول تسجيل دخول. ٢ = ٤٨ ساعة.', true, 20),

  -- Feature flags.
  ('features.checkout_enabled', 'false', 'boolean', 'features',
   'تفعيل الدفع الإلكتروني', 'يبقى مطفأً حتى تُختار بوابة الدفع.', true, 10),
  ('features.redemption_enabled', 'true', 'boolean', 'features',
   'تفعيل أكواد التفعيل', 'تعمل بلا بوابة دفع.', true, 20),
  ('features.tutor_enabled', 'true', 'boolean', 'features',
   'تفعيل المعلم الذكي', null, true, 30),
  ('features.tutor_daily_limit', '20', 'number', 'features',
   'حد أسئلة المعلم الذكي يومياً', 'للمشتركين فقط.', true, 40),
  ('features.signup_enabled', 'true', 'boolean', 'features',
   'السماح بإنشاء حسابات جديدة', null, true, 50),

  -- Announcement banner.
  ('announcement.enabled', 'false', 'boolean', 'announcement',
   'إظهار شريط الإعلان', null, true, 10),
  ('announcement.text_ar', null, 'string', 'announcement',
   'نص الإعلان بالعربية', null, true, 20),
  ('announcement.text_en', null, 'string', 'announcement',
   'نص الإعلان بالإنجليزية', null, true, 30),
  ('announcement.href', null, 'string', 'announcement',
   'رابط الإعلان', 'اختياري.', true, 40),
  ('announcement.variant', '"info"', 'string', 'announcement',
   'نبرة الإعلان', 'info أو success أو warning.', true, 50),

  -- Payment gateway. Private: never shipped to the browser.
  ('gateway.provider', '"none"', 'string', 'gateway',
   'بوابة الدفع', 'none حتى تُحسم أهلية البائع. ثم paddle أو lemonsqueezy.', false, 10),
  ('gateway.checkout_url', null, 'string', 'gateway',
   'رابط صفحة الدفع', 'يُملأ من لوحة البوابة بعد اختيارها.', false, 20),
  ('gateway.product_id', null, 'string', 'gateway',
   'معرّف المنتج لدى البوابة', null, false, 30)
on conflict (key) do update
  set value_type = excluded.value_type,
      group_key  = excluded.group_key,
      label_ar   = excluded.label_ar,
      hint_ar    = excluded.hint_ar,
      is_public  = excluded.is_public,
      sort_order = excluded.sort_order;
