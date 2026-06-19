-- 作品支持多图（朋友圈滑动查看）
alter table public.posts
  add column if not exists image_urls text[] not null default '{}';

-- 不能在中间插入列：CREATE OR REPLACE 会报 42P16
-- 先删视图再重建（posts_feed 无依赖策略，可安全重建）
drop view if exists public.posts_feed;

create view public.posts_feed as
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
  p.image_urls,
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
