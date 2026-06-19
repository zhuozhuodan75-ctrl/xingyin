<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 方言地区数据
const regions = ref([
  { name: '四川', icon: '🌶️', count: 1256, color: '#E74C3C' },
  { name: '广东', icon: '🍵', count: 2341, color: '#27AE60' },
  { name: '东北', icon: '🌨️', count: 1890, color: '#3498DB' },
  { name: '江浙', icon: '🏮', count: 1567, color: '#E67E22' },
  { name: '湖南', icon: '🌶️', count: 987, color: '#E74C3C' },
  { name: '福建', icon: '🍃', count: 1123, color: '#2ECC71' },
  { name: '山东', icon: '🍺', count: 1456, color: '#F39C12' },
  { name: '陕西', icon: '🏛️', count: 876, color: '#9B59B6' }
])

// 方言小百科数据
const triviaList = ref([
  {
    id: 1,
    title: '为什么四川话这么搞笑？',
    content: '四川话属于西南官话，语调抑扬顿挫，自带幽默感。"巴适"、"要得"等词汇更是深入人心。',
    tag: '冷知识'
  },
  {
    id: 2,
    title: '粤语为什么保留古音？',
    content: '粤语保留了大量中古汉语的发音特点，有"古汉语活化石"之称，诗词用粤语朗读更有韵味。',
    tag: '历史'
  },
  {
    id: 3,
    title: '东北话的传播力有多强？',
    content: '东北话被誉为"传染性最强"的方言，和东北人待一周，口音就会被带偏！',
    tag: '趣闻'
  },
  {
    id: 4,
    title: '吴侬软语有多软？',
    content: '苏州话被称为"吴侬软语"，语调轻柔婉转，素有"宁可听苏州人吵架"的说法。',
    tag: '文化'
  }
])

// 当前轮播的百科索引
const currentTriviaIndex = ref(0)
let triviaTimer = null

// 热门话题
const hotTopics = ref([
  { id: 1, title: '#方言挑战赛', count: '12.5万参与', trending: true },
  { id: 2, title: '#家乡的味道', count: '8.3万参与', trending: true },
  { id: 3, title: '#爷爷奶奶的口头禅', count: '5.6万参与', trending: false },
  { id: 4, title: '#方言版绕口令', count: '3.2万参与', trending: false }
])

// 开始百科轮播
const startTriviaCarousel = () => {
  triviaTimer = setInterval(() => {
    currentTriviaIndex.value = (currentTriviaIndex.value + 1) % triviaList.value.length
  }, 5000)
}

// 进入方言地图
const enterMap = () => {
  uni.showToast({
    title: '方言地图即将上线',
    icon: 'none'
  })
}

// 选择地区
const selectRegion = (region) => {
  uni.showToast({
    title: `进入${region.name}方言区`,
    icon: 'none'
  })
}

// 查看话题
const viewTopic = (topic) => {
  uni.showToast({
    title: `查看${topic.title}`,
    icon: 'none'
  })
}

onMounted(() => {
  startTriviaCarousel()
})

onUnmounted(() => {
  if (triviaTimer) {
    clearInterval(triviaTimer)
  }
})
</script>

<template>
  <view class="container">
    <!-- 方言地图入口 -->
    <view class="map-section" @click="enterMap">
      <view class="map-content">
        <view class="map-text">
          <text class="map-title">方言地图</text>
          <text class="map-subtitle">探索全国各地的方言文化</text>
          <view class="map-btn">
            <text>立即探索</text>
            <text class="arrow">→</text>
          </view>
        </view>
        <view class="map-icon">🗺️</view>
      </view>
      <view class="map-decoration"></view>
    </view>
    
    <!-- 热门方言地区 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门方言地区</text>
        <text class="section-more">查看更多</text>
      </view>
      <view class="region-grid">
        <view 
          v-for="region in regions" 
          :key="region.name"
          class="region-item"
          :style="{ background: `linear-gradient(135deg, ${region.color}15 0%, ${region.color}08 100%)` }"
          @click="selectRegion(region)"
        >
          <text class="region-icon">{{ region.icon }}</text>
          <text class="region-name">{{ region.name }}</text>
          <text class="region-count">{{ region.count }}条乡音</text>
        </view>
      </view>
    </view>
    
    <!-- 方言小百科 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">方言小百科</text>
        <view class="carousel-dots">
          <view 
            v-for="(item, index) in triviaList" 
            :key="item.id"
            class="dot"
            :class="{ active: currentTriviaIndex === index }"
          ></view>
        </view>
      </view>
      <view class="trivia-card">
        <view class="trivia-tag">{{ triviaList[currentTriviaIndex].tag }}</view>
        <text class="trivia-title">{{ triviaList[currentTriviaIndex].title }}</text>
        <text class="trivia-content">{{ triviaList[currentTriviaIndex].content }}</text>
      </view>
    </view>
    
    <!-- 热门话题 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门话题</text>
      </view>
      <view class="topic-list">
        <view 
          v-for="topic in hotTopics" 
          :key="topic.id"
          class="topic-item"
          @click="viewTopic(topic)"
        >
          <view class="topic-left">
            <text v-if="topic.trending" class="trending-icon">🔥</text>
            <text v-else class="topic-rank">{{ topic.id }}</text>
            <text class="topic-title">{{ topic.title }}</text>
          </view>
          <text class="topic-count">{{ topic.count }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F1E8 0%, #EDE8DC 100%);
  padding: 24rpx;
  padding-bottom: 140rpx;
}

.map-section {
  background: linear-gradient(135deg, #2D5016 0%, #4A7C2A 100%);
  border-radius: 28rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 40rpx;
  position: relative;
  overflow: hidden;
  
  .map-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    
    .map-text {
      .map-title {
        font-size: 40rpx;
        font-weight: 700;
        color: #FFFFFF;
        display: block;
        margin-bottom: 12rpx;
      }
      
      .map-subtitle {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        display: block;
        margin-bottom: 24rpx;
      }
      
      .map-btn {
        display: inline-flex;
        align-items: center;
        background: rgba(255, 255, 255, 0.2);
        padding: 12rpx 24rpx;
        border-radius: 30rpx;
        font-size: 24rpx;
        color: #FFFFFF;
        
        .arrow {
          margin-left: 8rpx;
        }
      }
    }
    
    .map-icon {
      font-size: 100rpx;
      opacity: 0.9;
    }
  }
  
  .map-decoration {
    position: absolute;
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    top: -100rpx;
    right: -100rpx;
  }
}

.section {
  margin-bottom: 40rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #3E3E3E;
    }
    
    .section-more {
      font-size: 24rpx;
      color: #9E9E9E;
    }
    
    .carousel-dots {
      display: flex;
      gap: 8rpx;
      
      .dot {
        width: 8rpx;
        height: 8rpx;
        border-radius: 50%;
        background: #E0E0E0;
        transition: all 0.3s ease;
        
        &.active {
          width: 20rpx;
          border-radius: 4rpx;
          background: #2D5016;
        }
      }
    }
  }
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  
  .region-item {
    border-radius: 20rpx;
    padding: 24rpx 12rpx;
    text-align: center;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      border-color: rgba(45, 80, 22, 0.2);
    }
    
    .region-icon {
      font-size: 48rpx;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .region-name {
      font-size: 26rpx;
      font-weight: 500;
      color: #3E3E3E;
      display: block;
      margin-bottom: 4rpx;
    }
    
    .region-count {
      font-size: 20rpx;
      color: #9E9E9E;
    }
  }
}

.trivia-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .trivia-tag {
    display: inline-block;
    background: linear-gradient(135deg, #8B2635 0%, #A03040 100%);
    color: #FFFFFF;
    font-size: 20rpx;
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    margin-bottom: 16rpx;
  }
  
  .trivia-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #3E3E3E;
    display: block;
    margin-bottom: 16rpx;
    line-height: 1.4;
  }
  
  .trivia-content {
    font-size: 26rpx;
    color: #666666;
    line-height: 1.6;
  }
}

.topic-list {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 16rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .topic-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
    border-bottom: 2rpx solid #F5F5F5;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background: #FAFAFA;
    }
    
    .topic-left {
      display: flex;
      align-items: center;
      
      .trending-icon {
        font-size: 28rpx;
        margin-right: 16rpx;
      }
      
      .topic-rank {
        width: 36rpx;
        height: 36rpx;
        background: #F5F5F5;
        border-radius: 50%;
        font-size: 22rpx;
        color: #9E9E9E;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16rpx;
      }
      
      .topic-title {
        font-size: 28rpx;
        color: #3E3E3E;
      }
    }
    
    .topic-count {
      font-size: 22rpx;
      color: #9E9E9E;
    }
  }
}
</style>
