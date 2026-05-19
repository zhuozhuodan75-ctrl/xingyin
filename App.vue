<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('乡音 App Launch')
})

onShow(() => {
  console.log('乡音 App Show')
})

onHide(() => {
  console.log('乡音 App Hide')
})
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #F5F1E8;
  color: #3E3E3E;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* 通用容器 */
.container {
  min-height: 100vh;
  background-color: #F5F1E8;
  padding-bottom: 120rpx;
}

/* 卡片通用样式 */
.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

/* 按钮样式 */
.btn-primary {
  background: #E67E22;
  color: #FFFFFF;
  border-radius: 40rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.btn-secondary {
  background: #2D5016;
  color: #FFFFFF;
  border-radius: 40rpx;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  font-weight: 500;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

/* 文字样式 */
.text-primary {
  color: #2D5016;
}

.text-accent {
  color: #E67E22;
}

.text-warm {
  color: #8B2635;
}

.text-gray {
  color: #9E9E9E;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes wave {
  0%, 100% {
    height: 10rpx;
  }
  50% {
    height: 40rpx;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
