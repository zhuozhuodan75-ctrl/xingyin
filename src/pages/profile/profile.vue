<script setup>
import { ref, computed } from 'vue'

// 用户信息
const userInfo = ref({
  avatar: '/static/avatar/default.png',
  nickname: '乡音守护者',
  id: 'XY2024001',
  bio: '记录家乡的声音，传承方言文化',
  region: '四川·成都'
})

// 统计数据
const stats = ref({
  works: 12,
  likes: 568,
  following: 89,
  followers: 156
})

// 菜单列表
const menuList = ref([
  { id: 'works', name: '我的作品', icon: '🎵', count: 12 },
  { id: 'cards', name: '我的宝藏卡', icon: '🎴', count: 8 },
  { id: 'favorites', name: '我的收藏', icon: '⭐', count: 45 },
  { id: 'achievements', name: '成就徽章', icon: '🏆', count: 6 }
])

// 打卡数据
const checkInDays = ref([1, 2, 3, 5, 6, 8, 9, 10, 12, 15, 16, 17, 18, 19, 20])
const currentMonth = ref(new Date().getMonth() + 1)
const currentYear = ref(new Date().getFullYear())

// 连续打卡天数
const streakDays = ref(5)

// 生成日历数据
const calendarDays = computed(() => {
  const days = []
  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      checked: checkInDays.value.includes(i),
      isToday: i === new Date().getDate()
    })
  }
  
  return days
})

// 编辑资料
const editProfile = () => {
  uni.showToast({
    title: '编辑资料',
    icon: 'none'
  })
}

// 菜单点击
const handleMenuClick = (menu) => {
  uni.showToast({
    title: `进入${menu.name}`,
    icon: 'none'
  })
}

// 打卡
const checkIn = () => {
  const today = new Date().getDate()
  if (!checkInDays.value.includes(today)) {
    checkInDays.value.push(today)
    streakDays.value++
    uni.showToast({
      title: '打卡成功！',
      icon: 'success'
    })
  } else {
    uni.showToast({
      title: '今日已打卡',
      icon: 'none'
    })
  }
}

// 设置
const goSettings = () => {
  uni.showToast({
    title: '设置页面',
    icon: 'none'
  })
}
</script>

<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-header">
        <view class="avatar-section">
          <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
          <view class="avatar-badge">✓</view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text class="user-id">ID: {{ userInfo.id }}</text>
          <view class="region-tag">
            <text class="region-icon">📍</text>
            <text class="region-text">{{ userInfo.region }}</text>
          </view>
        </view>
        <view class="edit-btn" @click="editProfile">
          <text>编辑</text>
        </view>
      </view>
      <text class="user-bio">{{ userInfo.bio }}</text>
      
      <!-- 统计数据 -->
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ stats.works }}</text>
          <text class="stat-label">作品</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ stats.likes }}</text>
          <text class="stat-label">获赞</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ stats.following }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">{{ stats.followers }}</text>
          <text class="stat-label">粉丝</text>
        </view>
      </view>
    </view>
    
    <!-- 打卡日历 -->
    <view class="calendar-section">
      <view class="calendar-header">
        <view class="calendar-title">
          <text class="title-text">每日打卡</text>
          <view class="streak-badge">
            <text class="fire-icon">🔥</text>
            <text class="streak-text">连续{{ streakDays }}天</text>
          </view>
        </view>
        <view class="checkin-btn" :class="{ checked: checkInDays.includes(new Date().getDate()) }" @click="checkIn">
          <text>{{ checkInDays.includes(new Date().getDate()) ? '已打卡' : '打卡' }}</text>
        </view>
      </view>
      <view class="calendar-grid">
        <view 
          v-for="day in calendarDays" 
          :key="day.day"
          class="calendar-day"
          :class="{ checked: day.checked, today: day.isToday }"
        >
          <text class="day-num">{{ day.day }}</text>
          <text v-if="day.checked" class="check-mark">✓</text>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view 
        v-for="menu in menuList" 
        :key="menu.id"
        class="menu-item"
        @click="handleMenuClick(menu)"
      >
        <view class="menu-left">
          <text class="menu-icon">{{ menu.icon }}</text>
          <text class="menu-name">{{ menu.name }}</text>
        </view>
        <view class="menu-right">
          <text class="menu-count">{{ menu.count }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>
    
    <!-- 设置入口 -->
    <view class="settings-section" @click="goSettings">
      <view class="settings-left">
        <text class="settings-icon">⚙️</text>
        <text class="settings-name">设置</text>
      </view>
      <text class="settings-arrow">›</text>
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

.user-card {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .avatar-section {
      position: relative;
      margin-right: 24rpx;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid #F5F1E8;
      }
      
      .avatar-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 36rpx;
        height: 36rpx;
        background: #2D5016;
        border-radius: 50%;
        color: #FFFFFF;
        font-size: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid #FFFFFF;
      }
    }
    
    .user-info {
      flex: 1;
      
      .nickname {
        font-size: 36rpx;
        font-weight: 600;
        color: #3E3E3E;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .user-id {
        font-size: 22rpx;
        color: #9E9E9E;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .region-tag {
        display: inline-flex;
        align-items: center;
        background: rgba(45, 80, 22, 0.1);
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        
        .region-icon {
          font-size: 18rpx;
          margin-right: 4rpx;
        }
        
        .region-text {
          font-size: 20rpx;
          color: #2D5016;
        }
      }
    }
    
    .edit-btn {
      padding: 8rpx 20rpx;
      background: #F5F5F5;
      border-radius: 24rpx;
      font-size: 22rpx;
      color: #666666;
    }
  }
  
  .user-bio {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.5;
    display: block;
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 2rpx solid #F5F5F5;
  }
  
  .stats-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-num {
        font-size: 36rpx;
        font-weight: 600;
        color: #3E3E3E;
        margin-bottom: 4rpx;
      }
      
      .stat-label {
        font-size: 22rpx;
        color: #9E9E9E;
      }
    }
    
    .stat-divider {
      width: 2rpx;
      height: 40rpx;
      background: #EEEEEE;
    }
  }
}

.calendar-section {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .calendar-title {
      display: flex;
      align-items: center;
      
      .title-text {
        font-size: 30rpx;
        font-weight: 600;
        color: #3E3E3E;
        margin-right: 16rpx;
      }
      
      .streak-badge {
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, #FFF5E6 0%, #FFE4CC 100%);
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        
        .fire-icon {
          font-size: 20rpx;
          margin-right: 4rpx;
        }
        
        .streak-text {
          font-size: 20rpx;
          color: #E67E22;
        }
      }
    }
    
    .checkin-btn {
      padding: 10rpx 28rpx;
      background: linear-gradient(135deg, #E67E22 0%, #D35400 100%);
      border-radius: 28rpx;
      font-size: 24rpx;
      color: #FFFFFF;
      font-weight: 500;
      
      &.checked {
        background: #E0E0E0;
        color: #9E9E9E;
      }
    }
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12rpx;
    
    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      background: #F8F8F8;
      position: relative;
      
      &.checked {
        background: linear-gradient(135deg, #2D5016 0%, #4A7C2A 100%);
        
        .day-num {
          color: #FFFFFF;
        }
      }
      
      &.today {
        border: 2rpx solid #E67E22;
      }
      
      .day-num {
        font-size: 22rpx;
        color: #3E3E3E;
      }
      
      .check-mark {
        position: absolute;
        bottom: 4rpx;
        font-size: 16rpx;
        color: #FFFFFF;
      }
    }
  }
}

.menu-section {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 0 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 0;
    border-bottom: 2rpx solid #F5F5F5;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      opacity: 0.7;
    }
    
    .menu-left {
      display: flex;
      align-items: center;
      
      .menu-icon {
        font-size: 36rpx;
        margin-right: 16rpx;
      }
      
      .menu-name {
        font-size: 28rpx;
        color: #3E3E3E;
      }
    }
    
    .menu-right {
      display: flex;
      align-items: center;
      
      .menu-count {
        font-size: 24rpx;
        color: #9E9E9E;
        margin-right: 8rpx;
      }
      
      .menu-arrow {
        font-size: 32rpx;
        color: #CCCCCC;
      }
    }
  }
}

.settings-section {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  &:active {
    opacity: 0.7;
  }
  
  .settings-left {
    display: flex;
    align-items: center;
    
    .settings-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }
    
    .settings-name {
      font-size: 28rpx;
      color: #3E3E3E;
    }
  }
  
  .settings-arrow {
    font-size: 32rpx;
    color: #CCCCCC;
  }
}
</style>
