<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { formatDuration, generateWaveform } from '@/utils/audio.js'

// 创作模式
const modes = [
  { id: 'story', name: '方言故事', icon: '📖', desc: '讲述家乡的趣事' },
  { id: 'challenge', name: '趣味挑战', icon: '🎯', desc: '参与方言挑战' },
  { id: 'free', name: '自由录制', icon: '🎤', desc: '随心记录乡音' }
]

const currentMode = ref('story')

// 录音状态
const isRecording = ref(false)
const recordDuration = ref(0)
const recordTimer = ref(null)
const waveformData = ref([])
const waveformTimer = ref(null)

// 录音文件路径
const recordFilePath = ref('')

// 格式化录音时长
const formattedDuration = computed(() => {
  return formatDuration(recordDuration.value)
})

// 选择模式
const selectMode = (modeId) => {
  currentMode.value = modeId
}

// 开始录音
const startRecording = () => {
  // 请求录音权限
  uni.authorize({
    scope: 'scope.record',
    success: () => {
      isRecording.value = true
      recordDuration.value = 0
      
      // 开始计时
      recordTimer.value = setInterval(() => {
        recordDuration.value++
      }, 1000)
      
      // 生成波形动画
      waveformTimer.value = setInterval(() => {
        waveformData.value = generateWaveform(20)
      }, 100)
      
      // 开始录音
      const recorderManager = uni.getRecorderManager()
      recorderManager.start({
        duration: 600000,
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      })
      
      recorderManager.onStart(() => {
        console.log('录音开始')
      })
      
      recorderManager.onStop((res) => {
        recordFilePath.value = res.tempFilePath
        console.log('录音结束', res)
      })
    },
    fail: () => {
      uni.showModal({
        title: '提示',
        content: '需要录音权限才能录制乡音',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting()
          }
        }
      })
    }
  })
}

// 结束录音
const stopRecording = () => {
  if (!isRecording.value) return
  
  isRecording.value = false
  
  // 停止计时
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
    recordTimer.value = null
  }
  
  // 停止波形动画
  if (waveformTimer.value) {
    clearInterval(waveformTimer.value)
    waveformTimer.value = null
  }
  
  // 停止录音
  const recorderManager = uni.getRecorderManager()
  recorderManager.stop()
  
  // 跳转到宝藏卡生成页
  setTimeout(() => {
    const cardData = {
      user: {
        avatar: '/static/avatar/default.png',
        nickname: '我',
        region: '我的乡音'
      },
      content: currentMode.value === 'story' ? '方言故事' : currentMode.value === 'challenge' ? '趣味挑战' : '自由录制',
      duration: recordDuration.value,
      audioUrl: recordFilePath.value
    }
    uni.setStorageSync('cardData', JSON.stringify(cardData))
    uni.navigateTo({
      url: '/pages/card/card'
    })
  }, 500)
}

// 处理录音按钮触摸
const handleTouchStart = () => {
  startRecording()
}

const handleTouchEnd = () => {
  stopRecording()
}

onUnmounted(() => {
  if (recordTimer.value) {
    clearInterval(recordTimer.value)
  }
  if (waveformTimer.value) {
    clearInterval(waveformTimer.value)
  }
})
</script>

<template>
  <view class="container">
    <!-- 模式选择 -->
    <view class="mode-section">
      <text class="section-title">选择创作模式</text>
      <view class="mode-list">
        <view 
          v-for="mode in modes" 
          :key="mode.id"
          class="mode-item"
          :class="{ active: currentMode === mode.id }"
          @click="selectMode(mode.id)"
        >
          <text class="mode-icon">{{ mode.icon }}</text>
          <text class="mode-name">{{ mode.name }}</text>
          <text class="mode-desc">{{ mode.desc }}</text>
        </view>
      </view>
    </view>
    
    <!-- 录音区域 -->
    <view class="record-section">
      <!-- 波形显示 -->
      <view class="waveform-container">
        <view class="waveform">
          <view 
            v-for="(height, index) in (isRecording ? waveformData : generateWaveform(20, 0.3))" 
            :key="index"
            class="wave-bar"
            :style="{ height: height + 'rpx' }"
            :class="{ active: isRecording }"
          ></view>
        </view>
        
        <!-- 时长显示 -->
        <view class="duration-display" :class="{ recording: isRecording }">
          <text class="duration-text">{{ formattedDuration }}</text>
          <text v-if="isRecording" class="recording-tip">录音中...</text>
          <text v-else class="record-tip">按住下方按钮开始录音</text>
        </view>
      </view>
      
      <!-- 录音按钮 -->
      <view class="record-button-wrapper">
        <view 
          class="record-button"
          :class="{ recording: isRecording }"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <view class="button-inner">
            <text v-if="!isRecording" class="button-icon">🎤</text>
            <text v-else class="button-icon">⏹</text>
          </view>
          <view v-if="isRecording" class="recording-ring"></view>
        </view>
        <text class="button-hint">{{ isRecording ? '松手结束' : '按住录音' }}</text>
      </view>
    </view>
    
    <!-- 提示信息 -->
    <view class="tips-section">
      <view class="tip-item">
        <text class="tip-dot">•</text>
        <text class="tip-text">录音时长建议控制在 10-60 秒</text>
      </view>
      <view class="tip-item">
        <text class="tip-dot">•</text>
        <text class="tip-text">请在安静环境下录制，保证音质清晰</text>
      </view>
      <view class="tip-item">
        <text class="tip-dot">•</text>
        <text class="tip-text">录制完成后可生成专属乡音宝藏卡</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F1E8 0%, #EDE8DC 100%);
  padding: 32rpx;
}

.mode-section {
  margin-bottom: 48rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #3E3E3E;
    margin-bottom: 24rpx;
    display: block;
  }
  
  .mode-list {
    display: flex;
    gap: 20rpx;
    
    .mode-item {
      flex: 1;
      background: #FFFFFF;
      border-radius: 20rpx;
      padding: 28rpx 20rpx;
      text-align: center;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
      border: 2rpx solid transparent;
      transition: all 0.3s ease;
      
      &.active {
        border-color: #2D5016;
        background: linear-gradient(135deg, #FFFFFF 0%, #F0F7EC 100%);
      }
      
      .mode-icon {
        font-size: 48rpx;
        display: block;
        margin-bottom: 12rpx;
      }
      
      .mode-name {
        font-size: 26rpx;
        font-weight: 500;
        color: #3E3E3E;
        display: block;
        margin-bottom: 6rpx;
      }
      
      .mode-desc {
        font-size: 20rpx;
        color: #9E9E9E;
      }
    }
  }
}

.record-section {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 40rpx;
}

.waveform-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
  
  .waveform {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    height: 120rpx;
    margin-bottom: 32rpx;
    
    .wave-bar {
      width: 8rpx;
      background: #E0E0E0;
      border-radius: 4rpx;
      transition: all 0.1s ease;
      
      &.active {
        background: linear-gradient(180deg, #2D5016 0%, #4A7C2A 100%);
        animation: wave 0.5s ease-in-out infinite;
        
        @for $i from 1 through 20 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.05s;
          }
        }
      }
    }
  }
  
  .duration-display {
    text-align: center;
    
    &.recording {
      .duration-text {
        color: #8B2635;
      }
    }
    
    .duration-text {
      font-size: 64rpx;
      font-weight: 300;
      color: #3E3E3E;
      font-variant-numeric: tabular-nums;
      display: block;
      margin-bottom: 12rpx;
    }
    
    .recording-tip {
      font-size: 28rpx;
      color: #8B2635;
      font-weight: 500;
    }
    
    .record-tip {
      font-size: 26rpx;
      color: #9E9E9E;
    }
  }
}

.record-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .record-button {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #E67E22 0%, #D35400 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 8rpx 32rpx rgba(230, 126, 34, 0.4);
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    &.recording {
      background: linear-gradient(135deg, #8B2635 0%, #6B1E29 100%);
      box-shadow: 0 8rpx 32rpx rgba(139, 38, 53, 0.4);
      
      .recording-ring {
        position: absolute;
        width: 220rpx;
        height: 220rpx;
        border: 4rpx solid rgba(139, 38, 53, 0.3);
        border-radius: 50%;
        animation: pulse-ring 1.5s ease-out infinite;
      }
    }
    
    .button-inner {
      .button-icon {
        font-size: 64rpx;
      }
    }
  }
  
  .button-hint {
    margin-top: 24rpx;
    font-size: 26rpx;
    color: #9E9E9E;
  }
}

.tips-section {
  background: rgba(45, 80, 22, 0.05);
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  
  .tip-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .tip-dot {
      color: #2D5016;
      font-size: 24rpx;
      margin-right: 12rpx;
      line-height: 36rpx;
    }
    
    .tip-text {
      font-size: 24rpx;
      color: #666666;
      line-height: 36rpx;
    }
  }
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1.2);
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
</style>
