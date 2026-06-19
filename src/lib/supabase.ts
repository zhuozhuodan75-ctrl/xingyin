import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** 是否已在 .env 中配置 Supabase */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

let client: SupabaseClient | null = null

/** 获取 Supabase 客户端；未配置时返回 null */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

/** 默认导出的 Supabase 客户端，未配置时为 null */
export const supabase = getSupabase()
