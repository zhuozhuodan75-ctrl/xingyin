import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// 使用包名别名，避免 Windows 中文路径下绝对路径 /@fs/... 导致模块加载失败（白屏且无报错）
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      vue: '@dcloudio/uni-h5-vue'
    },
    dedupe: ['vue', '@dcloudio/uni-h5-vue']
  },
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: false
  }
})
