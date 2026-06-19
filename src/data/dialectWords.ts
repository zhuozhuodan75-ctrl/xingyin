export type { DialectWord, WordTier, ScriptForm } from './dialect/types'

import type { DialectWord } from './dialect/types'
import { provinceDialectPools } from './dialect/pools'

export interface Question {
  type: 'listen' | 'translate' | 'match' | 'fill' | 'speak'
  question: string
  options?: string[]
  correctAnswer: string
  hint?: string
}

export interface GameLevel {
  id: number
  title: string
  words: DialectWord[]
  questions: Question[]
}

/** 每个地区固定 10 关：1-3 词语 → 4-6 短语 → 7-10 句子 */
export const LEVELS_PER_REGION = 10

const SKILL_LABELS: Record<Question['type'], string> = {
  listen: '听',
  translate: '读',
  match: '配',
  fill: '写',
  speak: '说',
}

/** 题目中显示的方言形式：无汉字则用拼音 */
export function displayDialect(w: DialectWord): string {
  if (w.script === 'pinyin' || !/[\u4e00-\u9fff]/.test(w.dialect)) {
    return w.pinyin
  }
  return w.dialect
}

const cityAlias: Record<string, string> = {
  东北: '黑龙江',
  徽州: '安徽',
  皖南: '安徽',
  成都: '四川',
  黄浦: '上海',
  哈尔滨: '黑龙江',
  广州: '广东',
  长沙: '湖南',
  合肥: '安徽',
  安庆: '安徽',
  芜湖: '安徽',
  杭州: '浙江',
  宁波: '浙江',
  西安: '陕西',
  太原: '山西',
  南昌: '江西',
  福州: '福建',
  厦门: '福建',
  南京: '江苏',
  苏州: '江苏',
  凤凰: '湖南',
  渝中: '重庆',
  朝阳: '北京',
  南开: '天津',
  石家庄: '河北',
  济南: '山东',
  郑州: '河南',
  武汉: '湖北',
  南宁: '广西',
  贵阳: '贵州',
  海口: '海南',
  兰州: '甘肃',
  银川: '宁夏',
  西宁: '青海',
  乌鲁木齐: '新疆',
  拉萨: '西藏',
  昆明: '云南',
  台北: '台湾',
  中西区: '香港',
  花地玛: '澳门',
  呼和浩特: '内蒙古',
  长春: '吉林',
  沈阳: '辽宁',
}

export function resolveRegionKey(regionName: string): string {
  const key = regionName.trim()
  if (provinceDialectPools[key]) return key
  return cityAlias[key] ?? key
}

function tierForLevel(level: number): WordTier {
  if (level <= 3) return 'word'
  if (level <= 6) return 'phrase'
  return 'sentence'
}

function levelTitle(level: number): string {
  if (level <= 3) return `基础词 ${level}`
  if (level <= 6) return `常用短语 ${level - 3}`
  return `生活句子 ${level - 6}`
}

type WordTier = import('./dialect/types').WordTier

/** 全部 34 省独立词库（选项仅来自本省） */
export const regionWordMap: Record<string, DialectWord[]> = provinceDialectPools

export function getRegionWords(regionName: string): DialectWord[] {
  const key = resolveRegionKey(regionName)
  return provinceDialectPools[key] ?? provinceDialectPools['四川']
}

function pickLevelWords(words: DialectWord[], levelId: number): DialectWord[] {
  const tier = tierForLevel(levelId)
  const tierPool = words.filter(w => w.tier === tier)
  const pool = tierPool.length >= 5 ? tierPool : words
  const start = (levelId - 1) * 5
  const picked: DialectWord[] = []
  for (let i = 0; i < 5; i++) {
    picked.push(pool[(start + i) % pool.length])
  }
  return picked
}

function shuffleOptions(correct: string, pool: string[]): string[] {
  const wrong = [...new Set(pool.filter(p => p !== correct))]
  const shuffled = wrong.sort(() => Math.random() - 0.5).slice(0, 3)
  return [...shuffled, correct].sort(() => Math.random() - 0.5)
}

export function generateQuestions(regionName: string, levelId: number): Question[] {
  const key = resolveRegionKey(regionName)
  const words = getRegionWords(key)
  const levelWords = pickLevelWords(words, levelId)
  const meanings = words.map(w => w.meaning)
  const dialects = words.map(w => displayDialect(w))
  const title = levelTitle(levelId)

  const [w0, w1, w2, w3, w4] = levelWords

  return [
    {
      type: 'listen',
      question: `【${SKILL_LABELS.listen}·听力】${title} · ${key}话\n「${displayDialect(w0)}」是什么意思？\n拼音：${w0.pinyin}`,
      options: shuffleOptions(w0.meaning, meanings),
      correctAnswer: w0.meaning,
      hint: w0.example,
    },
    {
      type: 'translate',
      question: `【${SKILL_LABELS.translate}·阅读】${title} · ${key}话\n「${w1.meaning}」怎么说？`,
      options: shuffleOptions(displayDialect(w1), dialects),
      correctAnswer: displayDialect(w1),
      hint: `拼音：${w1.pinyin}`,
    },
    {
      type: 'match',
      question: `【${SKILL_LABELS.match}·配对】${title} · ${key}话\n「${displayDialect(w2)}」的意思是？`,
      options: shuffleOptions(w2.meaning, meanings),
      correctAnswer: w2.meaning,
      hint: w2.example,
    },
    {
      type: 'fill',
      question: `【${SKILL_LABELS.fill}·书写】${title} · ${key}话\n根据意思和拼音填写：\n意思：${w3.meaning}\n拼音：${w3.pinyin}`,
      options: shuffleOptions(displayDialect(w3), dialects),
      correctAnswer: displayDialect(w3),
      hint: w3.example,
    },
    {
      type: 'speak',
      question: `【${SKILL_LABELS.speak}·口语】${title} · ${key}话\n跟读并选出${key}方言表达：\n「${w4.example}」`,
      options: shuffleOptions(displayDialect(w4), dialects),
      correctAnswer: displayDialect(w4),
      hint: `拼音：${w4.pinyin}`,
    },
  ]
}

export function getTotalLevels(_regionName: string): number {
  return LEVELS_PER_REGION
}

export function getLevelLabel(levelId: number): string {
  return levelTitle(levelId)
}
