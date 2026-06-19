import type { User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

export interface UserProfile {
  id: string
  nickname: string
  handle: string
  avatar_url: string | null
  email: string | null
}

export interface AuthResult {
  ok: boolean
  message?: string
  needsEmailConfirm?: boolean
  user?: User
  profile?: UserProfile | null
}

function getClient() {
  const client = getSupabase()
  if (!client) {
    throw new Error('Supabase 未配置，请检查 .env')
  }
  return client
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) return '邮箱或密码错误'
  if (lower.includes('email not confirmed')) return '请先到邮箱完成注册确认'
  if (lower.includes('user already registered')) return '该邮箱已注册，请直接登录'
  if (lower.includes('password') && lower.includes('6')) return '密码至少 6 位'
  if (lower.includes('unable to validate email')) return '邮箱格式不正确'
  return message
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const client = getSupabase()
  if (!client) return null

  const { data, error } = await client
    .from('profiles')
    .select('id, nickname, handle, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[auth] 读取 profile 失败:', error.message)
    return null
  }

  if (!data) return null

  const { data: userData } = await client.auth.getUser()
  return {
    id: data.id,
    nickname: data.nickname,
    handle: data.handle,
    avatar_url: data.avatar_url,
    email: userData.user?.email ?? null,
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const client = getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })

    if (error) {
      return { ok: false, message: mapAuthError(error.message) }
    }

    const profile = data.user ? await fetchUserProfile(data.user.id) : null
    return { ok: true, user: data.user, profile }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : '登录失败' }
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname = '乡音旅人',
): Promise<AuthResult> {
  try {
    const client = getClient()
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
          avatar_url: '/images/avatar1.jpg',
        },
      },
    })

    if (error) {
      return { ok: false, message: mapAuthError(error.message) }
    }

    if (!data.session) {
      return {
        ok: true,
        needsEmailConfirm: true,
        message: '注册成功，请查收确认邮件后再登录',
        user: data.user ?? undefined,
      }
    }

    const profile = data.user ? await fetchUserProfile(data.user.id) : null
    return { ok: true, user: data.user ?? undefined, profile }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : '注册失败' }
  }
}

export async function signOutUser(): Promise<AuthResult> {
  try {
    const client = getClient()
    const { error } = await client.auth.signOut()
    if (error) {
      return { ok: false, message: mapAuthError(error.message) }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : '退出失败' }
  }
}

export async function updateUserProfile(
  userId: string,
  updates: { nickname?: string; avatar_url?: string },
): Promise<AuthResult> {
  try {
    const client = getClient()
    const { error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return { ok: false, message: error.message }
    }

    const profile = await fetchUserProfile(userId)
    return { ok: true, profile }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : '保存失败' }
  }
}
