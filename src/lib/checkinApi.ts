import {
  buildMonthCheckinDays,
  calculateStreak,
  getTodayParts,
  loadCheckinRecords,
  saveCheckinRecords,
  type CheckinRecord,
} from './checkin'
import { getSupabase } from './supabase'
import { getAuthUserId } from './supabaseAuth'

/** 同步写入官方 checkins 表（Supabase 后台可直接查看） */
async function saveCanonicalCheckin(
  userId: string,
  checkinDate: string,
  level: number,
  region?: string,
): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  const regionShort = (region || '安徽').split('·')[0].trim()
  const { error } = await supabase.from('checkins').upsert(
    {
      user_id: userId,
      checkin_date: checkinDate,
      region: regionShort,
      level,
      score: level * 20,
    },
    { onConflict: 'user_id,checkin_date' },
  )

  if (error) {
    console.warn('[打卡] checkins 表写入失败:', error.message)
  }
}

function normalizeDateKey(value: unknown): string {
  if (typeof value === 'string') return value.slice(0, 10)
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }
  return String(value).slice(0, 10)
}

function rowToRecord(row: { checkin_date: unknown; pass_level: number; region?: string | null }): CheckinRecord {
  const dateKey = normalizeDateKey(row.checkin_date)
  return {
    region: row.region || '闯关',
    level: row.pass_level,
    date: dateKey,
  }
}

/** 从 Supabase 拉取当前用户的打卡记录，转为 localStorage 格式 */
export async function fetchUserCheckins(userId: string): Promise<Record<string, CheckinRecord>> {
  const supabase = getSupabase()
  if (!supabase) return {}

  const { data, error } = await supabase
    .from('checkin_record')
    .select('checkin_date, pass_level')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false })

  if (error) {
    console.error('[打卡] 拉取失败:', error.message)
    return {}
  }

  const records: Record<string, CheckinRecord> = {}
  for (const row of data ?? []) {
    const record = rowToRecord(row)
    records[record.date] = record
  }
  return records
}

/** 合并本地与云端打卡，云端关卡数取较大值 */
export function mergeCheckinRecords(
  local: Record<string, CheckinRecord>,
  remote: Record<string, CheckinRecord>,
): Record<string, CheckinRecord> {
  const merged = { ...local }
  for (const [dateKey, remoteRecord] of Object.entries(remote)) {
    const existing = merged[dateKey]
    if (!existing || remoteRecord.level >= existing.level) {
      merged[dateKey] = {
        ...remoteRecord,
        region: existing?.region && existing.region !== '闯关' ? existing.region : remoteRecord.region,
      }
    }
  }
  return merged
}

/** 登录后同步云端打卡到本地与 App 状态 */
export async function syncCheckinsFromCloud(userId: string) {
  const remote = await fetchUserCheckins(userId)
  const local = loadCheckinRecords()
  const merged = mergeCheckinRecords(local, remote)
  saveCheckinRecords(merged)

  const { year, month } = getTodayParts()
  return {
    records: merged,
    checkinDays: buildMonthCheckinDays(year, month, merged),
    streakDays: calculateStreak(merged),
  }
}

/**
 * 闯关成功写入 Supabase checkin_record
 * 已登录时附带 user_id，同一天 upsert 更新关卡
 */
export async function saveLevelCheckIn(
  levelNum: number,
  userId?: string | null,
  _region?: string,
): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) {
    console.error('[打卡] 保存失败: Supabase 客户端未初始化，请检查 .env 配置')
    return false
  }

  // 优先用 Supabase 会话里的用户 ID（RLS 要求 auth.uid() = user_id）
  const sessionUserId = await getAuthUserId()
  const effectiveUserId = sessionUserId ?? userId ?? null
  if (userId && !sessionUserId) {
    console.warn(
      '[打卡] App 显示已登录，但 Supabase 会话已失效。请到「我的 → 设置」重新登录后再闯关，否则云端可能写不进去。',
    )
  }

  try {
    const now = new Date()
    const checkin_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const base: { checkin_date: string; pass_level: number; user_id?: string } = {
      checkin_date,
      pass_level: levelNum,
    }

    const attempts: Array<Record<string, unknown>> = effectiveUserId
      ? [{ ...base, user_id: effectiveUserId }]
      : [base]

    if (effectiveUserId) {
      // upsert → update → insert（兼容未跑迁移或 RLS 差异）
      const upsertResult = await supabase.from('checkin_record').upsert(
        { ...base, user_id: effectiveUserId },
        { onConflict: 'user_id,checkin_date' },
      )
      if (!upsertResult.error) {
        console.log('[打卡] 保存成功:', { checkin_date, pass_level: levelNum, user_id: effectiveUserId })
        await saveCanonicalCheckin(effectiveUserId, checkin_date, levelNum, _region)
        return true
      }

      const updateResult = await supabase
        .from('checkin_record')
        .update({ pass_level: levelNum })
        .eq('user_id', effectiveUserId)
        .eq('checkin_date', checkin_date)
      if (!updateResult.error) {
        console.log('[打卡] 更新成功:', { checkin_date, pass_level: levelNum, user_id: effectiveUserId })
        await saveCanonicalCheckin(effectiveUserId, checkin_date, levelNum, _region)
        return true
      }

      attempts.push(base)
    }

    for (const payload of attempts) {
      const { error } = await supabase.from('checkin_record').insert(payload)
      if (!error) {
        console.log('[打卡] 保存成功:', { checkin_date, pass_level: levelNum, user_id: effectiveUserId ?? null })
        if (effectiveUserId) {
          await saveCanonicalCheckin(effectiveUserId, checkin_date, levelNum, _region)
        }
        return true
      }
      console.warn('[打卡] 写入尝试失败:', error.message)
    }

    console.error('[打卡] 保存失败: 所有写入方式均未成功', {
      checkin_date,
      pass_level: levelNum,
      user_id: effectiveUserId ?? null,
    })
    return false
  } catch (err) {
    console.error('[打卡] 保存异常:', err)
    return false
  }
}
