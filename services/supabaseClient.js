/**
 * Supabase client 初始化（Uni-app 友好）
 *
 * 说明：
 * - 本项目当前未包含 package.json；你需要确保运行环境可解析 `@supabase/supabase-js`
 *   （例如通过 npm 安装并由构建工具打包，或在你的 Uni-app 项目依赖体系中引入）。
 * - 为兼容部分 Uni-app 运行时没有 fetch 的情况，提供了基于 `uni.request` 的轻量 fetch 兜底。
 */

let _config = {
  url: 'https://jcxafylawkcufmxfmtb.supabase.co',
  anonKey: 'sb_publishable_YoxuKzB9WjU_PG5HQQUKuA_4wvVEdhk'
}

let _client = null

export function setSupabaseConfig({ url, anonKey }) {
  _config = {
    url: url || '',
    anonKey: anonKey || ''
  }
  _client = null
}

function readConfigFromRuntime() {
  // 运行时注入优先（便于本地调试/热更新）
  if (_config.url && _config.anonKey) return _config

  // 允许通过 storage 注入（避免把 key 写死在代码里）
  // 你可以在应用启动时执行：
  // uni.setStorageSync('SUPABASE_URL', 'https://xxx.supabase.co')
  // uni.setStorageSync('SUPABASE_ANON_KEY', '...')
  const url = (typeof uni !== 'undefined' && uni.getStorageSync)
    ? uni.getStorageSync('SUPABASE_URL')
    : ''
  const anonKey = (typeof uni !== 'undefined' && uni.getStorageSync)
    ? uni.getStorageSync('SUPABASE_ANON_KEY')
    : ''

  // 兼容 H5/构建环境变量（如果你的打包器支持）
  const envUrl = typeof process !== 'undefined' ? process.env?.SUPABASE_URL : ''
  const envKey = typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : ''

  return {
    url: url || envUrl || '',
    anonKey: anonKey || envKey || ''
  }
}

function ensureFetch() {
  if (typeof globalThis.fetch === 'function') return
  if (typeof uni === 'undefined' || typeof uni.request !== 'function') {
    throw new Error('Supabase requires fetch. No fetch found and uni.request is unavailable.')
  }

  // 轻量 fetch 兜底：满足 supabase-js 基本调用
  globalThis.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url
    const method = (init.method || 'GET').toUpperCase()
    const header = init.headers || {}

    return new Promise((resolve, reject) => {
      uni.request({
        url,
        method,
        header,
        data: init.body,
        responseType: 'text',
        success: (res) => {
          const status = res.statusCode || 0
          const headers = res.header || {}
          const bodyText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data ?? '')

          resolve({
            ok: status >= 200 && status < 300,
            status,
            statusText: '',
            url,
            headers: {
              get(name) {
                const key = Object.keys(headers).find(k => k.toLowerCase() === String(name).toLowerCase())
                return key ? headers[key] : null
              }
            },
            text: async () => bodyText,
            json: async () => {
              try {
                return JSON.parse(bodyText)
              } catch {
                return bodyText
              }
            }
          })
        },
        fail: (err) => reject(err)
      })
    })
  }
}

export async function getSupabaseClient() {
  if (_client) return _client

  const { url, anonKey } = readConfigFromRuntime()
  if (!url || !anonKey) {
    throw new Error(
      'Supabase config missing. Please set SUPABASE_URL & SUPABASE_ANON_KEY via setSupabaseConfig() or uni.setStorageSync().'
    )
  }

  ensureFetch()

  let createClient
  try {
    // 动态 import：避免在未安装依赖时直接崩溃到编译阶段
    ;({ createClient } = await import('@supabase/supabase-js'))
  } catch (e) {
    throw new Error(
      'Missing dependency: @supabase/supabase-js. Please install it in your project dependency system.\n' +
      `Original error: ${e?.message || e}`
    )
  }

  _client = createClient(url, anonKey, {
    auth: {
      persistSession: true
    }
  })

  return _client
}

