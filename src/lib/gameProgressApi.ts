import { resolveRegionKey } from '@/data/dialectWords'
import { getSupabase } from './supabase'
import { getAuthUserId } from './supabaseAuth'

export interface SaveGameProgressInput {
  region: string
  completedLevels: number[]
  unlockedLevel: number
  bestScore: number
}

export interface GameProgressRecord {
  region: string
  unlockedLevel: number
  completedLevels: number[]
  bestScore: number
}

function normalizeRegion(region: string): string {
  return resolveRegionKey(region.trim())
}

/** 读取当前用户在某省的闯关进度 */
export async function fetchGameProgress(region: string): Promise<GameProgressRecord | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const userId = await getAuthUserId()
  if (!userId) return null

  const regionKey = normalizeRegion(region)

  const { data, error } = await supabase
    .from('game_progress')
    .select('region, unlocked_level, completed_levels, best_score')
    .eq('user_id', userId)
    .eq('region', regionKey)
    .maybeSingle()

  if (error) {
    console.warn('[闯关进度] 拉取失败:', error.message, { region: regionKey, user_id: userId })
    return null
  }

  if (!data) return null

  return {
    region: data.region,
    unlockedLevel: data.unlocked_level,
    completedLevels: Array.isArray(data.completed_levels) ? data.completed_levels : [],
    bestScore: data.best_score,
  }
}

/** 闯关进度写入 game_progress 表 */
export async function saveGameProgress(input: SaveGameProgressInput): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error('[闯关进度] 保存失败: Supabase 未初始化')
    return false
  }

  const userId = await getAuthUserId()
  if (!userId) {
    console.warn('[闯关进度] 未登录或会话已过期，跳过云端保存。请到「我的 → 设置」登录后再闯关。')
    return false
  }

  const regionKey = normalizeRegion(input.region)
  const completed = [...new Set(input.completedLevels)].sort((a, b) => a - b)
  const unlockedLevel = Math.max(1, input.unlockedLevel)
  const bestScore = Math.max(0, input.bestScore)

  const payload = {
    user_id: userId,
    region: regionKey,
    unlocked_level: unlockedLevel,
    completed_levels: completed,
    best_score: bestScore,
  }

  try {
    const upsertResult = await supabase
      .from('game_progress')
      .upsert(payload, { onConflict: 'user_id,region' })
      .select('user_id, region, unlocked_level')
      .maybeSingle()

    if (!upsertResult.error && upsertResult.data) {
      console.log('[闯关进度] 保存成功:', upsertResult.data)
      return true
    }

    if (upsertResult.error) {
      console.warn('[闯关进度] upsert 失败，尝试 update/insert:', upsertResult.error.message)
    }

    const updateResult = await supabase
      .from('game_progress')
      .update({
        unlocked_level: unlockedLevel,
        completed_levels: completed,
        best_score: bestScore,
      })
      .eq('user_id', userId)
      .eq('region', regionKey)
      .select('user_id, region, unlocked_level')
      .maybeSingle()

    if (!updateResult.error && updateResult.data) {
      console.log('[闯关进度] 更新成功:', updateResult.data)
      return true
    }

    const insertResult = await supabase
      .from('game_progress')
      .insert(payload)
      .select('user_id, region, unlocked_level')
      .maybeSingle()

    if (!insertResult.error && insertResult.data) {
      console.log('[闯关进度] 插入成功:', insertResult.data)
      return true
    }

    const finalError = insertResult.error ?? updateResult.error ?? upsertResult.error
    console.error('[闯关进度] 保存失败:', {
      message: finalError?.message,
      code: finalError?.code,
      details: finalError?.details,
      hint: finalError?.hint,
      region: regionKey,
      user_id: userId,
    })

    if (finalError?.code === '23503') {
      console.error(
        '[闯关进度] 外键错误：请确认 regions 表有「' +
          regionKey +
          '」，且 profiles 表有你的用户资料（重新登录可自动创建）。',
      )
    }

    return false
  } catch (err) {
    console.error('[闯关进度] 保存异常:', err)
    return false
  }
}
