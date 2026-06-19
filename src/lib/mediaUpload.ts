import { getSupabase } from './supabase'
import { getAuthUserId } from './supabaseAuth'

/** 上传创作媒体到 Supabase Storage media 桶 */
export async function uploadMediaFile(
  file: File,
  kind: 'images' | 'audio' | 'video',
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const userId = await getAuthUserId()
  if (!userId) return null

  const ext = file.name.split('.').pop() || 'bin'
  const path = `${userId}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    console.warn('[media] 上传失败:', error.message, { path })
    return null
  }

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadMediaFiles(
  files: File[],
  kind: 'images' | 'audio' | 'video',
): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    const url = await uploadMediaFile(file, kind)
    if (url) urls.push(url)
  }
  return urls
}

const AVATAR_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp'])

/** 上传用户头像到 avatars 桶，路径固定为 {userId}/avatar.{ext} */
export async function uploadAvatarFile(file: File): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const userId = await getAuthUserId()
  if (!userId) return null

  if (!file.type.startsWith('image/')) {
    console.warn('[avatar] 仅支持图片文件')
    return null
  }

  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const ext = AVATAR_EXTS.has(rawExt) ? rawExt : 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (error) {
    console.warn('[avatar] 上传失败:', error.message, { path })
    return null
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return `${data.publicUrl}?v=${Date.now()}`
}
