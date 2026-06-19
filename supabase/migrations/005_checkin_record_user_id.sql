-- checkin_record 增加 user_id，支持登录用户独立打卡 + 日历云端同步
-- 在 Supabase SQL Editor 执行

alter table public.checkin_record
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- 同一用户同一天只保留一条（未登录 user_id 为 null 的行不受此约束）
create unique index if not exists checkin_record_user_date_uidx
  on public.checkin_record (user_id, checkin_date)
  where user_id is not null;

-- 更新 RLS：已登录用户只能读写自己的记录；匿名仍可插入无 user_id 的行
alter table public.checkin_record enable row level security;

drop policy if exists "checkin_record_insert_anon" on public.checkin_record;
drop policy if exists "checkin_record_select_all" on public.checkin_record;
drop policy if exists "checkin_record_insert" on public.checkin_record;
drop policy if exists "checkin_record_select_own" on public.checkin_record;
drop policy if exists "checkin_record_select_anon" on public.checkin_record;
drop policy if exists "checkin_record_update_own" on public.checkin_record;

create policy "checkin_record_insert"
  on public.checkin_record for insert
  to anon, authenticated
  with check (
    user_id is null
    or auth.uid() = user_id
  );

create policy "checkin_record_select_own"
  on public.checkin_record for select
  to authenticated
  using (user_id is null or auth.uid() = user_id);

-- 开发阶段：匿名可读全部（便于调试）；上线后可改为仅 authenticated
create policy "checkin_record_select_anon"
  on public.checkin_record for select
  to anon
  using (true);

create policy "checkin_record_update_own"
  on public.checkin_record for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
