<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { formatDuration, generateWaveform } from '@/utils/audio.js'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['play', 'like', 'comment', 'share'])

// 波形数据
const waveformData = ref(generateWaveform(30, 0.5))
let waveformTimer = null

// 格式化时长
const formattedDuration = computed(() => {
  return formatDuration(props.data.duration)
})

// 播放/暂停
const togglePlay = () => {
  emit('play', props.data.id)
  
  if (!props.isPlaying) {
    // 开始波形动画
    waveformTimer = setInterval(() => {
      waveformData.value = generateWaveform(30)
    }, 150)
  } else {
    // 停止波形动画
    if (waveformTimer) {
      clearInterval(waveformTimer)
      waveformTimer = null
    }
  }
}

// 点赞
const handleLike = () => {
  emit('like', props.data.id)
}

// 评论
const handleComment = () => {
  emit('comment', props.data.id)
}

// 分享
const handleShare = () => {
  emit('share', props.data)
}

onUnmounted(() => {
  if (waveformTimer) {
    clearInterval(waveformTimer)
  }
})
</script>

<template>
  <view class="sound-card">
    <!-- 用户信息 -->
    <view class="user-section">
      <image class="user-avatar" :src="data.user.avatar" mode="aspectFill"></image>
      <view class="user-info">
        <text class="user-name">{{ data.user.nickname }}</text>
        <view class="user-region">
          <text class="region-icon">📍</text>
          <text class="region-text">{{ data.user.region }}</text>
        </view>
      </view>
      <view class="more-btn">
        <text class="more-dots">···</text>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view class="content-section">
      <text class="dialect-text">{{ data.content }}</text>
      <text v-if="data.translation" class="translation-text">{{ data.translation }}</text>
    </view>
    
    <!-- 音频播放器 -->
    <view class="audio-section">
      <view class="play-btn" :class="{ playing: isPlaying }" @click="togglePlay">
        <text class="play-icon">{{ isPlaying ? '⏸' : '▶' }}</text>
      </view>
      
      <!-- 波形动画 -->
      <view class="waveform">
        <view 
          v-for="(height, index) in waveformData" 
          :key="index"
          class="wave-bar"
          :style="{ height: height + 'rpx' }"
          :class="{ active: isPlaying }"
        ></view>
      </view>
      
      <text class="duration">{{ formattedDuration }}</text>
    </view>
    
    <!-- 互动区域 -->
    <view class="action-section">
      <view class="action-item" :class="{ active: data.isLiked }" @click="handleLike">
        <text class="action-icon">{{ data.isLiked ? '❤️' : '🤍' }}</text>
        <text class="action-count">{{ data.likes }}</text>
      </view>
      <view class="action-item" @click="handleComment">
        <text class="action-icon">💬</text>
        <text class="action-count">{{ data.comments }}</text>
      </view>
      <view class="action-item" @click="handleShare">
        <text class="action-icon">🎴</text>
        <text class="action-text">生成宝藏卡</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.sound-card {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.99);
  }
}

.user-section {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  .user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    border: 2rpx solid #F5F1E8;
  }
  
  .user-info {
    flex: 1;
    
    .user-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #3E3E3E;
      display: block;
      margin-bottom: 6rpx;
    }
    
    .user-region {
      display: flex;
      align-items: center;
      
      .region-icon {
        font-size: 18rpx;
        margin-right: 4rpx;
      }
      
      .region-text {
        font-size: 22rpx;
        color: #9E9E9E;
      }
    }
  }
  
  .more-btn {
    padding: 8rpx 16rpx;
    
    .more-dots {
      font-size: 32rpx;
      color: #9E9E9E;
      font-weight: bold;
    }
  }
}

.content-section {
  margin-bottom: 24rpx;
  
  .dialect-text {
    font-size: 32rpx;
    color: #3E3E3E;
    line-height: 1.6;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .translation-text {
    font-size: 26rpx;
    color: #9E9E9E;
    line-height: 1.5;
    display: block;
    padding: 16rpx 20rpx;
    background: #F8F8F8;
    border-radius: 12rpx;
    border-left: 4rpx solid #2D5016;
  }
}

.audio-section {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #F5F1E8 0%, #EDE8DC 100%);
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 24rpx;
  
  .play-btn {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #2D5016 0%, #4A7C2A 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    &.playing {
      background: linear-gradient(135deg, #8B2635 0%, #6B1E29 100%);
    }
    
    .play-icon {
      color: #FFFFFF;
      font-size: 28rpx;
      margin-left: 4rpx;
    }
  }
  
  .waveform {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    height: 60rpx;
    overflow: hidden;
    
    .wave-bar {
      width: 4rpx;
      background: #D0C8B8;
      border-radius: 2rpx;
      transition: all 0.15s ease;
      
      &.active {
        background: linear-gradient(180deg, #2D5016 0%, #4A7C2A 100%);
        animation: wave 0.5s ease-in-out infinite;
        
        @for $i from 1 through 30 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.03s;
          }
        }
      }
    }
  }
  
  .duration {
    font-size: 24rpx;
    color: #9E9E9E;
    margin-left: 16rpx;
    font-variant-numeric: tabular-nums;
  }
}

.action-section {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 2rpx solid #F5F5F5;
  
  .action-item {
    display: flex;
    align-items: center;
    margin-right: 40rpx;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.95);
    }
    
    &.active {
      .action-count {
        color: #8B2635;
      }
    }
    
    &:last-child {
      margin-right: 0;
      margin-left: auto;
    }
    
    .action-icon {
      font-size: 32rpx;
      margin-right: 8rpx;
    }
    
    .action-count {
      font-size: 24rpx;
      color: #666666;
    }
    
    .action-text {
      font-size: 24rpx;
      color: #2D5016;
    }
  }
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.6);
  }
  50% {
    transform: scaleY(1.4);
  }
}
</style>
