import { getSupabase } from './supabase'

export interface AdminUserRow {
  id: string
  nickname: string
  handle: string
  avatar_url: string | null
  is_admin: boolean
  is_active: boolean
  created_at: string
}

export interface AdminPostRow {
  id: string
  author_id: string
  author_name: string
  author_handle: string
  region: string
  dialect_text: string
  cover_url: string | null
  audio_url: string | null
  video_url: string | null
  duration: number
  status: string
  created_at: string
}

export interface AdminDashboardStats {
  totalUsers: number
  newUsersToday: number
  newUsersWeek: number
  pendingPosts: number
  publishedPosts: number
  registrationTrend: { date: string; count: number }[]
}

function getClient() {
  const client = getSupabase()
  if (!client) throw new Error('Supabase 未配置')
  return client
}

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const client = getClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString()

  const [usersRes, todayRes, weekRes, pendingRes, publishedRes, trendRes] = await Promise.all([
    client.from('profiles').select('id', { count: 'exact', head: true }),
    client.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    client.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
    client.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    client.from('profiles').select('created_at').gte('created_at', new Date(now.getTime() - 14 * 86400000).toISOString()).order('created_at'),
  ])

  const trendMap = new Map<string, number>()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    trendMap.set(key, 0)
  }

  for (const row of trendRes.data ?? []) {
    const key = row.created_at.slice(0, 10)
    if (trendMap.has(key)) {
      trendMap.set(key, (trendMap.get(key) ?? 0) + 1)
    }
  }

  return {
    totalUsers: usersRes.count ?? 0,
    newUsersToday: todayRes.count ?? 0,
    newUsersWeek: weekRes.count ?? 0,
    pendingPosts: pendingRes.count ?? 0,
    publishedPosts: publishedRes.count ?? 0,
    registrationTrend: Array.from(trendMap.entries()).map(([date, count]) => ({ date, count })),
  }
}

export async function fetchUsers(limit = 50): Promise<AdminUserRow[]> {
  const client = getClient()
  const { data, error } = await client
    .from('profiles')
    .select('id, nickname, handle, avatar_url, is_admin, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

export async function setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('profiles')
    .update({ is_admin: isAdmin })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

export async function fetchModerationPosts(status = 'pending'): Promise<AdminPostRow[]> {
  const client = getClient()
  const { data: posts, error } = await client
    .from('posts')
    .select('id, author_id, region, dialect_text, cover_url, audio_url, video_url, duration, status, created_at')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  if (!posts?.length) return []

  const authorIds = [...new Set(posts.map(p => p.author_id))]
  const { data: profiles } = await client
    .from('profiles')
    .select('id, nickname, handle')
    .in('id', authorIds)

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return posts.map(row => {
    const profile = profileMap.get(row.author_id)
    return {
      id: row.id,
      author_id: row.author_id,
      author_name: profile?.nickname ?? '未知',
      author_handle: profile?.handle ?? '',
      region: row.region,
      dialect_text: row.dialect_text,
      cover_url: row.cover_url,
      audio_url: row.audio_url,
      video_url: row.video_url,
      duration: row.duration,
      status: row.status,
      created_at: row.created_at,
    }
  })
}

export async function updatePostStatus(
  postId: string,
  status: 'published' | 'rejected' | 'hidden',
): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('posts')
    .update({ status })
    .eq('id', postId)

  if (error) throw new Error(error.message)
}
