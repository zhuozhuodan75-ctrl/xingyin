import { getSupabase } from './supabase'
import { getAuthUserId } from './supabaseAuth'

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: string
  time: string
  isMine: boolean
}

export interface ChatPartner {
  id: string
  nickname: string
  avatar: string
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const hm = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  if (isToday) return hm
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}

export async function fetchChatPartner(userId: string): Promise<ChatPartner | null> {
  const client = getSupabase()
  if (!client) return null

  const { data, error } = await client
    .from('profiles')
    .select('id, nickname, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id as string,
    nickname: (data.nickname as string) || '乡音旅人',
    avatar: (data.avatar_url as string) || '/images/avatar1.jpg',
  }
}

export async function getOrCreateConversation(otherUserId: string): Promise<string | null> {
  const client = getSupabase()
  if (!client) return null

  const { data, error } = await client.rpc('get_or_create_dm_conversation', {
    other_user_id: otherUserId,
  })

  if (error) {
    console.warn('[chat] 创建会话失败:', error.message)
    return null
  }
  return data as string
}

export async function fetchChatMessages(conversationId: string): Promise<ChatMessage[]> {
  const userId = await getAuthUserId()
  const client = getSupabase()
  if (!client || !userId) return []

  const { data, error } = await client
    .from('direct_messages')
    .select('id, content, sender_id, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) {
    console.warn('[chat] 拉取消息失败:', error.message)
    return []
  }

  return (data ?? []).map(row => ({
    id: row.id as string,
    content: row.content as string,
    senderId: row.sender_id as string,
    createdAt: row.created_at as string,
    time: formatMessageTime(row.created_at as string),
    isMine: row.sender_id === userId,
  }))
}

export async function sendChatMessage(
  conversationId: string,
  content: string,
): Promise<{ ok: boolean; message?: ChatMessage }> {
  const userId = await getAuthUserId()
  if (!userId) return { ok: false }
  const client = getSupabase()
  if (!client) return { ok: false }

  const trimmed = content.trim()
  if (!trimmed) return { ok: false }

  const { data, error } = await client
    .from('direct_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: trimmed,
    })
    .select('id, content, sender_id, created_at')
    .single()

  if (error || !data) {
    console.warn('[chat] 发送失败:', error?.message)
    return { ok: false }
  }

  await client
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return {
    ok: true,
    message: {
      id: data.id as string,
      content: data.content as string,
      senderId: data.sender_id as string,
      createdAt: data.created_at as string,
      time: formatMessageTime(data.created_at as string),
      isMine: true,
    },
  }
}
