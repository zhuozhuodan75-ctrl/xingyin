import { getSupabaseClient } from './supabaseClient'

function unwrap(result) {
  const { data, error } = result || {}
  if (error) throw error
  return data
}

/**
 * 按作品获取评论列表
 */
export async function listCommentsByPost(postId, { page = 1, pageSize = 20 } = {}) {
  const supabase = await getSupabaseClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const res = await supabase
    .from('comments')
    .select(
      `
      id,
      post_id,
      user_id,
      content,
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
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
    .range(from, to)

  return {
    items: unwrap(res) || [],
    count: res?.count ?? null
  }
}

/**
 * 新增评论
 */
export async function createComment({ post_id, user_id, content }) {
  const supabase = await getSupabaseClient()
  const res = await supabase
    .from('comments')
    .insert({
      post_id,
      user_id,
      content
    })
    .select('*')
    .single()

  return unwrap(res)
}

