import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}

// 开发时在控制台确认入口已执行（若看不到此行，说明 /main 未加载）
if (typeof console !== 'undefined') {
  console.log('[乡音] main.js loaded')
}
