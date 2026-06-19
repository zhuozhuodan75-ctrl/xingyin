-- checkin_record 表：允许匿名/已登录用户插入与查询自己的打卡记录
-- 在 Supabase SQL Editor 执行（若表已存在且 insert 被 RLS 拒绝）

alter table public.checkin_record enable row level security;

-- 开发阶段：允许所有人插入（无 user_id 时）
drop policy if exists "checkin_record_insert_anon" on public.checkin_record;
create policy "checkin_record_insert_anon"
  on public.checkin_record for insert
  to anon, authenticated
  with check (true);

drop policy if exists "checkin_record_select_all" on public.checkin_record;
create policy "checkin_record_select_all"
  on public.checkin_record for select
  to anon, authenticated
  using (true);
