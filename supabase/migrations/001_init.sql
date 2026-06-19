-- =============================================================================
-- 乡音 (Xiangyin) · Supabase 初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中整段执行
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. 扩展
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. 枚举类型
-- -----------------------------------------------------------------------------
create type public.notification_type as enum ('system', 'comment', 'like', 'follow');
create type public.post_status as enum ('draft', 'published', 'hidden');

-- -----------------------------------------------------------------------------
-- 2. 通用函数
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 新用户注册时自动创建 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, handle, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', '乡音旅人'),
    coalesce(
      new.raw_user_meta_data ->> 'handle',
      'user_' || left(replace(new.id::text, '-', ''), 8)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '/images/avatar1.jpg')
  );
  return new;
end;
$$;

-- 点赞/取消点赞时更新作品计数
create or replace function public.sync_post_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  end if;
  return coalesce(new, old);
end;
$$;

-- 评论增删时更新作品计数
create or replace function public.sync_post_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  end if;
  return coalesce(new, old);
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. 地区元数据（公开只读，对应 src/data/regions.ts）
-- -----------------------------------------------------------------------------
create table public.regions (
  short text primary key,
  full_name text not null,
  city text not null,
  phrase text not null,
  post_count integer not null default 0,
  color text not null default '#C8D8B8',
  landmark text,
  map_x numeric(6,2),
  map_y numeric(6,2),
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. 用户资料（关联 auth.users）
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '乡音旅人',
  handle text not null unique,
  avatar_url text,
  bio text default '记录乡音，留住文化的根',
  level integer not null default 1 check (level >= 1),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_handle_idx on public.profiles (handle);
create index profiles_nickname_idx on public.profiles using gin (to_tsvector('simple', nickname));

-- -----------------------------------------------------------------------------
-- 5. 方言作品
-- -----------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  region text not null,
  dialect_text text not null,
  translation text,
  cover_url text,
  audio_url text,
  video_url text,
  duration integer not null default 0 check (duration >= 0),
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  shares_count integer not null default 0 check (shares_count >= 0),
  status public.post_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_author_id_idx on public.posts (author_id);
create index posts_created_at_idx on public.posts (created_at desc);
create index posts_region_idx on public.posts (region);
create index posts_status_idx on public.posts (status);

-- -----------------------------------------------------------------------------
-- 6. 互动：点赞 / 收藏 / 评论 / 关注
-- -----------------------------------------------------------------------------
create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.post_bookmarks (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id, created_at desc);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_id_idx on public.follows (following_id);

-- -----------------------------------------------------------------------------
-- 7. 消息通知
-- -----------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  content text not null,
  actor_id uuid references public.profiles (id) on delete set null,
  post_id uuid references public.posts (id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where (is_read = false);

-- -----------------------------------------------------------------------------
-- 8. 打卡（闯关成功 → 当天一条，对应 src/lib/checkin.ts）
-- -----------------------------------------------------------------------------
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  checkin_date date not null,
  region text not null references public.regions (short),
  level integer not null default 1 check (level >= 1),
  score integer not null default 0 check (score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create index checkins_user_date_idx on public.checkins (user_id, checkin_date desc);

-- -----------------------------------------------------------------------------
-- 9. 方言闯关进度
-- -----------------------------------------------------------------------------
create table public.game_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  region text not null references public.regions (short),
  unlocked_level integer not null default 1 check (unlocked_level >= 1),
  completed_levels integer[] not null default '{}',
  best_score integer not null default 0 check (best_score >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, region)
);

-- -----------------------------------------------------------------------------
-- 10. 游戏化资产：宝藏卡 / 徽章
-- -----------------------------------------------------------------------------
create table public.treasure_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  region text not null references public.regions (short),
  city text not null,
  phrase text not null,
  bg_url text,
  earned_date date not null,
  consecutive_days integer not null default 3 check (consecutive_days > 0),
  created_at timestamptz not null default now()
);

create index treasure_cards_user_id_idx on public.treasure_cards (user_id, earned_date desc);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  region text not null references public.regions (short),
  city text not null,
  name text not null,
  icon text not null default 'flame',
  color text not null default '#E67E22',
  earned_date date not null,
  consecutive_days integer not null default 7 check (consecutive_days > 0),
  created_at timestamptz not null default now()
);

create index badges_user_id_idx on public.badges (user_id, earned_date desc);

-- -----------------------------------------------------------------------------
-- 11. 方言百科（种子数据 + 后续 CMS 扩展）
-- -----------------------------------------------------------------------------
create table public.wiki_articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  category text not null,
  color text not null default '#2D5016',
  content text not null,
  read_time text not null default '3分钟',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wiki_bookmarks (
  user_id uuid not null references public.profiles (id) on delete cascade,
  article_id uuid not null references public.wiki_articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- -----------------------------------------------------------------------------
-- 12. 用户设置（通知 / 隐私，对应 Settings 页）
-- -----------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  push_enabled boolean not null default true,
  checkin_reminder boolean not null default true,
  comment_notify boolean not null default true,
  like_notify boolean not null default false,
  location_enabled boolean not null default false,
  mic_enabled boolean not null default true,
  dark_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 13. 触发器
-- -----------------------------------------------------------------------------
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

create trigger checkins_updated_at
  before update on public.checkins
  for each row execute function public.set_updated_at();

create trigger game_progress_updated_at
  before update on public.game_progress
  for each row execute function public.set_updated_at();

create trigger wiki_articles_updated_at
  before update on public.wiki_articles
  for each row execute function public.set_updated_at();

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger post_likes_count_sync
  after insert or delete on public.post_likes
  for each row execute function public.sync_post_likes_count();

create trigger post_comments_count_sync
  after insert or delete on public.comments
  for each row execute function public.sync_post_comments_count();

-- 新用户默认设置
create or replace function public.handle_new_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_profile_created_settings
  after insert on public.profiles
  for each row execute function public.handle_new_user_settings();

-- -----------------------------------------------------------------------------
-- 14. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.regions enable row level security;
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_bookmarks enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.checkins enable row level security;
alter table public.game_progress enable row level security;
alter table public.treasure_cards enable row level security;
alter table public.badges enable row level security;
alter table public.wiki_articles enable row level security;
alter table public.wiki_bookmarks enable row level security;
alter table public.user_settings enable row level security;

-- regions / wiki：公开只读
create policy "regions_public_read" on public.regions
  for select using (true);

create policy "wiki_public_read" on public.wiki_articles
  for select using (is_published = true);

-- profiles：公开可读，本人可改
create policy "profiles_public_read" on public.profiles
  for select using (is_public = true or auth.uid() = id);

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

-- posts：已发布公开可读，作者可写
create policy "posts_public_read" on public.posts
  for select using (status = 'published' or auth.uid() = author_id);

create policy "posts_author_insert" on public.posts
  for insert with check (auth.uid() = author_id);

create policy "posts_author_update" on public.posts
  for update using (auth.uid() = author_id);

create policy "posts_author_delete" on public.posts
  for delete using (auth.uid() = author_id);

-- post_likes
create policy "likes_public_read" on public.post_likes
  for select using (true);

create policy "likes_self_insert" on public.post_likes
  for insert with check (auth.uid() = user_id);

create policy "likes_self_delete" on public.post_likes
  for delete using (auth.uid() = user_id);

-- post_bookmarks
create policy "bookmarks_self_all" on public.post_bookmarks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- comments
create policy "comments_public_read" on public.comments
  for select using (true);

create policy "comments_author_insert" on public.comments
  for insert with check (auth.uid() = author_id);

create policy "comments_author_update" on public.comments
  for update using (auth.uid() = author_id);

create policy "comments_author_delete" on public.comments
  for delete using (auth.uid() = author_id);

-- follows
create policy "follows_public_read" on public.follows
  for select using (true);

create policy "follows_self_insert" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "follows_self_delete" on public.follows
  for delete using (auth.uid() = follower_id);

-- notifications：仅本人
create policy "notifications_self_read" on public.notifications
  for select using (auth.uid() = user_id);

create policy "notifications_self_update" on public.notifications
  for update using (auth.uid() = user_id);

-- checkins / game_progress / cards / badges：仅本人
create policy "checkins_self_all" on public.checkins
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "game_progress_self_all" on public.game_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "treasure_cards_self_all" on public.treasure_cards
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "badges_self_all" on public.badges
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "wiki_bookmarks_self_all" on public.wiki_bookmarks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings_self_all" on public.user_settings
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 15. Storage 桶（头像 / 媒体 / 宝藏卡）
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('media', 'media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/webm', 'video/mp4', 'video/webm']),
  ('cards', 'cards', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Storage RLS：公开读，登录用户写自己的目录
create policy "storage_avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "storage_avatars_auth_write"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_avatars_auth_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_avatars_auth_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "storage_media_auth_write"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage_media_auth_update"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_media_auth_delete"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage_cards_public_read"
  on storage.objects for select
  using (bucket_id = 'cards');

create policy "storage_cards_auth_write"
  on storage.objects for insert
  with check (
    bucket_id = 'cards'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- 16. 种子数据：34 省 + 百科文章
-- -----------------------------------------------------------------------------

insert into public.regions (short, full_name, city, phrase, post_count, color, landmark, map_x, map_y) values
  ('安徽', '安徽省', '合肥', '搞哄个', 8230, '#D8E8C8', '🌲', 555, 265),
  ('北京', '北京市', '朝阳', '吃了吗您呐', 12450, '#F0B8B0', '🦆', 550, 170),
  ('重庆', '重庆市', '渝中', '要得！走起！', 15680, '#D8E8D0', '🌶️', 415, 295),
  ('福建', '福建省', '厦门', '哇塞', 6720, '#F0D8C8', '🫖', 560, 335),
  ('甘肃', '甘肃省', '兰州', '攒劲得很', 3450, '#F0D8A8', '🐫', 370, 200),
  ('广东', '广东省', '广州', '饮咗茶未', 18920, '#F0C8C0', '🍵', 510, 370),
  ('广西', '广西壮族自治区', '南宁', '得喔', 5340, '#D8E8C8', '🏞️', 430, 380),
  ('贵州', '贵州省', '贵阳', '安逸惨喽', 7890, '#C8D8D8', '🌊', 400, 340),
  ('海南', '海南省', '海口', '鲁吼', 4120, '#F0E8C0', '🥥', 490, 440),
  ('河北', '河北省', '石家庄', '中咧', 5670, '#F0D8B8', '🏔️', 545, 198),
  ('河南', '河南省', '郑州', '中不中', 9340, '#F0D8D0', '🍲', 505, 245),
  ('黑龙江', '黑龙江省', '哈尔滨', '贼拉好', 11230, '#C8B8D8', '🧊', 620, 100),
  ('湖北', '湖北省', '武汉', '蛮扎实', 10120, '#C8E0C8', '🍜', 480, 280),
  ('湖南', '湖南省', '长沙', '霸得蛮', 13450, '#F0E0B8', '🌶️', 470, 320),
  ('吉林', '吉林省', '长春', '嘎嘎香', 6780, '#B8C8E0', '🦌', 620, 145),
  ('江苏', '江苏省', '南京', '多大事啊', 11890, '#F0D8D8', '🌸', 580, 245),
  ('江西', '江西省', '南昌', '恰噶', 5230, '#C8D8E8', '🍊', 525, 315),
  ('辽宁', '辽宁省', '沈阳', '得劲儿', 8940, '#F0C8C8', '🦐', 590, 175),
  ('内蒙古', '内蒙古自治区', '呼和浩特', '赛白努', 3670, '#C8D8B8', '🐴', 480, 135),
  ('宁夏', '宁夏回族自治区', '银川', '沃耶', 2340, '#D8E8C8', '🍇', 420, 215),
  ('青海', '青海省', '西宁', '阿门了', 1890, '#C8D8E8', '🐟', 340, 235),
  ('山东', '山东省', '济南', '俺寻思着', 10560, '#F0E8C8', '🍺', 560, 215),
  ('山西', '山西省', '太原', '沾不沾', 4780, '#E8D8B8', '🍜', 510, 200),
  ('陕西', '陕西省', '西安', '嫽扎咧', 7230, '#E8C8A8', '🗿', 460, 225),
  ('上海', '上海市', '黄浦', '侬好', 14560, '#F0C8D0', '🥟', 605, 260),
  ('四川', '四川省', '成都', '巴适得板', 22340, '#C8E0C0', '🐼', 380, 300),
  ('天津', '天津市', '南开', '介是嘛', 5890, '#E8D8C8', '🥞', 565, 182),
  ('西藏', '西藏自治区', '拉萨', '扎西德勒', 2120, '#D8C8E0', '🏔️', 230, 310),
  ('新疆', '新疆维吾尔自治区', '乌鲁木齐', '亚克西', 3450, '#F0D8A0', '🍈', 200, 155),
  ('云南', '云南省', '昆明', '给是要得', 8670, '#D8C8D8', '🦚', 320, 360),
  ('浙江', '浙江省', '杭州', '蛮好个', 9780, '#C8E0E0', '🍵', 590, 295),
  ('台湾', '台湾省', '台北', '很棒的啦', 7340, '#C8E8C8', '🧋', 620, 370),
  ('香港', '香港特别行政区', '中西区', '係咁先', 5670, '#F0D0D0', '🥮', 555, 400),
  ('澳门', '澳门特别行政区', '花地玛', '唔该晒', 2890, '#F0D8D0', '🥧', 540, 405)
on conflict (short) do nothing;

insert into public.wiki_articles (slug, title, category, color, content, read_time, sort_order) values
  (
    'why-sichuan-dialect-funny',
    '为什么四川话这么幽默？',
    '方言趣谈',
    '#2D5016',
    '四川话的幽默感源于其独特的声调系统和丰富的俚语。四川话有20个声母、36个韵母、4个声调，相比普通话更加抑扬顿挫。加之巴蜀文化特有的乐观精神，让四川话充满了生活气息和幽默元素。',
    '3分钟',
    1
  ),
  (
    'cantonese-nine-tones',
    '粤语九声六调的奥秘',
    '语音知识',
    '#8B2635',
    '粤语保留了古汉语的九声六调系统，是研究古汉语语音的宝贵材料。平、上、去、入四声各分阴阳，再加上一个中平调，构成了粤语音韵的丰富层次。',
    '5分钟',
    2
  ),
  (
    'northeast-dialect-intro',
    '东北话：最简单的方言',
    '方言入门',
    '#E67E22',
    '东北话接近普通话，是最容易听懂的方言之一。其特点是声调简化、儿化音多、词汇直白有力。从赵本山的小品到东北人的日常交流，东北话以其独特的感染力征服了全国。',
    '4分钟',
    3
  ),
  (
    'shanghai-wu-dialect',
    '上海话中的吴侬软语',
    '文化故事',
    '#2D5016',
    '上海话属于吴语太湖片苏沪嘉小片，继承了吴侬软语的柔美特质。连续的变调、细碎的语气词，让上海话听起来如同音乐般流畅。随着时代变迁，上海话正面临传承的挑战。',
    '6分钟',
    4
  ),
  (
    'minnan-living-fossil',
    '闽南语：古汉语的活化石',
    '历史溯源',
    '#8B2635',
    '闽南语保留了大量上古汉语和中古汉语的特征，被称为"古汉语的活化石"。其语音系统中有全浊声母、入声韵尾等古汉语特征，是语言学家研究汉语演变的珍贵材料。',
    '7分钟',
    5
  )
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- 17. 常用查询视图（可选，方便前端联表）
-- -----------------------------------------------------------------------------
create or replace view public.posts_feed as
select
  p.id,
  p.author_id,
  pr.nickname as author_name,
  pr.handle as author_handle,
  pr.avatar_url as author_avatar,
  p.region,
  p.dialect_text,
  p.translation,
  p.cover_url,
  p.audio_url,
  p.video_url,
  p.duration,
  p.likes_count,
  p.comments_count,
  p.shares_count,
  p.created_at
from public.posts p
join public.profiles pr on pr.id = p.author_id
where p.status = 'published';

-- =============================================================================
-- 执行完成后检查：
--   select count(*) from public.regions;        -- 应为 34
--   select count(*) from public.wiki_articles;  -- 应为 5
-- =============================================================================
