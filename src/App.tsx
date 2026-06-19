import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Home, Map, Mic, MessageCircle, User } from 'lucide-react'
import XiangBallSvg from './components/brand/XiangBallSvg'
import { playGuaSound } from './components/MantouFrog'
import HomeFeed from './pages/HomeFeed'
import Discover from './pages/Discover'
import Create from './pages/Create'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import CardGenerator from './pages/CardGenerator'
import PostDetail from './pages/PostDetail'
import CheckinDetail from './pages/CheckinDetail'
import MyWorks from './pages/MyWorks'
import MyCards from './pages/MyCards'
import MyBadges from './pages/MyBadges'
import Favorites from './pages/Favorites'
import Settings from './pages/Settings'
import SearchPage from './pages/SearchPage'
import RegionDetail from './pages/RegionDetail'
import AvatarSettings from './pages/AvatarSettings'
import WikiDetail from './pages/WikiDetail'
import UserList from './pages/UserList'
import SplashScreen from './pages/SplashScreen'
import GameScreen from './pages/GameScreen'
import LoginScreen from './pages/LoginScreen'
import MessageChat from './pages/MessageChat'
import { initCheckinState, applyCheckin, refreshCheckinFromStorage, type CheckinResult } from './lib/checkin'
import { syncCheckinsFromCloud } from './lib/checkinApi'
import { applyAppSettings, loadAppSettings } from './lib/appSettings'
import { getOrCreateConversation, fetchChatPartner } from './lib/chatApi'
import {
  fetchNotifications,
  markNotificationRead,
  togglePostLikeApi,
  togglePostBookmarkApi,
} from './lib/socialApi'
import { getSupabase } from './lib/supabase'
import {
  fetchUserProfile,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  updateUserProfile,
  type AuthResult,
  type UserProfile,
} from './lib/auth'
import { fetchPublishedFeed, fetchRegionPosts } from './lib/posts'

export type Screen = 'splash' | 'home' | 'discover' | 'create' | 'messages' | 'messageChat' | 'profile' | 'cardGen' | 'postDetail' | 'checkinDetail' | 'myWorks' | 'myCards' | 'myBadges' | 'favorites' | 'settings' | 'searchPage' | 'regionDetail' | 'avatarSettings' | 'wikiDetail' | 'userList' | 'gameScreen' | 'login'

export interface Post {
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

export interface Message {
  id: string
  type: 'system' | 'comment' | 'like' | 'follow'
  title: string
  content: string
  time: string
  read: boolean
  avatar?: string
  actorId?: string
  postId?: string
}

export interface CheckinDay {
  day: number
  checked: boolean
  region?: string
  level?: number // which game level was cleared
  hasThumb?: boolean
  hasFlame?: boolean
}

export interface TreasureCard {
  id: string
  region: string
  city: string
  phrase: string
  bgImage: string
  earnedDate: string
  consecutiveDays: number
}

export interface Badge {
  id: string
  region: string
  city: string
  name: string
  icon: string
  earnedDate: string
  consecutiveDays: number
  color: string
}

export interface SearchUser {
  id: string
  name: string
  handle: string
  avatar: string
  bio: string
  followers: number
  isFollowing: boolean
}

export interface RegionPost {
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

export interface WikiArticle {
  id: string
  title: string
  category: string
  color: string
  content: string
}

export interface AppState {
  screen: Screen
  prevScreen: Screen | null
  activeTab: string
  posts: Post[]
  messages: Message[]
  selectedPostId: string | null
  recordingData: { duration: number; waveform: number[] } | null
  cardText: string
  cardRegion: string
  cardTemplate: number
  checkinDays: CheckinDay[]
  currentMonth: number
  currentYear: number
  today: number
  streakDays: number
  showStreakModal: number | null
  myCards: TreasureCard[]
  myBadges: Badge[]
  favorites: Post[]
  searchUsers: SearchUser[]
  followingIds: Set<string>
  selectedRegionName: string | null
  regionPosts: RegionPost[]
  userNickname: string
  currentAvatar: string
  userId: string | null
  userEmail: string | null
  userHandle: string | null
  authReady: boolean
  userListType: 'followers' | 'following' | 'liked'
  selectedWikiId: string | null
  chatConversationId: string | null
  chatPartnerId: string | null
  chatPartnerName: string | null
  chatPartnerAvatar: string | null
}

interface AppContextType {
  state: AppState
  navigate: (screen: Screen) => void
  goBack: () => void
  setActiveTab: (tab: string) => void
  togglePostLike: (postId: string) => void
  togglePostBookmark: (postId: string) => void
  selectPost: (postId: string) => void
  setRecordingData: (data: { duration: number; waveform: number[] } | null) => void
  setCardText: (text: string) => void
  setCardRegion: (region: string) => void
  setCardTemplate: (template: number) => void
  readMessage: (msgId: string) => void
  openMessageChat: (actorId: string) => Promise<void>
  refreshMessages: () => Promise<void>
  bumpPostCommentCount: (postId: string) => void
  dismissStreakModal: () => void
  toggleFollow: (userId: string) => void
  selectRegion: (regionName: string) => void
  setUserNickname: (name: string) => void
  setCurrentAvatar: (avatar: string) => void
  setUserListType: (type: 'followers' | 'following' | 'liked') => void
  selectWiki: (wikiId: string) => void
  recordCheckin: (region: string, level: number) => CheckinResult
  refreshCheckinState: () => void
  refreshPosts: () => Promise<void>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, nickname?: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  isLoggedIn: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

const tabRoots: Record<string, Screen> = {
  home: 'home',
  discover: 'discover',
  create: 'create',
  messages: 'messages',
  profile: 'profile',
}

const initialPosts: Post[] = [
  {
    id: '1', author: '老成都茶馆', avatar: '/images/avatar2.jpg', region: '四川·成都',
    dialect: '巴适得板！今儿个太阳好，来碗盖碗茶嘛。',
    translation: '太舒服了！今天天气好，来杯盖碗茶吧。',
    image: '/images/cover_sichuan.jpg', likes: 328, comments: 45, shares: 12, duration: 12, liked: false, bookmarked: false,
  },
  {
    id: '2', author: '上海阿姨', avatar: '/images/avatar1.jpg', region: '上海·黄浦',
    dialect: '侬好呀，今朝天气蛮好的，去外滩荡荡伐？',
    translation: '你好呀，今天天气挺好的，去外滩逛逛吗？',
    image: '/images/cover_shanghai.jpg', likes: 256, comments: 32, shares: 8, duration: 9, liked: false, bookmarked: false,
  },
  {
    id: '3', author: '东北老铁', avatar: '/images/avatar2.jpg', region: '黑龙江·哈尔滨',
    dialect: '哎呀妈呀，这天儿贼拉冷，整点饺子暖和暖和！',
    translation: '哎呀，这天非常冷，吃点饺子暖和暖和！',
    image: '/images/cover_dongbei.jpg', likes: 512, comments: 67, shares: 23, duration: 11, liked: false, bookmarked: false,
  },
  {
    id: '4', author: '粤语小哥', avatar: '/images/avatar1.jpg', region: '广东·广州',
    dialect: '饮早茶未啊？一盅两件，慢慢叹。',
    translation: '喝早茶了吗？一壶茶两笼点心，慢慢享受。',
    image: '/images/cover_guangdong.jpg', likes: 189, comments: 28, shares: 6, duration: 8, liked: false, bookmarked: false,
  },
  {
    id: '5', author: '湘西阿妹', avatar: '/images/avatar1.jpg', region: '湖南·凤凰',
    dialect: '咯里的山水美得很，你来得正是时候。',
    translation: '这里的山水很美，你来的正是时候。',
    image: '/images/cover_hunan.jpg', likes: 445, comments: 56, shares: 18, duration: 10, liked: false, bookmarked: false,
  },
  {
    id: '6', author: '陕西老汉', avatar: '/images/avatar2.jpg', region: '陕西·西安',
    dialect: '嫽扎咧！这羊肉泡馍美得很。',
    translation: '太好了！这羊肉泡馍非常好吃。',
    image: '/images/bg_wood.jpg', likes: 178, comments: 24, shares: 7, duration: 9, liked: false, bookmarked: false,
  },
]

const initialMessages: Message[] = [
  { id: '1', type: 'system', title: '乡音公告', content: '「乡音宝藏卡」新功能上线啦！快去创作属于你的方言卡片吧~', time: '10分钟前', read: false },
  { id: '2', type: 'comment', title: '上海阿姨 回复了你', content: '哈哈，侬个四川话讲得蛮好的嘛！', time: '30分钟前', read: false, avatar: '/images/avatar1.jpg' },
  { id: '3', type: 'like', title: '东北老铁 赞了你', content: '赞了你的作品《巴适得板》', time: '1小时前', read: false, avatar: '/images/avatar2.jpg' },
  { id: '4', type: 'follow', title: '粤语小哥 关注了你', content: '成为你的新粉丝', time: '2小时前', read: true, avatar: '/images/avatar1.jpg' },
  { id: '5', type: 'system', title: '每日打卡提醒', content: '今天还没打卡哦，坚持记录乡音，留住文化的根。', time: '3小时前', read: true },
  { id: '6', type: 'comment', title: '湘西阿妹 回复了你', content: '你这个发音很标准呢，是本地人吗？', time: '5小时前', read: true, avatar: '/images/avatar1.jpg' },
]

// 打卡数据由 localStorage 驱动，初始为空，仅闯关成功后写入当天
const checkinInit = initCheckinState()

const initialSearchUsers: SearchUser[] = [
  { id: 'u1', name: '老成都茶馆', handle: '@laochengdu', avatar: '/images/avatar2.jpg', bio: '用成都话讲成都故事', followers: 2340, isFollowing: false },
  { id: 'u2', name: '上海阿姨', handle: '@shanghaiayi', avatar: '/images/avatar1.jpg', bio: '吴侬软语，海派文化', followers: 1890, isFollowing: false },
  { id: 'u3', name: '东北老铁', handle: '@dongbeilaotie', avatar: '/images/avatar2.jpg', bio: '东北话就是最逗的', followers: 5670, isFollowing: false },
  { id: 'u4', name: '粤语小哥', handle: '@yueyuxiaoge', avatar: '/images/avatar1.jpg', bio: '粤语九声六调', followers: 1230, isFollowing: false },
  { id: 'u5', name: '湘西阿妹', handle: '@xiangxiamei', avatar: '/images/avatar1.jpg', bio: '湘西民歌与方言', followers: 890, isFollowing: false },
  { id: 'u6', name: '西安秦腔', handle: '@xianqinqiang', avatar: '/images/avatar2.jpg', bio: '陕西话嘹咋咧', followers: 1560, isFollowing: false },
  { id: 'u7', name: '杭州小调', handle: '@hangzhouxiaodiao', avatar: '/images/avatar1.jpg', bio: '江南吴语韵味', followers: 780, isFollowing: false },
  { id: 'u8', name: '北京胡同', handle: '@beijinghutong', avatar: '/images/avatar2.jpg', bio: '京片子地道味儿', followers: 3210, isFollowing: false },
]

const regionPostMap: Record<string, RegionPost[]> = {
  '四川': [
    { id: 'r1', author: '老成都茶馆', avatar: '/images/avatar2.jpg', region: '四川·成都', dialect: '巴适得板！今儿个太阳好，来碗盖碗茶嘛。', translation: '太舒服了！今天天气好，来杯盖碗茶吧。', image: '/images/cover_sichuan.jpg', likes: 328, duration: 12 },
    { id: 'r2', author: '成都辣妹子', avatar: '/images/avatar1.jpg', region: '四川·成都', dialect: '安逸！这火锅巴适得板。', translation: '舒服！这火锅太棒了。', image: '/images/bg_xuanzhi.jpg', likes: 256, duration: 8 },
  ],
  '上海': [
    { id: 'r3', author: '上海阿姨', avatar: '/images/avatar1.jpg', region: '上海·黄浦', dialect: '侬好呀，今朝天气蛮好的。', translation: '你好呀，今天天气挺好的。', image: '/images/cover_shanghai.jpg', likes: 256, duration: 9 },
  ],
  '黑龙江': [
    { id: 'r4', author: '东北老铁', avatar: '/images/avatar2.jpg', region: '黑龙江·哈尔滨', dialect: '哎呀妈呀，这天儿贼拉冷，整点饺子暖和暖和！', translation: '哎呀，这天非常冷，吃点饺子暖和暖和！', image: '/images/cover_dongbei.jpg', likes: 512, duration: 11 },
  ],
  '广东': [
    { id: 'r5', author: '粤语小哥', avatar: '/images/avatar1.jpg', region: '广东·广州', dialect: '饮早茶未啊？一盅两件，慢慢叹。', translation: '喝早茶了吗？一壶茶两笼点心，慢慢享受。', image: '/images/cover_guangdong.jpg', likes: 189, duration: 8 },
  ],
  '湖南': [
    { id: 'r6', author: '湘西阿妹', avatar: '/images/avatar1.jpg', region: '湖南·凤凰', dialect: '咯里的山水美得很，你来得正是时候。', translation: '这里的山水很美，你来的正是时候。', image: '/images/cover_hunan.jpg', likes: 445, duration: 10 },
  ],
}

function BottomNav({ activeTab, onTabChange, unreadCount }: { activeTab: string; onTabChange: (tab: string) => void; unreadCount: number }) {
  const tabs = [
    { key: 'home', label: '首页', icon: Home },
    { key: 'discover', label: '发现', icon: Map },
    { key: 'create', label: '创作', icon: Mic },
    { key: 'messages', label: '消息', icon: MessageCircle },
    { key: 'profile', label: '我的', icon: User },
  ]

  return (
    <nav className="shrink-0 h-16 glass-nav border-t border-[#E0D8C8] z-50 flex items-center justify-around select-none">
      {tabs.map((t) => {
        const isActive = activeTab === t.key
        const isCreate = t.key === 'create'
        const Icon = t.icon
        return (
          <button
            key={t.key}
            className="flex flex-col items-center justify-center relative min-w-[48px] min-h-[48px] transition-transform active:scale-95"
            onClick={() => onTabChange(t.key)}
          >
            {isCreate ? (
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-[#2D5016]' : 'bg-[#2D5016]/80'}`}>
                <Icon size={22} strokeWidth={2} className="text-white" />
              </div>
            ) : (
              <>
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-colors ${isActive ? 'text-[#2D5016]' : 'text-[#9E9E9E]'}`}
                  />
                  {t.key === 'messages' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-[#8B2635] text-white text-[10px] flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 transition-colors ${isActive ? 'text-[#2D5016] font-semibold' : 'text-[#9E9E9E]'}`}>
                  {t.label}
                </span>
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default function App() {
  const [state, setState] = useState<AppState>({
    screen: 'splash',
    prevScreen: null,
    activeTab: 'home',
    posts: initialPosts,
    messages: initialMessages,
    selectedPostId: null,
    recordingData: null,
    cardText: '',
    cardRegion: '四川·成都',
    cardTemplate: 0,
    checkinDays: checkinInit.checkinDays,
    currentMonth: checkinInit.currentMonth,
    currentYear: checkinInit.currentYear,
    today: checkinInit.today,
    streakDays: checkinInit.streakDays,
    showStreakModal: null,
    myCards: [],
    myBadges: [],
    favorites: initialPosts.filter(p => p.bookmarked || p.id === '1' || p.id === '3'),
    searchUsers: initialSearchUsers,
    followingIds: new Set(),
    selectedRegionName: null,
    regionPosts: [],
    userNickname: '乡音旅人',
    currentAvatar: '/images/avatar1.jpg',
    userId: null,
    userEmail: null,
    userHandle: null,
    authReady: false,
    userListType: 'followers',
    selectedWikiId: null,
    chatConversationId: null,
    chatPartnerId: null,
    chatPartnerName: null,
    chatPartnerAvatar: null,
  })

  const stateRef = useRef(state)
  stateRef.current = state

  const navigate = useCallback((screen: Screen) => {
    const s = stateRef.current
    setState({ ...s, prevScreen: s.screen, screen })
  }, [])

  const goBack = useCallback(() => {
    const s = stateRef.current
    const target = s.prevScreen ?? tabRoots[s.activeTab] ?? 'home'
    setState({ ...s, screen: target, prevScreen: null })
  }, [])

  const setActiveTab = useCallback((tab: string) => {
    const s = stateRef.current
    const screen = tabRoots[tab] ?? 'home'
    setState({ ...s, activeTab: tab, screen, prevScreen: null })
  }, [])

  const togglePostLike = useCallback((postId: string) => {
    const s = stateRef.current
    if (!s.userId) return
    const post = s.posts.find(p => p.id === postId)
    if (!post) return
    const nextLiked = !post.liked
    const nextLikes = nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
    setState({
      ...s,
      posts: s.posts.map(p => (p.id === postId ? { ...p, liked: nextLiked, likes: nextLikes } : p)),
    })
    void togglePostLikeApi(postId).then(result => {
      if (!result) return
      setState(cur => ({
        ...cur,
        posts: cur.posts.map(p => (
          p.id === postId ? { ...p, liked: result.liked, likes: result.likesCount } : p
        )),
      }))
    })
  }, [])

  const togglePostBookmark = useCallback((postId: string) => {
    const s = stateRef.current
    if (!s.userId) return
    const post = s.posts.find(p => p.id === postId)
    if (!post) return
    const nextBookmarked = !post.bookmarked
    setState({
      ...s,
      posts: s.posts.map(p => (p.id === postId ? { ...p, bookmarked: nextBookmarked } : p)),
    })
    void togglePostBookmarkApi(postId).then(result => {
      if (result === null) return
      setState(cur => {
        const newPosts = cur.posts.map(p => (p.id === postId ? { ...p, bookmarked: result } : p))
        return {
          ...cur,
          posts: newPosts,
          favorites: newPosts.filter(p => p.bookmarked),
        }
      })
    })
  }, [])

  const bumpPostCommentCount = useCallback((postId: string) => {
    setState(s => ({
      ...s,
      posts: s.posts.map(p => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)),
    }))
  }, [])

  const selectPost = useCallback((postId: string) => {
    const s = stateRef.current
    setState({ ...s, selectedPostId: postId, prevScreen: s.screen, screen: 'postDetail' })
  }, [])

  const setRecordingData = useCallback((data: { duration: number; waveform: number[] } | null) => {
    const s = stateRef.current
    setState({ ...s, recordingData: data })
  }, [])

  const setCardText = useCallback((text: string) => {
    const s = stateRef.current
    setState({ ...s, cardText: text })
  }, [])

  const setCardRegion = useCallback((region: string) => {
    const s = stateRef.current
    setState({ ...s, cardRegion: region })
  }, [])

  const setCardTemplate = useCallback((template: number) => {
    const s = stateRef.current
    setState({ ...s, cardTemplate: template })
  }, [])

  const readMessage = useCallback((msgId: string) => {
    const s = stateRef.current
    setState({
      ...s,
      messages: s.messages.map(m => (m.id === msgId ? { ...m, read: true } : m)),
    })
    void markNotificationRead(msgId)
  }, [])

  const refreshMessages = useCallback(async () => {
    const userId = stateRef.current.userId
    if (!userId) return
    const items = await fetchNotifications()
    setState(s => ({ ...s, messages: items }))
  }, [])

  const openMessageChat = useCallback(async (actorId: string) => {
    const s = stateRef.current
    if (!s.userId) return
    const conversationId = await getOrCreateConversation(actorId)
    if (!conversationId) return
    const partner = await fetchChatPartner(actorId)
    setState({
      ...s,
      chatConversationId: conversationId,
      chatPartnerId: actorId,
      chatPartnerName: partner?.nickname ?? '用户',
      chatPartnerAvatar: partner?.avatar ?? '/images/avatar1.jpg',
      prevScreen: s.screen,
      screen: 'messageChat',
    })
  }, [])

  const dismissStreakModal = useCallback(() => {
    const s = stateRef.current
    setState({ ...s, showStreakModal: null })
  }, [])

  const toggleFollow = useCallback((userId: string) => {
    const s = stateRef.current
    const next = new Set(s.followingIds)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    setState({
      ...s,
      followingIds: next,
      searchUsers: s.searchUsers.map(u => u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u),
    })
  }, [])

  const selectRegion = useCallback((regionName: string) => {
    const s = stateRef.current
    const fallback = regionPostMap[regionName] || []
    setState({
      ...s,
      selectedRegionName: regionName,
      regionPosts: fallback,
      prevScreen: s.screen,
      screen: 'regionDetail',
    })
    void fetchRegionPosts(regionName).then(cloudPosts => {
      if (cloudPosts.length === 0) return
      setState(cur => {
        if (cur.selectedRegionName !== regionName) return cur
        return { ...cur, regionPosts: cloudPosts as RegionPost[] }
      })
    })
  }, [])

  const setUserNickname = useCallback((name: string) => {
    const s = stateRef.current
    setState({ ...s, userNickname: name })
    if (s.userId) {
      void updateUserProfile(s.userId, { nickname: name })
    }
  }, [])

  const setCurrentAvatar = useCallback((avatar: string) => {
    const s = stateRef.current
    setState({ ...s, currentAvatar: avatar })
    if (s.userId) {
      void updateUserProfile(s.userId, { avatar_url: avatar }).then(result => {
        if (result.ok && result.profile?.avatar_url) {
          setState(cur => ({ ...cur, currentAvatar: result.profile!.avatar_url! }))
        }
      })
    }
  }, [])

  const setUserListType = useCallback((type: 'followers' | 'following' | 'liked') => {
    const s = stateRef.current
    setState({ ...s, userListType: type })
  }, [])

  const selectWiki = useCallback((wikiId: string) => {
    const s = stateRef.current
    setState({ ...s, selectedWikiId: wikiId, prevScreen: s.screen, screen: 'wikiDetail' })
  }, [])

  const recordCheckin = useCallback((region: string, level: number): CheckinResult => {
    const s = stateRef.current
    const result = applyCheckin(region, level, s.myCards, s.myBadges)
    setState({
      ...s,
      checkinDays: result.checkinDays,
      streakDays: result.streak,
      myCards: result.myCards,
      myBadges: result.myBadges,
      showStreakModal: result.milestone,
    })
    return result
  }, [])

  const refreshCheckinState = useCallback(() => {
    const refreshed = refreshCheckinFromStorage()
    setState(s => ({ ...s, ...refreshed }))
  }, [])

  const refreshPosts = useCallback(async () => {
    const cloudPosts = await fetchPublishedFeed()
    if (cloudPosts.length === 0) return
    setState(s => ({
      ...s,
      posts: cloudPosts as Post[],
      favorites: s.favorites.filter(f => cloudPosts.some(p => p.id === f.id)),
    }))
  }, [])

  const applyProfile = useCallback((profile: UserProfile) => {
    setState({
      ...stateRef.current,
      userId: profile.id,
      userEmail: profile.email,
      userHandle: profile.handle,
      userNickname: profile.nickname,
      currentAvatar: profile.avatar_url || '/images/avatar1.jpg',
      authReady: true,
    })
    void syncCheckinsFromCloud(profile.id).then(synced => {
      if (!synced) return
      setState(s => ({
        ...s,
        checkinDays: synced.checkinDays,
        streakDays: synced.streakDays,
      }))
    })
    void refreshPosts()
    void refreshMessages()
  }, [refreshPosts, refreshMessages])

  const clearAuth = useCallback(() => {
    const s = stateRef.current
    setState({
      ...s,
      userId: null,
      userEmail: null,
      userHandle: null,
      userNickname: '乡音旅人',
      currentAvatar: '/images/avatar1.jpg',
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const result = await signInWithEmail(email, password)
    if (result.ok && result.profile) {
      applyProfile(result.profile)
    } else if (result.ok && result.user) {
      const profile = await fetchUserProfile(result.user.id)
      if (profile) applyProfile(profile)
      else {
        setState({
          ...stateRef.current,
          userId: result.user.id,
          userEmail: result.user.email ?? null,
          userHandle: `user_${result.user.id.slice(0, 8)}`,
        })
      }
    }
    return result
  }, [applyProfile])

  const signUp = useCallback(async (email: string, password: string, nickname?: string): Promise<AuthResult> => {
    const result = await signUpWithEmail(email, password, nickname)
    if (result.ok && result.profile) {
      applyProfile(result.profile)
    } else if (result.ok && result.user && result.user.id) {
      const profile = await fetchUserProfile(result.user.id)
      if (profile) applyProfile(profile)
    }
    return result
  }, [applyProfile])

  const signOut = useCallback(async (): Promise<AuthResult> => {
    const result = await signOutUser()
    if (result.ok) clearAuth()
    return result
  }, [clearAuth])

  useEffect(() => {
    applyAppSettings(loadAppSettings())
    void refreshPosts()
  }, [refreshPosts])

  useEffect(() => {
    const client = getSupabase()
    if (!client) {
      setState(s => ({ ...s, authReady: true }))
      return
    }

    let mounted = true

    const syncSession = async () => {
      const { data: { session } } = await client.auth.getSession()
      if (!mounted) return

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (!mounted) return
        if (profile) {
          applyProfile(profile)
        } else {
          setState(s => ({
            ...s,
            userId: session.user.id,
            userEmail: session.user.email ?? null,
            userHandle: `user_${session.user.id.slice(0, 8)}`,
            authReady: true,
          }))
          void syncCheckinsFromCloud(session.user.id).then(synced => {
            if (!mounted || !synced) return
            setState(s => ({
              ...s,
              checkinDays: synced.checkinDays,
              streakDays: synced.streakDays,
            }))
          })
          return
        }
      }

      setState(s => ({ ...s, authReady: true }))
    }

    void syncSession()

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        void fetchUserProfile(session.user.id).then(profile => {
          if (!mounted) return
          if (profile) applyProfile(profile)
          else {
            setState(s => ({
              ...s,
              userId: session.user.id,
              userEmail: session.user.email ?? null,
              userHandle: `user_${session.user.id.slice(0, 8)}`,
            }))
            void syncCheckinsFromCloud(session.user.id).then(synced => {
              if (!mounted || !synced) return
              setState(s => ({
                ...s,
                checkinDays: synced.checkinDays,
                streakDays: synced.streakDays,
              }))
            })
          }
        })
      } else {
        clearAuth()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [applyProfile, clearAuth])

  const tabRootsScreens: Screen[] = ['home', 'discover', 'create', 'messages', 'profile']
  const showNav = tabRootsScreens.includes(state.screen)
  const unreadCount = state.messages.filter(m => !m.read).length

  const renderScreen = (): ReactNode => {
    switch (state.screen) {
      case 'splash': return <SplashScreen />
      case 'home': return <HomeFeed />
      case 'discover': return <Discover />
      case 'create': return <Create />
      case 'messages': return <Messages />
      case 'messageChat': return <MessageChat />
      case 'profile': return <Profile />
      case 'cardGen': return <CardGenerator />
      case 'postDetail': return <PostDetail />
      case 'checkinDetail': return <CheckinDetail />
      case 'myWorks': return <MyWorks />
      case 'myCards': return <MyCards />
      case 'myBadges': return <MyBadges />
      case 'favorites': return <Favorites />
      case 'settings': return <Settings />
      case 'searchPage': return <SearchPage />
      case 'regionDetail': return <RegionDetail />
      case 'avatarSettings': return <AvatarSettings />
      case 'wikiDetail': return <WikiDetail />
      case 'userList': return <UserList />
      case 'gameScreen': return <GameScreen />
      case 'login': return <LoginScreen />
      default: return <HomeFeed />
    }
  }

  // Mantou frog button pop effect
  const appContentRef = useRef<HTMLDivElement>(null)
  const [buttonPops, setButtonPops] = useState<{ id: number; x: number; y: number }[]>([])
  const popIdRef = useRef(0)

  useEffect(() => {
    const container = appContentRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('button')
      if (!button) return

      // Skip if button is too small (like icon-only buttons in nav)
      const rect = button.getBoundingClientRect()
      if (rect.width < 20 || rect.height < 20) return

      // Green flash effect
      const originalTransition = (button as HTMLElement).style.transition
      const originalBg = (button as HTMLElement).style.backgroundColor
      const originalColor = (button as HTMLElement).style.color

      ;(button as HTMLElement).style.transition = 'background-color 0.2s, color 0.2s'
      ;(button as HTMLElement).style.backgroundColor = '#2D5016'
      ;(button as HTMLElement).style.color = '#ffffff'

      setTimeout(() => {
        ;(button as HTMLElement).style.backgroundColor = originalBg
        ;(button as HTMLElement).style.color = originalColor
        setTimeout(() => {
          ;(button as HTMLElement).style.transition = originalTransition
        }, 200)
      }, 300)

      // Frog pop effect
      const containerRect = container.getBoundingClientRect()
      const id = ++popIdRef.current
      const x = rect.left + rect.width / 2 - containerRect.left
      const y = rect.top - containerRect.top

      setButtonPops(prev => [...prev, { id, x, y }])
      playGuaSound()

      setTimeout(() => {
        setButtonPops(prev => prev.filter(p => p.id !== id))
      }, 900)
    }

    container.addEventListener('click', handleClick, true)
    return () => container.removeEventListener('click', handleClick, true)
  }, [state.screen])

  return (
    <AppContext.Provider
      value={{
        state, navigate, goBack, setActiveTab,
        togglePostLike, togglePostBookmark, selectPost,
        setRecordingData, setCardText, setCardRegion, setCardTemplate,
        readMessage, openMessageChat, refreshMessages, bumpPostCommentCount,
        dismissStreakModal, toggleFollow, selectRegion,
        setUserNickname, setCurrentAvatar, setUserListType, selectWiki, recordCheckin, refreshCheckinState,
        refreshPosts,
        signIn, signUp, signOut, isLoggedIn: Boolean(state.userId),
      }}
    >
      <div className="h-screen w-full bg-neutral-900 flex justify-center items-center p-0 md:p-4">
        <div
          id="app-shell"
          ref={appContentRef}
          className="w-full max-w-[430px] h-[100dvh] md:h-[850px] bg-[#F5F1E8] rounded-none overflow-hidden shadow-2xl relative isolate flex flex-col"
        >
          <main className="flex-1 overflow-hidden">
            {renderScreen()}
          </main>
          {showNav && (
            <BottomNav activeTab={state.activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
          )}

          {/* Button pop · 绿球 */}
          {buttonPops.map(pop => (
            <div
              key={pop.id}
              className="absolute z-[200] pointer-events-none"
              style={{
                left: pop.x,
                top: pop.y,
                transform: 'translate(-50%, -100%)',
                animation: 'frog-pop-up 0.8s ease-out forwards',
              }}
            >
              <XiangBallSvg variant="happy" size={40} className="drop-shadow-md" />
            </div>
          ))}

          {/* Global CSS animations */}
          <style>{`
            @keyframes frog-pop-up {
              0% { opacity: 0; transform: translate(-50%, -60%) scale(0.3) rotate(-15deg); }
              25% { opacity: 1; transform: translate(-50%, -120%) scale(1.15) rotate(8deg); }
              55% { opacity: 1; transform: translate(-50%, -100%) scale(1) rotate(0deg); }
              100% { opacity: 0; transform: translate(-50%, -140%) scale(0.5) rotate(0deg); }
            }
          `}</style>
        </div>
      </div>
    </AppContext.Provider>
  )
}
