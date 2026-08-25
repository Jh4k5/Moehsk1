-- ============================================================================
-- 0012_revoke_public_from_remaining.sql
-- خمس دوال بقيت مفتوحة بعد 0011، ولسبب أدقّ.
--
-- `revoke ... from anon` لا يكفي حين تكون الصلاحية ممنوحة لـPUBLIC: كل دالة
-- بلا ACL صريح تحمل EXECUTE لـPUBLIC بحكم افتراض Postgres، وanon عضو في
-- PUBLIC، فالسحب منه وحده لا يغيّر شيئاً. الدوال التي أُغلقت في 0011 كانت
-- ترحيلاتها الأصلية تكتب `revoke all ... from public` صراحةً.
--
-- والسحب هنا مقصور على دوالّنا: سحب EXECUTE من PUBLIC على دوال إضافة citext
-- يكسر أعمدة citext نفسها، وهي مفتاح جدول الأكواد.
-- ============================================================================

revoke execute on function public.admin_pending_gateway_events(integer) from public, anon, authenticated;
grant  execute on function public.admin_pending_gateway_events(integer) to authenticated, service_role;

revoke execute on function public.tg_set_updated_at()      from public, anon, authenticated;
revoke execute on function public.tg_app_config_history()  from public, anon, authenticated;
revoke execute on function public.tg_handle_new_user()     from public, anon, authenticated;
revoke execute on function public.tg_profiles_guard_role() from public, anon, authenticated;
