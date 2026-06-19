const STORAGE_KEY = 'xiangyin-settings'

export interface AppSettings {
  notifications: Record<string, boolean>
  privacy: Record<string, boolean>
  darkMode: boolean
  fontSize: number
}

const defaults: AppSettings = {
  notifications: {
    push: true,
    reminder: true,
    comment: true,
    like: false,
  },
  privacy: {
    public: true,
    location: false,
    mic: true,
  },
  darkMode: false,
  fontSize: 15,
}

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults, notifications: { ...defaults.notifications }, privacy: { ...defaults.privacy } }
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      notifications: { ...defaults.notifications, ...parsed.notifications },
      privacy: { ...defaults.privacy, ...parsed.privacy },
      darkMode: parsed.darkMode ?? defaults.darkMode,
      fontSize: parsed.fontSize ?? defaults.fontSize,
    }
  } catch {
    return { ...defaults, notifications: { ...defaults.notifications }, privacy: { ...defaults.privacy } }
  }
}

export function saveAppSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function applyAppSettings(settings: AppSettings) {
  document.documentElement.classList.toggle('dark', settings.darkMode)
  document.documentElement.style.fontSize = `${settings.fontSize}px`
  const shell = document.getElementById('app-shell')
  if (shell) {
    shell.classList.toggle('app-dark', settings.darkMode)
    shell.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
  }
}

export function estimateCacheSize(): string {
  let bytes = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    bytes += key.length + (localStorage.getItem(key)?.length ?? 0)
  }
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** 清除缓存，保留登录、打卡与设置 */
export function clearAppCache(): void {
  const keep = new Set(['xiangyin-settings', 'xiangyin-checkins'])
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (keep.has(key) || key.startsWith('sb-')) continue
    keys.push(key)
  }
  keys.forEach(k => localStorage.removeItem(k))
}
