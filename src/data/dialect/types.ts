export type WordTier = 'word' | 'phrase' | 'sentence'
export type ScriptForm = 'hanzi' | 'pinyin'

export interface DialectWord {
  dialect: string
  meaning: string
  pinyin: string
  example: string
  tier?: WordTier
  /** 无固定汉字时题目显示拼音 */
  script?: ScriptForm
}
