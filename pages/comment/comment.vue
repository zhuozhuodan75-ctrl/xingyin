<script setup>
import { computed } from 'vue'

const postId = computed(() => {
  // uni-app 页面参数：在 onLoad 中取更标准；这里用最小占位实现
  const pages = getCurrentPages()
  const current = pages?.[pages.length - 1]
  return current?.options?.id || ''
})

const comingSoon = () => {
  uni.showToast({
    title: '评论功能接入 Supabase 后上线',
    icon: 'none'
  })
}
</script>

<template>
  <view class="container">
    <view class="card placeholder">
      <text class="title">评论</text>
      <text class="desc">
        该页面为占位页：后续将接入 Supabase 的 comments / profiles / posts 相关查询与写入。
      </text>
      <view v-if="postId" class="meta">
        <text class="meta-label">作品 ID</text>
        <text class="meta-value">{{ postId }}</text>
      </view>
      <view class="btn-primary action" @click="comingSoon">
        <text>我知道了</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.placeholder {
  margin: 24rpx;
  padding: 32rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2D5016;
  display: block;
  margin-bottom: 16rpx;
}

.desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.7;
  display: block;
  margin-bottom: 24rpx;
}

.meta {
  background: #F8F8F8;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-label {
  font-size: 24rpx;
  color: #9E9E9E;
}

.meta-value {
  font-size: 24rpx;
  color: #3E3E3E;
  font-variant-numeric: tabular-nums;
}

.action {
  width: 100%;
}
</style>

