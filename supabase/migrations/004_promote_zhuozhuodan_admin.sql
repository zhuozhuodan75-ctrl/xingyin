-- =============================================================================
-- 一次性执行：管理员字段 + 权限 + 将「桌卓单」设为管理员
-- 在 Supabase SQL Editor 整段复制执行
-- =============================================================================

-- ---------- 第一部分：必跑（添加字段 + 设管理员）----------

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

update public.profiles
set is_admin = true
where nickname = '桌卓单'
   or handle = 'user_252559ed';

-- 检查结果（is_admin 应为 true）
select nickname, handle, is_admin, is_active, created_at
from public.profiles
where nickname = '桌卓单' or handle = 'user_252559ed';


-- ---------- 第二部分：管理后台读写权限（有 posts 表时执行）----------
-- 若下面某行报错，可忽略后单独反馈

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select to authenticated
  using (public.is_admin_user());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.is_admin_user());

-- posts 表存在时才创建以下策略
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'posts'
  ) then
    alter type public.post_status add value if not exists 'pending';
    alter type public.post_status add value if not exists 'rejected';

    drop policy if exists "posts_admin_read" on public.posts;
    create policy "posts_admin_read" on public.posts
      for select to authenticated
      using (public.is_admin_user());

    drop policy if exists "posts_admin_update" on public.posts;
    create policy "posts_admin_update" on public.posts
      for update to authenticated
      using (public.is_admin_user());
  end if;
end $$;
