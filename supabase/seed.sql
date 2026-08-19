-- ============================================================================
-- supabase/seed.sql
-- Local development seed. Run by `supabase db reset`; NEVER run in production.
--
-- What is deliberately NOT here: a price. The price is owner-editable data,
-- not a constant, and seeding one would make a wrong number look official the
-- moment someone forgot to change it. The app renders an unpriced state until
-- the owner sets it from the admin panel.
-- ============================================================================

-- A handful of predictable codes so redemption can be exercised end to end
-- before any payment gateway exists.
insert into public.redemption_codes
  (code, kind, grants_days, max_uses, note, batch_label)
values
  ('JISR-DEV-MONTH', 'subscription', 30,  99, 'تطوير محلي — شهر',        'dev'),
  ('JISR-DEV-YEAR',  'subscription', 365, 99, 'تطوير محلي — سنة',        'dev'),
  ('JISR-DEV-LIFE',  'lifetime',     null, 99, 'تطوير محلي — دائم',      'dev'),
  ('JISR-DEV-ONCE',  'subscription', 30,  1,  'تطوير محلي — مرة واحدة',  'dev'),
  ('JISR-DEV-GONE',  'subscription', 30,  1,  'تطوير محلي — ملغى',       'dev')
on conflict (code) do nothing;

update public.redemption_codes
   set revoked_at = now()
 where code = 'JISR-DEV-GONE' and revoked_at is null;
