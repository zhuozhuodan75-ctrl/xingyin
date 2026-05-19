<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SoundCard from '@/components/SoundCard/SoundCard.vue'

// 音频数据列表
const audioList = ref([
  {
    id: 1,
    user: {
      avatar: '/static/avatar/avatar1.png',
      nickname: '蜀中小调',
      region: '四川·成都'
    },
    content: '巴适得板！今天天气好得很，出来喝茶晒太阳咯~',
    translation: '太舒服了！今天天气很好，出来喝茶晒太阳吧~',
    audioUrl: '',
    duration: 8,
    likes: 328,
    comments: 56,
    isLiked: false
  },
  {
    id: 2,
    user: {
      avatar: '/static/avatar/avatar2.png',
      nickname: '粤语传承',
      region: '广东·广州'
    },
    content: '食咗饭未呀？一齐去饮早茶啦！',
    translation: '吃了饭没有？一起去喝早茶吧！',
    audioUrl: '',
    duration: 5,
    likes: 256,
    comments: 42,
    isLiked: true
  },
  {
    id: 3,
    user: {
      avatar: '/static/avatar/avatar3.png',
      nickname: '东北老铁',
      region: '辽宁·沈阳'
    },
    content: '哎呀妈呀，这大冷天的，赶紧进屋暖和暖和！',
    translation: '哎呀，这么冷的天气，赶紧进屋暖和一下吧！',
    audioUrl: '',
    duration: 6,
    likes: 412,
    comments: 78,
    isLiked: false
  },
  {
    id: 4,
    user: {
      avatar: '/static/avatar/avatar4.png',
      nickname: '吴侬软语',
      region: '江苏·苏州'
    },
    content: '倷好呀，今朝天气蛮好个，出去白相相。',
    translation: '你好呀，今天天气挺好的，出去玩玩。',
    audioUrl: '',
    duration: 7,
    likes: 189,
    comments: 33,
    isLiked: false
  },
  {
    id: 5,
    user: {
      avatar: '/static/avatar/avatar5.png',
      nickname: '闽南乡音',
      region: '福建·厦门'
    },
    content: '哩厚！食饱未？来泡一泡铁观音。',
    translation: '你好！吃饱了吗？来泡一杯铁观音。',
    audioUrl: '',
    duration: 6,
    likes: 267,
    comments: 45,
    isLiked: false
  }
])

// 当前播放的音频ID
const currentPlayingId = ref(null)

// 切换播放状态
const togglePlay = (id) => {
  if (currentPlayingId.value === id) {
    currentPlayingId.value = null
  } else {
    currentPlayingId.value = id
  }
}

// 点赞处理
const handleLike = (id) => {
  const item = audioList.value.find(item => item.id === id)
  if (item) {
    item.isLiked = !item.isLiked
    item.likes += item.isLiked ? 1 : -1
  }
}

// 评论处理
const handleComment = (id) => {
  uni.navigateTo({
    url: `/pages/comment/comment?id=${id}`
  })
}

// 分享/生成宝藏卡
const handleShare = (item) => {
  uni.setStorageSync('cardData', JSON.stringify(item))
  uni.navigateTo({
    url: '/pages/card/card'
  })
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    uni.stopPullDownRefresh()
    uni.showToast({
      title: '已刷新',
      icon: 'none'
    })
  }, 1000)
}

onMounted(() => {
  // 页面加载逻辑
})

onUnmounted(() => {
  currentPlayingId.value = null
})
</script>

<template>
  <view class="container">
    <!-- 顶部标题区 -->
    <view class="header">
      <view class="logo-section">
        <text class="logo-text">乡音</text>
        <text class="logo-subtitle">听见一方水土，留住一缕乡音</text>
      </view>
    </view>
    
    <!-- 音频卡片流 -->
    <view class="card-flow">
      <view 
        v-for="item in audioList" 
        :key="item.id"
        class="card-wrapper"
      >
        <SoundCard
          :data="item"
          :is-playing="currentPlayingId === item.id"
          @play="togglePlay"
          @like="handleLike"
          @comment="handleComment"
          @share="handleShare"
        />
      </view>
    </view>
    
    <!-- 底部提示 -->
    <view class="bottom-tip">
      <text class="tip-text">— 已经到底啦，去录制你的乡音吧 —</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F1E8 0%, #EDE8DC 100%);
  padding-bottom: 40rpx;
}

.header {
  padding: 40rpx 32rpx;
  
  .logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .logo-text {
      font-size: 56rpx;
      font-weight: 700;
      color: #2D5016;
      letter-spacing: 8rpx;
      margin-bottom: 12rpx;
    }
    
    .logo-subtitle {
      font-size: 24rpx;
      color: #9E9E9E;
      letter-spacing: 2rpx;
    }
  }
}

.card-flow {
  padding: 0 24rpx;
  
  .card-wrapper {
    margin-bottom: 32rpx;
  }
}

.bottom-tip {
  text-align: center;
  padding: 40rpx 0;
  
  .tip-text {
    font-size: 24rpx;
    color: #9E9E9E;
  }
}
</style>
