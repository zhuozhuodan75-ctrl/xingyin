-- 私信对话 + 互动通知写入权限

-- 允许登录用户以 actor 身份创建通知（点赞、评论等）
drop policy if exists "notifications_actor_insert" on public.notifications;
create policy "notifications_actor_insert" on public.notifications
  for insert with check (auth.uid() = actor_id);

-- 私信：会话 / 成员 / 消息
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists direct_messages_conversation_idx
  on public.direct_messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.direct_messages enable row level security;

drop policy if exists "conv_members_read" on public.conversation_members;
create policy "conv_members_read" on public.conversation_members
  for select using (auth.uid() = user_id);

drop policy if exists "conv_members_insert" on public.conversation_members;
create policy "conv_members_insert" on public.conversation_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "conv_read" on public.conversations;
create policy "conv_read" on public.conversations
  for select using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists "conv_insert" on public.conversations;
create policy "conv_insert" on public.conversations
  for insert with check (auth.uid() is not null);

drop policy if exists "conv_update" on public.conversations;
create policy "conv_update" on public.conversations
  for update using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = id and m.user_id = auth.uid()
    )
  );

drop policy if exists "dm_read" on public.direct_messages;
create policy "dm_read" on public.direct_messages
  for select using (
    exists (
      select 1 from public.conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "dm_insert" on public.direct_messages;
create policy "dm_insert" on public.direct_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_members m
      where m.conversation_id = conversation_id and m.user_id = auth.uid()
    )
  );

-- 获取或创建两人私信会话
create or replace function public.get_or_create_dm_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  conv_id uuid;
  me uuid := auth.uid();
begin
  if me is null or other_user_id is null or me = other_user_id then
    raise exception 'invalid users';
  end if;

  select cm1.conversation_id into conv_id
  from public.conversation_members cm1
  join public.conversation_members cm2 on cm1.conversation_id = cm2.conversation_id
  where cm1.user_id = me and cm2.user_id = other_user_id
  limit 1;

  if conv_id is not null then
    return conv_id;
  end if;

  insert into public.conversations default values returning id into conv_id;
  insert into public.conversation_members (conversation_id, user_id)
  values (conv_id, me), (conv_id, other_user_id);

  return conv_id;
end;
$$;

grant execute on function public.get_or_create_dm_conversation(uuid) to authenticated;
