import type { Badge, CheckinDay, TreasureCard } from '../App'

export interface CheckinRecord {
  region: string
  level: number
  date: string
}

const STORAGE_KEY = 'xiangyin-checkins'

export function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getTodayParts() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
    dateKey: formatDateKey(now.getFullYear(), now.getMonth(), now.getDate()),
  }
}

export function loadCheckinRecords(): Record<string, CheckinRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveCheckinRecords(records: Record<string, CheckinRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function buildMonthCheckinDays(
  year: number,
  month: number,
  records: Record<string, CheckinRecord>,
): CheckinDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateKey = formatDateKey(year, month, day)
    const record = records[dateKey]
    return {
      day,
      checked: !!record,
      region: record?.region,
      level: record?.level,
    }
  })
}

/** 从今天（或昨天若今日未打卡）往前数连续打卡天数 */
export function calculateStreak(records: Record<string, CheckinRecord>): number {
  const { year, month, day, dateKey } = getTodayParts()
  let streak = 0
  let cursor = new Date(year, month, day)

  if (!records[dateKey]) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const key = formatDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
    if (!records[key]) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** 以某一天结尾的连续打卡天数（用于日历格子的里程碑图标） */
export function getStreakEndingOnDay(
  records: Record<string, CheckinRecord>,
  year: number,
  month: number,
  day: number,
): number {
  let streak = 0
  let cursor = new Date(year, month, day)
  while (true) {
    const key = formatDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())
    if (!records[key]) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export interface CheckinResult {
  success: boolean
  streak: number
  milestone: 3 | 7 | null
  firstCheckinToday: boolean
  newCard: TreasureCard | null
  newBadge: Badge | null
}

const regionCityMap: Record<string, string> = {
  四川: '成都', 上海: '黄浦', 黑龙江: '哈尔滨', 广东: '广州', 湖南: '长沙',
  北京: '朝阳', 陕西: '西安', 浙江: '杭州', 江苏: '南京', 福建: '厦门',
  湖北: '武汉', 山东: '济南', 河南: '郑州', 重庆: '渝中',
}

const regionPhraseMap: Record<string, string> = {
  四川: '巴适得板', 上海: '侬好呀', 黑龙江: '贼拉好', 广东: '饮咗茶未',
  湖南: '霸得蛮', 北京: '吃了吗您呐', 陕西: '嫽扎咧',
}

export function applyCheckin(
  region: string,
  level: number,
  existingCards: TreasureCard[],
  existingBadges: Badge[],
): CheckinResult & {
  records: Record<string, CheckinRecord>
  checkinDays: CheckinDay[]
  myCards: TreasureCard[]
  myBadges: Badge[]
} {
  const { year, month, dateKey } = getTodayParts()
  const records = loadCheckinRecords()
  const firstCheckinToday = !records[dateKey]

  records[dateKey] = { region, level, date: dateKey }
  saveCheckinRecords(records)

  const checkinDays = buildMonthCheckinDays(year, month, records)
  const streak = calculateStreak(records)

  let milestone: 3 | 7 | null = null
  let newCard: TreasureCard | null = null
  let newBadge: Badge | null = null

  if (firstCheckinToday && (streak === 3 || streak === 7)) {
    milestone = streak
  }

  if (milestone === 3) {
    const city = regionCityMap[region] || region
    newCard = {
      id: `c-${dateKey}`,
      region,
      city,
      phrase: regionPhraseMap[region] || '乡音',
      bgImage: '/images/card_template1.jpg',
      earnedDate: dateKey,
      consecutiveDays: 3,
    }
  }

  if (milestone === 7) {
    const city = regionCityMap[region] || region
    newBadge = {
      id: `b-${dateKey}`,
      region,
      city,
      name: `${region}方言达人`,
      icon: 'flame',
      earnedDate: dateKey,
      consecutiveDays: 7,
      color: '#E67E22',
    }
  }

  const myCards = newCard ? [...existingCards, newCard] : existingCards
  const myBadges = newBadge ? [...existingBadges, newBadge] : existingBadges

  return {
    success: true,
    streak,
    milestone,
    firstCheckinToday,
    newCard,
    newBadge,
    records,
    checkinDays,
    myCards,
    myBadges,
  }
}

export function initCheckinState() {
  const { year, month, day } = getTodayParts()
  const records = loadCheckinRecords()
  return {
    currentYear: year,
    currentMonth: month,
    today: day,
    checkinDays: buildMonthCheckinDays(year, month, records),
    streakDays: calculateStreak(records),
  }
}

/** 从 localStorage 刷新当月打卡日历与连续天数 */
export function refreshCheckinFromStorage() {
  const { year, month } = getTodayParts()
  const records = loadCheckinRecords()
  return {
    checkinDays: buildMonthCheckinDays(year, month, records),
    streakDays: calculateStreak(records),
  }
}

export function isTodayChecked(records?: Record<string, CheckinRecord>) {
  const { dateKey } = getTodayParts()
  const r = records ?? loadCheckinRecords()
  return !!r[dateKey]
}
