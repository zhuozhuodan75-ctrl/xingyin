import { allRegions } from '@/data/regions'
import { fetchUserBookmarkedPostIds, fetchUserLikedPostIds } from './socialApi'
import { getSupabase } from './supabase'
import { getAuthUserId } from './supabaseAuth'

export interface FeedPost {
  id: string
  author: string
  avatar: string
  region: string
  dialect: string
  translation: string
  image: string
  images?: string[]
  likes: number
  comments: number
  shares: number
  duration: number
  liked: boolean
  bookmarked: boolean
}

export interface FeedRegionPost {
  id: string
  author: string
  avatar: string
  region: string
  dialect: string
  translation: string
  image: string
  likes: number
  duration: number
}

export interface SubmitPostInput {
  region: string
  dialectText: string
  translation?: string
  coverUrl?: string
  imageUrls?: string[]
  audioUrl?: string
  videoUrl?: string
  duration?: number
}

export interface MyWorkItem {
  id: string
  region: string
  phrase: string
  image: string
  likes: number
  duration: number
  date: string
  status: string
}

interface FeedRow {
  id: string
  author_id: string
  author_name: string
  author_handle: string
  author_avatar: string | null
  region: string
  dialect_text: string
  translation: string | null
  cover_url: string | null
  image_urls: string[] | null
  audio_url: string | null
  video_url: string | null
  duration: number
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
}

const REGION_COVERS: Record<string, string> = {
  四川: '/images/cover_sichuan.jpg',
  上海: '/images/cover_shanghai.jpg',
  黑龙江: '/images/cover_dongbei.jpg',
  广东: '/images/cover_guangdong.jpg',
  湖南: '/images/cover_hunan.jpg',
  安徽: '/images/cover_sichuan.jpg',
  浙江: '/images/cover_shanghai.jpg',
  陕西: '/images/bg_wood.jpg',
}

/** 「四川·成都」→「四川」（对应 regions.short 外键） */
export function parseRegionShort(regionLabel: string): string {
  return regionLabel.split('·')[0].trim()
}

function formatRegionLabel(short: string): string {
  const found = allRegions.find(r => r.short === short)
  return found ? `${found.short}·${found.city}` : short
}

function defaultCover(regionShort: string): string {
  return REGION_COVERS[regionShort] ?? '/images/bg_xuanzhi.jpg'
}

function resolvePostImages(row: FeedRow): string[] {
  if (Array.isArray(row.image_urls) && row.image_urls.length > 0) {
    return row.image_urls
  }
  if (row.cover_url) return [row.cover_url]
  return [defaultCover(row.region)]
}

function mapFeedRowToPost(row: FeedRow, likedIds?: Set<string>, bookmarkedIds?: Set<string>): FeedPost {
  const regionLabel = formatRegionLabel(row.region)
  const images = resolvePostImages(row)
  return {
    id: row.id,
    author: row.author_name || '乡音旅人',
    avatar: row.author_avatar || '/images/avatar1.jpg',
    region: regionLabel,
    dialect: row.dialect_text,
    translation: row.translation || '（暂无翻译）',
    image: images[0],
    images,
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    shares: row.shares_count ?? 0,
    duration: row.duration ?? 0,
    liked: likedIds?.has(row.id) ?? false,
    bookmarked: bookmarkedIds?.has(row.id) ?? false,
  }
}

function mapFeedRowToRegionPost(row: FeedRow): FeedRegionPost {
  return {
    id: row.id,
    author: row.author_name || '乡音旅人',
    avatar: row.author_avatar || '/images/avatar1.jpg',
    region: formatRegionLabel(row.region),
    dialect: row.dialect_text,
    translation: row.translation || '（暂无翻译）',
    image: row.cover_url || defaultCover(row.region),
    likes: row.likes_count ?? 0,
    duration: row.duration ?? 0,
  }
}

/** 首页：已发布作品信息流 */
export async function fetchPublishedFeed(limit = 50): Promise<FeedPost[]> {
  const client = getSupabase()
  if (!client) return []

  const { data, error } = await client
    .from('posts_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('[posts] 拉取首页失败:', error.message)
    return []
  }

  const [likedIds, bookmarkedIds] = await Promise.all([
    fetchUserLikedPostIds(),
    fetchUserBookmarkedPostIds(),
  ])

  return (data as FeedRow[]).map(row => mapFeedRowToPost(row, likedIds, bookmarkedIds))
}

/** 地区详情页：某省已发布作品 */
export async function fetchRegionPosts(regionShort: string, limit = 20): Promise<FeedRegionPost[]> {
  const client = getSupabase()
  if (!client) return []

  const { data, error } = await client
    .from('posts_feed')
    .select('*')
    .eq('region', regionShort)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('[posts] 拉取地区作品失败:', error.message, { region: regionShort })
    return []
  }

  return (data as FeedRow[]).map(row => mapFeedRowToRegionPost(row))
}

/** 我的作品：含待审核 / 已发布 / 已拒绝 */
export async function fetchMyPosts(userId: string, limit = 50): Promise<MyWorkItem[]> {
  const client = getSupabase()
  if (!client) return []

  const { data, error } = await client
    .from('posts')
    .select('id, region, dialect_text, cover_url, duration, likes_count, status, created_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('[posts] 拉取我的作品失败:', error.message)
    return []
  }

  return (data ?? []).map(row => ({
    id: row.id,
    region: formatRegionLabel(row.region),
    phrase: row.dialect_text,
    image: row.cover_url || defaultCover(row.region),
    likes: row.likes_count ?? 0,
    duration: row.duration ?? 0,
    date: row.created_at.slice(0, 10),
    status: row.status,
  }))
}

/** 创作页提交作品，进入待审核队列 */
export async function submitPostForReview(input: SubmitPostInput): Promise<{ ok: boolean; message?: string }> {
  const client = getSupabase()
  if (!client) {
    return { ok: false, message: 'Supabase 未配置' }
  }

  const userId = await getAuthUserId()
  if (!userId) {
    return { ok: false, message: '请先登录后再发布作品' }
  }

  const regionShort = parseRegionShort(input.region)
  const dialectText = input.dialectText.trim()
  const imageUrls = input.imageUrls?.filter(Boolean) ?? []
  const hasMedia = imageUrls.length > 0 || input.audioUrl || input.videoUrl

  if (!dialectText && !hasMedia) {
    return { ok: false, message: '请写点文字，或添加图片/录音/视频' }
  }

  const coverUrl = imageUrls[0] ?? input.coverUrl ?? defaultCover(regionShort)

  const { error } = await client.from('posts').insert({
    author_id: userId,
    region: regionShort,
    dialect_text: dialectText || '[动态]',
    translation: input.translation?.trim() || null,
    cover_url: coverUrl,
    image_urls: imageUrls,
    audio_url: input.audioUrl ?? null,
    video_url: input.videoUrl && !input.videoUrl.startsWith('blob:') ? input.videoUrl : null,
    duration: input.duration ?? 0,
    status: 'pending',
  })

  if (error) {
    console.error('[posts] 提交失败:', error.message, { code: error.code })
    if (error.code === '23503') {
      return { ok: false, message: `地区「${regionShort}」未在数据库中，请联系管理员` }
    }
    return { ok: false, message: error.message }
  }

  console.log('[posts] 提交成功，等待审核:', { region: regionShort, user_id: userId })
  return { ok: true, message: '已提交审核，通过后将在首页展示' }
}
