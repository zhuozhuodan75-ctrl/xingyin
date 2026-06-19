import type { DialectWord } from '../types'
import { anhuiWords } from './anhui'
import { aomenWords } from './aomen'
import { beijingWords } from './beijing'
import { chongqingWords } from './chongqing'
import { fujianWords } from './fujian'
import { gansuWords } from './gansu'
import { guangdongWords } from './guangdong'
import { guangxiWords } from './guangxi'
import { guizhouWords } from './guizhou'
import { hainanWords } from './hainan'
import { hebeiWords } from './hebei'
import { henanWords } from './henan'
import { heilongjiangWords } from './heilongjiang'
import { hubeiWords } from './hubei'
import { hunanWords } from './hunan'
import { jilinWords } from './jilin'
import { jiangsuWords } from './jiangsu'
import { jiangxiWords } from './jiangxi'
import { liaoningWords } from './liaoning'
import { neimengguWords } from './neimenggu'
import { ningxiaWords } from './ningxia'
import { qinghaiWords } from './qinghai'
import { shandongWords } from './shandong'
import { shanxiWords } from './shanxi'
import { shaanxiWords } from './shaanxi'
import { shanghaiWords } from './shanghai'
import { sichuanWords } from './sichuan'
import { taiwanWords } from './taiwan'
import { tianjinWords } from './tianjin'
import { xibetWords } from './xibet'
import { xinjiangWords } from './xinjiang'
import { yunnanWords } from './yunnan'
import { zhejiangWords } from './zhejiang'
import { hongkongWords } from './hongkong'

export const provinceDialectPools: Record<string, DialectWord[]> = {
  安徽: anhuiWords,
  北京: beijingWords,
  重庆: chongqingWords,
  福建: fujianWords,
  甘肃: gansuWords,
  广东: guangdongWords,
  广西: guangxiWords,
  贵州: guizhouWords,
  海南: hainanWords,
  河北: hebeiWords,
  河南: henanWords,
  黑龙江: heilongjiangWords,
  湖北: hubeiWords,
  湖南: hunanWords,
  吉林: jilinWords,
  江苏: jiangsuWords,
  江西: jiangxiWords,
  辽宁: liaoningWords,
  内蒙古: neimengguWords,
  宁夏: ningxiaWords,
  青海: qinghaiWords,
  山东: shandongWords,
  山西: shanxiWords,
  陕西: shaanxiWords,
  上海: shanghaiWords,
  四川: sichuanWords,
  天津: tianjinWords,
  西藏: xibetWords,
  新疆: xinjiangWords,
  云南: yunnanWords,
  浙江: zhejiangWords,
  台湾: taiwanWords,
  香港: hongkongWords,
  澳门: aomenWords,
}
