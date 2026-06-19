-- 管理员与内容审核
-- 在 Supabase SQL Editor 执行

-- 1. 扩展作品状态：待审核 / 已拒绝
alter type public.post_status add value if not exists 'pending';
alter type public.post_status add value if not exists 'rejected';

-- 2. 用户表增加管理员与启用状态
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

-- 新作品默认待审核
alter table public.posts alter column status set default 'pending';

-- 3. 判断当前登录用户是否为管理员
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

-- 4. 管理员 RLS 策略
drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
  for select to authenticated
  using (public.is_admin_user());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.is_admin_user());

drop policy if exists "posts_admin_read" on public.posts;
create policy "posts_admin_read" on public.posts
  for select to authenticated
  using (public.is_admin_user());

drop policy if exists "posts_admin_update" on public.posts;
create policy "posts_admin_update" on public.posts
  for update to authenticated
  using (public.is_admin_user());

-- 5. 将指定账号设为管理员（把邮箱改成你的管理员邮箱）
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'admin@xiangyin.com');
