import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, Send } from 'lucide-react'
import { useApp } from '../App'
import { fetchChatMessages, sendChatMessage, type ChatMessage } from '@/lib/chatApi'

export default function MessageChat() {
  const { state, goBack } = useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversationId = state.chatConversationId
  const partnerName = state.chatPartnerName || '对话'
  const partnerAvatar = state.chatPartnerAvatar || '/images/avatar1.jpg'

  const loadMessages = useCallback(async () => {
    if (!conversationId) return
    setLoading(true)
    const rows = await fetchChatMessages(conversationId)
    setMessages(rows)
    setLoading(false)
  }, [conversationId])

  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!conversationId || !text.trim() || sending) return
    setSending(true)
    const result = await sendChatMessage(conversationId, text)
    setSending(false)
    if (result.ok && result.message) {
      setMessages(prev => [...prev, result.message!])
      setText('')
    }
  }

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center theme-bg">
        <p className="text-sm theme-text-muted">无法打开对话</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col theme-bg">
      <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-2 theme-bg">
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-full theme-surface card-shadow transition-transform active:scale-90"
          onClick={goBack}
        >
          <ChevronLeft size={20} className="theme-text" />
        </button>
        <img src={partnerAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        <span className="text-sm font-medium theme-text">{partnerName}</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
        {loading ? (
          <p className="text-center text-xs theme-text-muted py-8">加载中…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs theme-text-muted py-8">打个招呼吧</p>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.isMine
                    ? 'bg-[#2D5016] text-white rounded-br-md'
                    : 'theme-surface theme-text card-shadow rounded-bl-md'
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-1 ${msg.isMine ? 'text-white/70' : 'theme-text-muted'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 flex items-center gap-2 px-4 py-2 theme-surface border-t theme-border">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入消息…"
          className="flex-1 h-10 theme-muted rounded-full px-4 text-sm outline-none theme-text"
          onKeyDown={e => {
            if (e.key === 'Enter') void handleSend()
          }}
        />
        <button
          type="button"
          disabled={sending || !text.trim()}
          className="w-10 h-10 rounded-full bg-[#2D5016] flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50"
          onClick={() => void handleSend()}
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
