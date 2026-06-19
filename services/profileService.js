import { getSupabaseClient } from './supabaseClient'

function unwrap(result) {
  const { data, error } = result || {}
  if (error) throw error
  return data
}

/**
 * 获取当前登录用户（auth.users）
 */
export async function getCurrentUser() {
  const supabase = await getSupabaseClient()
  const res = await supabase.auth.getUser()
  return unwrap(res)?.user || null
}

/**
 * 获取当前用户 profiles
 */
export async function getMyProfile() {
  const supabase = await getSupabaseClient()
  const user = await getCurrentUser()
  if (!user?.id) return null

  const res = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  return unwrap(res)
}

/**
 * upsert 用户 profiles（首次登录创建资料/后续更新）
 */
export async function upsertMyProfile({ nickname, avatar_url, region, bio } = {}) {
  const supabase = await getSupabaseClient()
  const user = await getCurrentUser()
  if (!user?.id) throw new Error('Not authenticated.')

  const res = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        nickname: nickname || '用户',
        avatar_url: avatar_url || null,
        region: region || null,
        bio: bio || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  return unwrap(res)
}

