// Province watercolor colors (matching reference map style) - ALL 34 provinces
export const provinceColorMap: Record<string, string> = {
  '黑龙江': '#C8B8D8', '吉林': '#B8C8E0', '辽宁': '#F0C8C8',
  '内蒙古': '#C8D8B8', '北京': '#F0B8B0', '天津': '#E8D8C8',
  '河北': '#F0D8B8', '山西': '#E8D8B8', '陕西': '#E8C8A8',
  '甘肃': '#F0D8A8', '宁夏': '#D8E8C8', '青海': '#C8D8E8',
  '新疆': '#F0D8A0', '西藏': '#D8C8E0', '四川': '#C8E0C0',
  '重庆': '#D8E8D0', '云南': '#D8C8D8', '贵州': '#C8D8D8',
  '广西': '#D8E8C8', '广东': '#F0C8C0', '海南': '#F0E8C0',
  '福建': '#F0D8C8', '江西': '#C8D8E8', '湖南': '#F0E0B8',
  '湖北': '#C8E0C8', '安徽': '#D8E8C8', '江苏': '#F0D8D8',
  '浙江': '#C8E0E0', '上海': '#F0C8D0', '山东': '#F0E8C8',
  '河南': '#F0D8D0', '台湾': '#C8E8C8', '香港': '#F0D0D0',
  '澳门': '#F0D8D0',
}

// Province landmark icons - cute, unique & culturally meaningful
export const provinceLandmarkMap: Record<string, string> = {
  '黑龙江': '🧊', '吉林': '🦌', '辽宁': '🦐',
  '内蒙古': '🐴', '北京': '🦆', '天津': '🥞',
  '河北': '🏔️', '山西': '🍜', '陕西': '🗿',
  '甘肃': '🐫', '宁夏': '🍇', '青海': '🐟',
  '新疆': '🍈', '西藏': '🏔️', '四川': '🐼',
  '重庆': '🌶️', '云南': '🦚', '贵州': '🌊',
  '广西': '🏞️', '广东': '🍵', '海南': '🥥',
  '福建': '🫖', '江西': '🍊', '湖南': '🌶️',
  '湖北': '🍜', '安徽': '🌲', '江苏': '🌸',
  '浙江': '🍵', '上海': '🥟', '山东': '🍺',
  '河南': '🍲', '台湾': '🧋', '香港': '🥮',
  '澳门': '🥧',
}

// Province label positions (approximate center on 800x600 viewBox)
export const provincePositionMap: Record<string, { x: number; y: number }> = {
  '黑龙江': { x: 620, y: 100 }, '吉林': { x: 620, y: 145 }, '辽宁': { x: 590, y: 175 },
  '内蒙古': { x: 480, y: 135 }, '北京': { x: 550, y: 170 }, '天津': { x: 565, y: 182 },
  '河北': { x: 545, y: 198 }, '山西': { x: 510, y: 200 }, '陕西': { x: 460, y: 225 },
  '甘肃': { x: 370, y: 200 }, '宁夏': { x: 420, y: 215 }, '青海': { x: 340, y: 235 },
  '新疆': { x: 200, y: 155 }, '西藏': { x: 230, y: 310 }, '四川': { x: 380, y: 300 },
  '重庆': { x: 415, y: 295 }, '云南': { x: 320, y: 360 }, '贵州': { x: 400, y: 340 },
  '广西': { x: 430, y: 380 }, '广东': { x: 510, y: 370 }, '海南': { x: 490, y: 440 },
  '福建': { x: 560, y: 335 }, '江西': { x: 525, y: 315 }, '湖南': { x: 470, y: 320 },
  '湖北': { x: 480, y: 280 }, '安徽': { x: 555, y: 265 }, '江苏': { x: 580, y: 245 },
  '浙江': { x: 590, y: 295 }, '上海': { x: 605, y: 260 }, '山东': { x: 560, y: 215 },
  '河南': { x: 505, y: 245 }, '台湾': { x: 620, y: 370 }, '香港': { x: 555, y: 400 },
  '澳门': { x: 540, y: 405 },
}

export interface RegionData {
  short: string
  full: string
  city: string
  phrase: string
  count: string
}

// 全国34个省级行政区方言数据
export const allRegions: RegionData[] = [
  { short: '安徽', full: '安徽省', city: '合肥', phrase: '搞哄个', count: '8,230条' },
  { short: '北京', full: '北京市', city: '朝阳', phrase: '吃了吗您呐', count: '12,450条' },
  { short: '重庆', full: '重庆市', city: '渝中', phrase: '要得！走起！', count: '15,680条' },
  { short: '福建', full: '福建省', city: '厦门', phrase: '哇塞', count: '6,720条' },
  { short: '甘肃', full: '甘肃省', city: '兰州', phrase: '攒劲得很', count: '3,450条' },
  { short: '广东', full: '广东省', city: '广州', phrase: '饮咗茶未', count: '18,920条' },
  { short: '广西', full: '广西壮族自治区', city: '南宁', phrase: '得喔', count: '5,340条' },
  { short: '贵州', full: '贵州省', city: '贵阳', phrase: '安逸惨喽', count: '7,890条' },
  { short: '海南', full: '海南省', city: '海口', phrase: '鲁吼', count: '4,120条' },
  { short: '河北', full: '河北省', city: '石家庄', phrase: '中咧', count: '5,670条' },
  { short: '河南', full: '河南省', city: '郑州', phrase: '中不中', count: '9,340条' },
  { short: '黑龙江', full: '黑龙江省', city: '哈尔滨', phrase: '贼拉好', count: '11,230条' },
  { short: '湖北', full: '湖北省', city: '武汉', phrase: '蛮扎实', count: '10,120条' },
  { short: '湖南', full: '湖南省', city: '长沙', phrase: '霸得蛮', count: '13,450条' },
  { short: '吉林', full: '吉林省', city: '长春', phrase: '嘎嘎香', count: '6,780条' },
  { short: '江苏', full: '江苏省', city: '南京', phrase: '多大事啊', count: '11,890条' },
  { short: '江西', full: '江西省', city: '南昌', phrase: '恰噶', count: '5,230条' },
  { short: '辽宁', full: '辽宁省', city: '沈阳', phrase: '得劲儿', count: '8,940条' },
  { short: '内蒙古', full: '内蒙古自治区', city: '呼和浩特', phrase: '赛白努', count: '3,670条' },
  { short: '宁夏', full: '宁夏回族自治区', city: '银川', phrase: '沃耶', count: '2,340条' },
  { short: '青海', full: '青海省', city: '西宁', phrase: '阿门了', count: '1,890条' },
  { short: '山东', full: '山东省', city: '济南', phrase: '俺寻思着', count: '10,560条' },
  { short: '山西', full: '山西省', city: '太原', phrase: '沾不沾', count: '4,780条' },
  { short: '陕西', full: '陕西省', city: '西安', phrase: '嫽扎咧', count: '7,230条' },
  { short: '上海', full: '上海市', city: '黄浦', phrase: '侬好', count: '14,560条' },
  { short: '四川', full: '四川省', city: '成都', phrase: '巴适得板', count: '22,340条' },
  { short: '天津', full: '天津市', city: '南开', phrase: '介是嘛', count: '5,890条' },
  { short: '西藏', full: '西藏自治区', city: '拉萨', phrase: '扎西德勒', count: '2,120条' },
  { short: '新疆', full: '新疆维吾尔自治区', city: '乌鲁木齐', phrase: '亚克西', count: '3,450条' },
  { short: '云南', full: '云南省', city: '昆明', phrase: '给是要得', count: '8,670条' },
  { short: '浙江', full: '浙江省', city: '杭州', phrase: '蛮好个', count: '9,780条' },
  { short: '台湾', full: '台湾省', city: '台北', phrase: '很棒的啦', count: '7,340条' },
  { short: '香港', full: '香港特别行政区', city: '中西区', phrase: '係咁先', count: '5,670条' },
  { short: '澳门', full: '澳门特别行政区', city: '花地玛', phrase: '唔该晒', count: '2,890条' },
]

// Hot/popular regions for featured grid
export const hotRegions = allRegions.filter(r =>
  ['四川', '上海', '广东', '湖南', '北京', '重庆', '东北', '福建', '湖北', '陕西', '江苏', '浙江', '山东', '河南', '安徽'].includes(r.short)
)

// Region options for create page ( province · city format )
export const createRegionOptions: string[] = allRegions.map(r => `${r.short}·${r.city}`)

// Sample audio clips per region
export const sampleAudioClips = [
  { region: '北京', text: '吃了吗您呐？', sub: 'Chī le ma nín na?' },
  { region: '四川', text: '巴适得板！', sub: 'Bā shì dé bǎn!' },
  { region: '上海', text: '侬好呀！', sub: 'Nóng hǎo ya!' },
  { region: '广东', text: '饮咗茶未？', sub: 'Yám jòh chàh meih?' },
  { region: '东北', text: '嘎哈呢老弟？', sub: 'Gà ha ne lǎo dì?' },
  { region: '陕西', text: '嫽扎咧！', sub: 'Liáo zā lie!' },
  { region: '湖南', text: '霸得蛮！', sub: 'Bà dé mán!' },
  { region: '河南', text: '中不中？', sub: 'Zhōng bù zhōng?' },
  { region: '山东', text: '俺寻思着...', sub: 'ǎn xín si zhe...' },
  { region: '浙江', text: '蛮好个！', sub: 'Mán hǎo gè!' },
  { region: '安徽', text: '搞哄个！', sub: 'Gǎo hōng gè!' },
  { region: '重庆', text: '要得！走起！', sub: 'Yào dé! Zǒu qǐ!' },
]
