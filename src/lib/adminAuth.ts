import { getSupabase } from './supabase'
import { signInWithEmail } from './auth'

const ADMIN_SESSION_KEY = 'xiangyin_admin_session'

export function isAdminSessionActive(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

export async function verifyAdminRole(): Promise<boolean> {
  const client = getSupabase()
  if (!client) return false

  const { data: { user } } = await client.auth.getUser()
  if (!user) return false

  const { data, error } = await client
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) return false
  return Boolean(data.is_admin)
}

/** App 内已登录管理员一键进入后台（免重复输密码） */
export async function enterAdminFromApp(): Promise<boolean> {
  const ok = await verifyAdminRole()
  if (!ok) return false
  sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
  return true
}

/**
 * 统一密码登录管理后台：
 * 1. 校验 VITE_ADMIN_PASSWORD
 * 2. 若当前浏览器已登录管理员账号（如桌卓单），直接放行
 * 3. 否则用 VITE_ADMIN_EMAIL + 同一密码登录 Supabase
 */
export async function adminLogin(password: string): Promise<{ ok: boolean; message?: string }> {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD
  if (!expected) {
    return { ok: false, message: '未配置 VITE_ADMIN_PASSWORD' }
  }

  if (password !== expected) {
    return { ok: false, message: '管理员密码错误' }
  }

  if (await verifyAdminRole()) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
    return { ok: true }
  }

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  if (!adminEmail) {
    return {
      ok: false,
      message: '请先在用户端登录管理员账号，或在 .env 配置 VITE_ADMIN_EMAIL',
    }
  }

  const result = await signInWithEmail(adminEmail, password)
  if (!result.ok) {
    return {
      ok: false,
      message: result.message ?? '登录失败。若统一密码与账号密码不同，请先在 App 登录管理员账号后再进后台',
    }
  }

  const isAdmin = await verifyAdminRole()
  if (!isAdmin) {
    return {
      ok: false,
      message: '该账号未开通管理员权限，请在 Supabase 将 profiles.is_admin 设为 true',
    }
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
  return { ok: true }
}

/** 仅退出管理后台，不影响用户端登录态 */
export async function adminLogout(): Promise<void> {
  clearAdminSession()
}

export async function ensureAdminAccess(): Promise<boolean> {
  if (!isAdminSessionActive()) return false
  return verifyAdminRole()
}
