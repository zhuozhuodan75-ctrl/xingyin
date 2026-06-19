import { getSupabase } from './supabase'
import { getAuthUserId } from './supabaseAuth'

export interface CommentItem {
  id: string
  author: string
  avatar: string
  content: string
  time: string
}

export interface NotificationItem {
  id: string
  type: 'system' | 'comment' | 'like' | 'follow'
  title: string
  content: string
  time: string
  read: boolean
  avatar?: string
  actorId?: string
  postId?: string
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

export async function fetchUserLikedPostIds(): Promise<Set<string>> {
  const userId = await getAuthUserId()
  if (!userId) return new Set()
  const client = getSupabase()
  if (!client) return new Set()

  const { data, error } = await client
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId)

  if (error) {
    console.warn('[social] 拉取点赞失败:', error.message)
    return new Set()
  }
  return new Set((data ?? []).map(r => r.post_id as string))
}

export async function fetchUserBookmarkedPostIds(): Promise<Set<string>> {
  const userId = await getAuthUserId()
  if (!userId) return new Set()
  const client = getSupabase()
  if (!client) return new Set()

  const { data, error } = await client
    .from('post_bookmarks')
    .select('post_id')
    .eq('user_id', userId)

  if (error) {
    console.warn('[social] 拉取收藏失败:', error.message)
    return new Set()
  }
  return new Set((data ?? []).map(r => r.post_id as string))
}

export async function togglePostLikeApi(
  postId: string,
): Promise<{ liked: boolean; likesCount: number } | null> {
  const userId = await getAuthUserId()
  if (!userId) return null
  const client = getSupabase()
  if (!client) return null

  const { data: existing } = await client
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { error } = await client
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    if (error) {
      console.warn('[social] 取消点赞失败:', error.message)
      return null
    }
  } else {
    const { error } = await client
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
    if (error) {
      console.warn('[social] 点赞失败:', error.message)
      return null
    }

    const { data: post } = await client
      .from('posts')
      .select('author_id, dialect_text')
      .eq('id', postId)
      .maybeSingle()

    if (post?.author_id && post.author_id !== userId) {
      const { data: profile } = await client
        .from('profiles')
        .select('nickname')
        .eq('id', userId)
        .maybeSingle()

      const snippet = (post.dialect_text || '你的作品').slice(0, 40)
      await client.from('notifications').insert({
        user_id: post.author_id,
        type: 'like',
        title: `${profile?.nickname ?? '有人'} 赞了你`,
        content: `赞了你的作品：${snippet}`,
        actor_id: userId,
        post_id: postId,
      })
    }
  }

  const { data: postRow } = await client
    .from('posts')
    .select('likes_count')
    .eq('id', postId)
    .maybeSingle()

  return {
    liked: !existing,
    likesCount: postRow?.likes_count ?? 0,
  }
}

export async function togglePostBookmarkApi(postId: string): Promise<boolean | null> {
  const userId = await getAuthUserId()
  if (!userId) return null
  const client = getSupabase()
  if (!client) return null

  const { data: existing } = await client
    .from('post_bookmarks')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { error } = await client
      .from('post_bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    return error ? null : false
  }

  const { error } = await client
    .from('post_bookmarks')
    .insert({ post_id: postId, user_id: userId })
  return error ? null : true
}

export async function fetchComments(postId: string): Promise<CommentItem[]> {
  return fetchCommentsSafe(postId)
}

/** 拉取评论并附带作者资料 */
export async function fetchCommentsSafe(postId: string): Promise<CommentItem[]> {
  const client = getSupabase()
  if (!client) return []

  const { data, error } = await client
    .from('comments')
    .select('id, content, created_at, author_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error || !data?.length) {
    if (error) console.warn('[social] 拉取评论失败:', error.message)
    return []
  }

  const authorIds = [...new Set(data.map(r => r.author_id as string))]
  const { data: profiles } = await client
    .from('profiles')
    .select('id, nickname, avatar_url')
    .in('id', authorIds)

  const profileMap = new Map(
    (profiles ?? []).map(p => [p.id as string, p]),
  )

  return data.map(row => {
    const profile = profileMap.get(row.author_id as string)
    return {
      id: row.id as string,
      author: profile?.nickname ?? '乡音旅人',
      avatar: profile?.avatar_url || '/images/avatar1.jpg',
      content: row.content as string,
      time: formatRelativeTime(row.created_at as string),
    }
  })
}

export async function createComment(
  postId: string,
  content: string,
): Promise<{ ok: boolean; message?: string }> {
  const userId = await getAuthUserId()
  if (!userId) return { ok: false, message: '请先登录' }
  const client = getSupabase()
  if (!client) return { ok: false, message: '服务未连接' }

  const trimmed = content.trim()
  if (!trimmed) return { ok: false, message: '评论不能为空' }

  const { error } = await client.from('comments').insert({
    post_id: postId,
    author_id: userId,
    content: trimmed,
  })

  if (error) {
    console.warn('[social] 发表评论失败:', error.message)
    return { ok: false, message: error.message }
  }

  const { data: post } = await client
    .from('posts')
    .select('author_id, dialect_text')
    .eq('id', postId)
    .maybeSingle()

  if (post?.author_id && post.author_id !== userId) {
    const { data: profile } = await client
      .from('profiles')
      .select('nickname')
      .eq('id', userId)
      .maybeSingle()

    await client.from('notifications').insert({
      user_id: post.author_id,
      type: 'comment',
      title: `${profile?.nickname ?? '有人'} 评论了你`,
      content: trimmed.slice(0, 80),
      actor_id: userId,
      post_id: postId,
    })
  }

  return { ok: true }
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const userId = await getAuthUserId()
  if (!userId) return []
  const client = getSupabase()
  if (!client) return []

  const { data, error } = await client
    .from('notifications')
    .select('id, type, title, content, is_read, created_at, actor_id, post_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.warn('[social] 拉取消息失败:', error.message)
    return []
  }

  const actorIds = [...new Set(
    (data ?? []).map(r => r.actor_id).filter(Boolean) as string[],
  )]

  let avatarMap = new Map<string, string>()
  if (actorIds.length > 0) {
    const { data: profiles } = await client
      .from('profiles')
      .select('id, avatar_url')
      .in('id', actorIds)
    avatarMap = new Map(
      (profiles ?? []).map(p => [p.id as string, (p.avatar_url as string) || '/images/avatar1.jpg']),
    )
  }

  return (data ?? []).map(row => ({
    id: row.id as string,
    type: row.type as NotificationItem['type'],
    title: row.title as string,
    content: row.content as string,
    time: formatRelativeTime(row.created_at as string),
    read: Boolean(row.is_read),
    avatar: row.actor_id ? avatarMap.get(row.actor_id as string) : undefined,
    actorId: row.actor_id as string | undefined,
    postId: row.post_id as string | undefined,
  }))
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const userId = await getAuthUserId()
  if (!userId) return
  const client = getSupabase()
  if (!client) return

  await client
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
}
