import { getSupabaseClient } from './supabaseClient'

function unwrap(result) {
  const { data, error } = result || {}
  if (error) throw error
  return data
}

/**
 * 获取作品列表（信息流）
 * @param {Object} params
 * @param {number} params.page 1-based
 * @param {number} params.pageSize
 * @param {string} [params.region]
 * @param {boolean} [params.onlyPublic=true]
 */
export async function listPosts({ page = 1, pageSize = 10, region, onlyPublic = true } = {}) {
  const supabase = await getSupabaseClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('posts')
    .select(
      `
      id,
      user_id,
      content,
      translation,
      duration_seconds,
      region,
      mode,
      audio_path,
      is_public,
      created_at,
      profiles:profiles (
        id,
        nickname,
        avatar_url,
        region
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (onlyPublic) query = query.eq('is_public', true)
  if (region) query = query.eq('region', region)

  const res = await query
  return {
    items: unwrap(res) || [],
    count: res?.count ?? null
  }
}

export async function getPostById(postId) {
  const supabase = await getSupabaseClient()
  const res = await supabase
    .from('posts')
    .select(
      `
      *,
      profiles:profiles (id, nickname, avatar_url, region)
    `
    )
    .eq('id', postId)
    .maybeSingle()

  return unwrap(res)
}

/**
 * 创建作品（写 posts 表）
 * 注意：audio_path 建议先通过 storageService 上传后得到。
 */
export async function createPost({
  user_id,
  content,
  translation,
  duration_seconds,
  region,
  mode,
  audio_path,
  is_public = true
}) {
  const supabase = await getSupabaseClient()
  const res = await supabase
    .from('posts')
    .insert({
      user_id,
      content,
      translation: translation || null,
      duration_seconds,
      region: region || null,
      mode: mode || null,
      audio_path,
      is_public
    })
    .select('*')
    .single()

  return unwrap(res)
}

