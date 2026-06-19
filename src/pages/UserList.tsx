import { useState } from 'react'
import { ChevronLeft, UserPlus, UserCheck, Users, Heart } from 'lucide-react'
import { useApp } from '../App'

const followersData = [
  { id: 'f1', name: '方言小学徒', handle: '@xiao_xuetu', avatar: '/images/avatar_boy.jpg', bio: '正在学习各地方言', followers: 234 },
  { id: 'f2', name: '语言爱好者', handle: '@yuyan_ai', avatar: '/images/avatar_girl.jpg', bio: '语言学研究生', followers: 567 },
  { id: 'f3', name: '北方大汉', handle: '@beifang', avatar: '/images/avatar_young_man.jpg', bio: '东北话传播者', followers: 890 },
  { id: 'f4', name: '江南小雨', handle: '@jiangnan', avatar: '/images/avatar_young_woman.jpg', bio: '吴语区原住民', followers: 345 },
  { id: 'f5', name: '猫奴一号', handle: '@maonu', avatar: '/images/avatar_cat.jpg', bio: '爱猫爱方言', followers: 678 },
  { id: 'f6', name: '柴犬君', handle: '@chaiquan', avatar: '/images/avatar_dog.jpg', bio: '汪汪汪', followers: 123 },
]

const followingData = [
  { id: 'u1', name: '老成都茶馆', handle: '@laochengdu', avatar: '/images/avatar2.jpg', bio: '用成都话讲成都故事', followers: 2340 },
  { id: 'u2', name: '上海阿姨', handle: '@shanghaiayi', avatar: '/images/avatar1.jpg', bio: '吴侬软语，海派文化', followers: 1890 },
  { id: 'u3', name: '东北老铁', handle: '@dongbeilaotie', avatar: '/images/avatar2.jpg', bio: '东北话就是最逗的', followers: 5670 },
  { id: 'u4', name: '粤语小哥', handle: '@yueyuxiaoge', avatar: '/images/avatar1.jpg', bio: '粤语九声六调', followers: 1230 },
  { id: 'u7', name: '杭州小调', handle: '@hangzhouxiaodiao', avatar: '/images/avatar_flower.jpg', bio: '江南吴语韵味', followers: 780 },
  { id: 'u8', name: '北京胡同', handle: '@beijinghutong', avatar: '/images/avatar_crane.jpg', bio: '京片子地道味儿', followers: 3210 },
]

const likedData = [
  { id: 'l1', name: '老成都茶馆', handle: '@laochengdu', avatar: '/images/avatar2.jpg', bio: '赞了你的作品《巴适得板》', followers: 0 },
  { id: 'l2', name: '东北老铁', handle: '@dongbeilaotie', avatar: '/images/avatar2.jpg', bio: '赞了你的作品《东北雪景》', followers: 0 },
  { id: 'l3', name: '上海阿姨', handle: '@shanghaiayi', avatar: '/images/avatar1.jpg', bio: '赞了你的作品《上海弄堂》', followers: 0 },
  { id: 'l4', name: '粤语小哥', handle: '@yueyuxiaoge', avatar: '/images/avatar1.jpg', bio: '赞了你的作品《广东早茶》', followers: 0 },
  { id: 'l5', name: '湘西阿妹', handle: '@xiangxiamei', avatar: '/images/avatar_girl.jpg', bio: '赞了你的作品《凤凰古城》', followers: 0 },
  { id: 'l6', name: '西安秦腔', handle: '@xianqinqiang', avatar: '/images/avatar_deer.jpg', bio: '赞了你的作品《西安城墙》', followers: 0 },
]

const titleMap: Record<string, string> = {
  followers: '粉丝',
  following: '关注',
  liked: '获赞',
}

const iconMap: Record<string, typeof Users> = {
  followers: Users,
  following: Users,
  liked: Heart,
}

export default function UserList() {
  const { state, goBack, toggleFollow } = useApp()
  const [localFollow, setLocalFollow] = useState<Set<string>>(new Set())

  const type = state.userListType
  const data = type === 'followers' ? followersData : type === 'following' ? followingData : likedData
  const TitleIcon = iconMap[type]

  const isFollowing = (id: string) => localFollow.has(id) || state.followingIds.has(id)

  const handleToggle = (id: string) => {
    toggleFollow(id)
    setLocalFollow(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F1E8]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white card-shadow transition-transform active:scale-90" onClick={goBack}>
          <ChevronLeft size={20} className="text-[#3E3E3E]" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#3E3E3E]">{titleMap[type]}</h1>
        <span className="text-xs text-[#9E9E9E] ml-auto">{data.length} 位</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="space-y-2">
          {data.map(user => (
            <div key={user.id} className="bg-white rounded-2xl card-shadow p-3 flex items-center gap-3">
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#3E3E3E]">{user.name}</h3>
                  <span className="text-[10px] text-[#9E9E9E]">{user.handle}</span>
                </div>
                <p className="text-[11px] text-[#9E9E9E] mt-0.5 line-clamp-1">{user.bio}</p>
              </div>
              {type !== 'liked' && (
                <button
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                    isFollowing(user.id) ? 'bg-[#2D5016]/10 text-[#2D5016]' : 'bg-[#2D5016] text-white'
                  }`}
                  onClick={() => handleToggle(user.id)}
                >
                  {isFollowing(user.id) ? (
                    <span className="flex items-center gap-1"><UserCheck size={12} />已关注</span>
                  ) : (
                    <span className="flex items-center gap-1"><UserPlus size={12} />关注</span>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#9E9E9E]">
            <TitleIcon size={48} strokeWidth={1} className="mb-3 opacity-40" />
            <p className="text-sm">暂无{titleMap[type]}</p>
          </div>
        )}
      </div>
    </div>
  )
}
