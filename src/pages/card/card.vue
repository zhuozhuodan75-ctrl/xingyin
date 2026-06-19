<script setup>
import { ref, computed, onMounted } from 'vue'
import { drawRoundedRect, wrapText } from '@/utils/canvas.js'

// 卡片数据
const cardData = ref({
  user: {
    avatar: '/static/avatar/default.png',
    nickname: '乡音守护者',
    region: '四川·成都'
  },
  content: '巴适得板！今天天气好得很，出来喝茶晒太阳咯~',
  duration: 8,
  date: ''
})

// 模板风格
const templates = [
  { id: 'traditional', name: '传统', preview: '#8B2635', bg: 'linear-gradient(135deg, #8B2635 0%, #6B1E29 100%)' },
  { id: 'modern', name: '现代', preview: '#2D5016', bg: 'linear-gradient(135deg, #2D5016 0%, #4A7C2A 100%)' },
  { id: 'cute', name: '可爱', preview: '#E67E22', bg: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)' },
  { id: 'minimal', name: '极简', preview: '#3E3E3E', bg: 'linear-gradient(135deg, #3E3E3E 0%, #666666 100%)' }
]

const currentTemplate = ref('traditional')

// 可编辑内容
const editableContent = ref('')
const editableRegion = ref('')

// Canvas 相关
const canvasRef = ref(null)
const generatedImage = ref('')
const isGenerating = ref(false)

// 初始化数据
onMounted(() => {
  const storedData = uni.getStorageSync('cardData')
  if (storedData) {
    const parsed = JSON.parse(storedData)
    cardData.value = { ...cardData.value, ...parsed }
    editableContent.value = parsed.content || '记录美好乡音'
    editableRegion.value = parsed.user?.region || '我的乡音'
  }
  cardData.value.date = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// 选择模板
const selectTemplate = (templateId) => {
  currentTemplate.value = templateId
  generatedImage.value = ''
}

// 生成卡片
const generateCard = () => {
  isGenerating.value = true
  
  const ctx = uni.createCanvasContext('cardCanvas')
  const template = templates.find(t => t.id === currentTemplate.value)
  
  // 绘制背景
  const gradientColors = {
    traditional: ['#8B2635', '#6B1E29'],
    modern: ['#2D5016', '#4A7C2A'],
    cute: ['#E67E22', '#F39C12'],
    minimal: ['#3E3E3E', '#666666']
  }
  
  const colors = gradientColors[currentTemplate.value]
  const grd = ctx.createLinearGradient(0, 0, 0, 800)
  grd.addColorStop(0, colors[0])
  grd.addColorStop(1, colors[1])
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, 600, 800)
  
  // 绘制装饰元素
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.beginPath()
  ctx.arc(500, 100, 150, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(-50, 700, 100, 0, Math.PI * 2)
  ctx.fill()
  
  // 绘制标题
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('乡音', 300, 80)
  
  ctx.font = '20px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.fillText('听见一方水土，留住一缕乡音', 300, 115)
  
  // 绘制内容区域
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
  drawRoundedRect(ctx, 40, 160, 520, 380, 20)
  ctx.fill()
  
  // 绘制地区标签
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('📍 ' + editableRegion.value, 70, 210)
  
  // 绘制内容文字
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '32px sans-serif'
  wrapText(ctx, editableContent.value, 70, 270, 460, 48)
  
  // 绘制时长
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '22px sans-serif'
  ctx.fillText('🎵 ' + cardData.value.duration + '秒', 70, 480)
  
  // 绘制底部信息
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = '24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(cardData.value.date, 300, 650)
  
  ctx.font = '20px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.fillText('—— 来自「乡音」APP ——', 300, 690)
  
  // 绘制二维码区域
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(250, 720, 100, 100)
  ctx.fillStyle = '#333333'
  ctx.font = '14px sans-serif'
  ctx.fillText('扫码听乡音', 300, 775)
  
  ctx.draw(false, () => {
    setTimeout(() => {
      uni.canvasToTempFilePath({
        canvasId: 'cardCanvas',
        success: (res) => {
          generatedImage.value = res.tempFilePath
          isGenerating.value = false
        },
        fail: () => {
          isGenerating.value = false
          uni.showToast({
            title: '生成失败',
            icon: 'none'
          })
        }
      })
    }, 500)
  })
}

// 保存到相册
const saveToAlbum = () => {
  if (!generatedImage.value) {
    uni.showToast({
      title: '请先生成卡片',
      icon: 'none'
    })
    return
  }
  
  uni.authorize({
    scope: 'scope.writePhotosAlbum',
    success: () => {
      uni.saveImageToPhotosAlbum({
        filePath: generatedImage.value,
        success: () => {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    },
    fail: () => {
      uni.showModal({
        title: '提示',
        content: '需要相册权限才能保存图片',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting()
          }
        }
      })
    }
  })
}

// 分享卡片
const shareCard = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}
</script>

<template>
  <view class="container">
    <!-- 模板选择 -->
    <view class="template-section">
      <text class="section-title">选择卡片风格</text>
      <view class="template-list">
        <view 
          v-for="template in templates" 
          :key="template.id"
          class="template-item"
          :class="{ active: currentTemplate === template.id }"
          @click="selectTemplate(template.id)"
        >
          <view class="template-preview" :style="{ background: template.preview }"></view>
          <text class="template-name">{{ template.name }}</text>
        </view>
      </view>
    </view>
    
    <!-- 编辑区域 -->
    <view class="edit-section">
      <text class="section-title">编辑内容</text>
      <view class="edit-item">
        <text class="edit-label">地区</text>
        <input 
          v-model="editableRegion" 
          class="edit-input" 
          placeholder="输入地区名称"
          maxlength="20"
        />
      </view>
      <view class="edit-item">
        <text class="edit-label">内容</text>
        <textarea 
          v-model="editableContent" 
          class="edit-textarea" 
          placeholder="输入方言内容"
          maxlength="100"
        />
        <text class="char-count">{{ editableContent.length }}/100</text>
      </view>
    </view>
    
    <!-- 预览区域 -->
    <view class="preview-section">
      <text class="section-title">预览</text>
      <view class="preview-card">
        <!-- Canvas 绘制 -->
        <canvas 
          v-if="!generatedImage"
          canvas-id="cardCanvas" 
          id="cardCanvas"
          class="card-canvas"
          style="width: 600rpx; height: 800rpx;"
        ></canvas>
        
        <!-- 生成的图片 -->
        <image 
          v-else
          :src="generatedImage" 
          class="generated-image"
          mode="aspectFit"
        ></image>
        
        <!-- 生成中提示 -->
        <view v-if="isGenerating" class="generating-mask">
          <view class="loading-spinner"></view>
          <text>生成中...</text>
        </view>
      </view>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-section">
      <view class="action-btn generate" @click="generateCard">
        <text>{{ generatedImage ? '重新生成' : '生成卡片' }}</text>
      </view>
      <view class="action-row">
        <view class="action-btn secondary" @click="saveToAlbum">
          <text>💾 保存相册</text>
        </view>
        <view class="action-btn secondary" @click="shareCard">
          <text>📤 分享</text>
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

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #3E3E3E;
  margin-bottom: 20rpx;
  display: block;
}

.template-section {
  margin-bottom: 32rpx;
  
  .template-list {
    display: flex;
    gap: 20rpx;
    
    .template-item {
      flex: 1;
      text-align: center;
      
      &.active {
        .template-preview {
          border-color: #E67E22;
          transform: scale(1.05);
        }
        .template-name {
          color: #E67E22;
          font-weight: 500;
        }
      }
      
      .template-preview {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 20rpx;
        border: 4rpx solid transparent;
        margin-bottom: 12rpx;
        transition: all 0.3s ease;
      }
      
      .template-name {
        font-size: 24rpx;
        color: #666666;
      }
    }
  }
}

.edit-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .edit-item {
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .edit-label {
      font-size: 26rpx;
      color: #666666;
      margin-bottom: 12rpx;
      display: block;
    }
    
    .edit-input {
      height: 80rpx;
      background: #F8F8F8;
      border-radius: 16rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #3E3E3E;
    }
    
    .edit-textarea {
      height: 160rpx;
      background: #F8F8F8;
      border-radius: 16rpx;
      padding: 20rpx 24rpx;
      font-size: 28rpx;
      color: #3E3E3E;
      width: 100%;
      box-sizing: border-box;
    }
    
    .char-count {
      font-size: 22rpx;
      color: #9E9E9E;
      text-align: right;
      display: block;
      margin-top: 8rpx;
    }
  }
}

.preview-section {
  margin-bottom: 32rpx;
  
  .preview-card {
    background: #FFFFFF;
    border-radius: 24rpx;
    padding: 32rpx;
    display: flex;
    justify-content: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
    position: relative;
    
    .card-canvas {
      width: 600rpx;
      height: 800rpx;
    }
    
    .generated-image {
      width: 600rpx;
      height: 800rpx;
      border-radius: 16rpx;
    }
    
    .generating-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 24rpx;
      
      .loading-spinner {
        width: 60rpx;
        height: 60rpx;
        border: 4rpx solid #EEEEEE;
        border-top-color: #E67E22;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #666666;
      }
    }
  }
}

.action-section {
  .action-btn {
    border-radius: 40rpx;
    padding: 28rpx 0;
    text-align: center;
    font-size: 30rpx;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
    
    &.generate {
      background: linear-gradient(135deg, #E67E22 0%, #D35400 100%);
      color: #FFFFFF;
      margin-bottom: 20rpx;
      box-shadow: 0 8rpx 24rpx rgba(230, 126, 34, 0.3);
    }
    
    &.secondary {
      flex: 1;
      background: #FFFFFF;
      color: #3E3E3E;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    }
  }
  
  .action-row {
    display: flex;
    gap: 20rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
