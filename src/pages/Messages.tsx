import { useEffect } from 'react'
import { Bell, Heart, MessageSquare, UserPlus, Clock } from 'lucide-react'
import { useApp } from '../App'

const typeIcons = {
  system: Bell,
  comment: MessageSquare,
  like: Heart,
  follow: UserPlus,
}

const typeColors = {
  system: '#2D5016',
  comment: '#2D5016',
  like: '#8B2635',
  follow: '#E67E22',
}

export default function Messages() {
  const { state, readMessage, openMessageChat, refreshMessages, isLoggedIn } = useApp()

  useEffect(() => {
    if (isLoggedIn) void refreshMessages()
  }, [isLoggedIn, refreshMessages])

  const handleOpen = (msg: typeof state.messages[0]) => {
    readMessage(msg.id)
    if (msg.actorId) {
      void openMessageChat(msg.actorId)
    }
  }

  return (
    <div className="h-full flex flex-col theme-bg">
      <div className="shrink-0 px-4 pt-3 pb-2 theme-bg">
        <h1 className="text-xl font-bold theme-text">消息</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="space-y-2">
          {state.messages.map(msg => {
            const Icon = typeIcons[msg.type]
            const color = typeColors[msg.type]

            return (
              <button
                key={msg.id}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all active:scale-[0.98] ${
                  msg.read ? 'theme-surface-soft' : 'theme-surface card-shadow'
                }`}
                onClick={() => handleOpen(msg)}
              >
                {msg.avatar ? (
                  <div className="relative shrink-0">
                    <img src={msg.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: color }}
                    >
                      <Icon size={10} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={20} style={{ color }} strokeWidth={1.5} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm theme-text ${msg.read ? 'font-medium' : 'font-semibold'}`}>
                      {msg.title}
                    </span>
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8B2635] shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 line-clamp-2 ${msg.read ? 'theme-text-muted' : 'theme-text-soft'}`}>
                    {msg.content}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="theme-text-muted" />
                    <span className="text-[10px] theme-text-muted">{msg.time}</span>
                    {msg.actorId && (
                      <span className="text-[10px] text-[#576B95] ml-1">· 点击回复</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {state.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 theme-text-muted">
            <Bell size={48} strokeWidth={1} className="mb-3 opacity-40" />
            <p className="text-sm">暂无消息</p>
          </div>
        )}
      </div>
    </div>
  )
}
