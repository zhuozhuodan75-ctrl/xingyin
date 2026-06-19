import { getSupabase } from './supabase'

/**
 * 获取可用于 RLS 写入的登录用户 ID。
 * 若内存会话过期，会尝试 refreshSession 后再读一次。
 */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.warn('[Supabase Auth] getSession 失败:', error.message)
  }
  if (session?.user?.id) return session.user.id

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
  if (!refreshError && refreshed.session?.user?.id) {
    return refreshed.session.user.id
  }
  if (refreshError) {
    console.warn('[Supabase Auth] refreshSession 失败:', refreshError.message)
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.warn('[Supabase Auth] getUser 失败:', userError.message)
    return null
  }

  return user?.id ?? null
}
