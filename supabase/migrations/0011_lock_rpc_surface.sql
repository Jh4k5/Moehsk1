-- ============================================================================
-- 0011_lock_rpc_surface.sql
-- سدّ ثغرة: كل دوال SECURITY DEFINER كانت قابلة للاستدعاء من anon.
--
-- الترحيلات السابقة كتبت `revoke all ... from public`، وهذا لا يكفي في
-- Supabase: المشروع يحمل ALTER DEFAULT PRIVILEGES يمنح EXECUTE لـanon
-- وauthenticated على كل دالة جديدة في schema public، والمنح الصريح لدور
-- لا يلغيه سحبٌ من PUBLIC.
--
-- ولماذا كان هذا كارثياً لا مجرّد تحذير: حرّاس دوال المدير مكتوبون
--     if actor is not null and not is_admin(actor) then raise ...
-- ومع anon يكون auth.uid() = null، فيصير `actor is not null` كاذباً،
-- فيسقط الشرط كله وتمضي الدالة بلا تحقّق. أي أن أي زائر مجهول كان
-- يستطيع استدعاء bootstrap_admin ليصير مديراً، أو admin_grant_subscription
-- ليمنح نفسه وصولاً دائماً، أو admin_set_config ليصفّر السعر.
--
-- القاعدة: anon لا يستدعي شيئاً إطلاقاً. ما يحتاجه الزائر المجهول (قراءة
-- app_config العامة) يمرّ عبر RLS على الجدول لا عبر RPC.
-- ============================================================================

revoke execute on all functions in schema public from anon;
alter default privileges in schema public revoke execute on functions from anon;

revoke execute on all functions in schema public from authenticated;
alter default privileges in schema public revoke execute on functions from authenticated;

grant execute on function public.is_admin(uuid)                        to authenticated;
grant execute on function public.get_entitlement(uuid)                 to authenticated;
grant execute on function public.redeem_code(text, uuid, text)         to authenticated;
grant execute on function public.import_local_progress(jsonb, boolean) to authenticated;

grant execute on function public.admin_set_config(jsonb)                              to authenticated;
grant execute on function public.admin_list_users(text, text, integer, integer)       to authenticated;
grant execute on function public.admin_metrics(integer)                               to authenticated;
grant execute on function public.admin_grant_subscription(uuid, integer, text, text)  to authenticated;
grant execute on function public.admin_revoke_subscription(uuid)                      to authenticated;
grant execute on function public.admin_revoke_code(uuid)                              to authenticated;
grant execute on function public.admin_revoke_batch(uuid)                             to authenticated;
grant execute on function public.admin_pending_gateway_events(integer)                to authenticated;
grant execute on function public.admin_generate_codes(
  integer, public.redemption_kind, integer, integer, timestamptz, text, text, text)   to authenticated;

grant execute on all functions in schema public to service_role;

create or replace function public.bootstrap_admin(target_email text)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  result public.profiles;
begin
  if auth.uid() is not null or current_user <> 'service_role' then
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

revoke all on function public.bootstrap_admin(text) from public, anon, authenticated;
grant execute on function public.bootstrap_admin(text) to service_role;

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.generate_code_string(len integer default 12)
returns text
language plpgsql
volatile
set search_path = public, pg_temp
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

revoke execute on function public.generate_code_string(integer) from public, anon, authenticated;
