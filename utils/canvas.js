/**
 * Canvas 工具类
 * 提供 Canvas 绘制的通用函数
 */

/**
 * 绘制圆角矩形
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x - 左上角 x 坐标
 * @param {number} y - 左上角 y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {number} radius - 圆角半径
 */
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 绘制圆角矩形路径（不填充）
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x - 左上角 x 坐标
 * @param {number} y - 左上角 y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {number} radius - 圆角半径
 */
export function strokeRoundedRect(ctx, x, y, width, height, radius) {
  drawRoundedRect(ctx, x, y, width, height, radius)
  ctx.stroke()
}

/**
 * 填充圆角矩形
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x - 左上角 x 坐标
 * @param {number} y - 左上角 y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {number} radius - 圆角半径
 * @param {string} color - 填充颜色
 */
export function fillRoundedRect(ctx, x, y, width, height, radius, color) {
  ctx.save()
  ctx.fillStyle = color
  drawRoundedRect(ctx, x, y, width, height, radius)
  ctx.fill()
  ctx.restore()
}

/**
 * 文字自动换行
 * @param {Object} ctx - Canvas 上下文
 * @param {string} text - 要绘制的文字
 * @param {number} x - 起始 x 坐标
 * @param {number} y - 起始 y 坐标
 * @param {number} maxWidth - 最大宽度
 * @param {number} lineHeight - 行高
 * @returns {number} 实际绘制的行数
 */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = text.split('')
  let line = ''
  let lineCount = 0
  
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y + lineCount * lineHeight)
      line = chars[i]
      lineCount++
    } else {
      line = testLine
    }
  }
  
  ctx.fillText(line, x, y + lineCount * lineHeight)
  return lineCount + 1
}

/**
 * 绘制多行文本
 * @param {Object} ctx - Canvas 上下文
 * @param {string[]} lines - 文本行数组
 * @param {number} x - 起始 x 坐标
 * @param {number} y - 起始 y 坐标
 * @param {number} lineHeight - 行高
 */
export function drawMultilineText(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight)
  })
}

/**
 * 将文本分割成多行
 * @param {Object} ctx - Canvas 上下文
 * @param {string} text - 要分割的文本
 * @param {number} maxWidth - 最大宽度
 * @returns {string[]} 分割后的文本行数组
 */
export function splitTextIntoLines(ctx, text, maxWidth) {
  const chars = text.split('')
  const lines = []
  let line = ''
  
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    
    if (testWidth > maxWidth && i > 0) {
      lines.push(line)
      line = chars[i]
    } else {
      line = testLine
    }
  }
  
  lines.push(line)
  return lines
}

/**
 * 绘制圆形头像
 * @param {Object} ctx - Canvas 上下文
 * @param {string} imgSrc - 图片路径
 * @param {number} x - 圆心 x 坐标
 * @param {number} y - 圆心 y 坐标
 * @param {number} radius - 半径
 */
export function drawCircularAvatar(ctx, imgSrc, x, y, radius) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.clip()
  
  // 注意：实际使用时需要先加载图片
  // const img = new Image()
  // img.src = imgSrc
  // ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2)
  
  // 绘制占位圆形
  ctx.fillStyle = '#E0E0E0'
  ctx.fill()
  
  ctx.restore()
}

/**
 * 绘制渐变背景
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x - 起始 x 坐标
 * @param {number} y - 起始 y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string[]} colors - 渐变色数组
 * @param {string} direction - 渐变方向 ('vertical' | 'horizontal')
 */
export function drawGradientBackground(ctx, x, y, width, height, colors, direction = 'vertical') {
  let gradient
  
  if (direction === 'vertical') {
    gradient = ctx.createLinearGradient(x, y, x, y + height)
  } else {
    gradient = ctx.createLinearGradient(x, y, x + width, y)
  }
  
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })
  
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, width, height)
}

/**
 * 绘制虚线
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x1 - 起始 x 坐标
 * @param {number} y1 - 起始 y 坐标
 * @param {number} x2 - 结束 x 坐标
 * @param {number} y2 - 结束 y 坐标
 * @param {number} dashLength - 虚线段长度
 * @param {number} gapLength - 间隙长度
 */
export function drawDashedLine(ctx, x1, y1, x2, y2, dashLength = 5, gapLength = 5) {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  const dashCount = Math.floor(distance / (dashLength + gapLength))
  
  ctx.beginPath()
  
  for (let i = 0; i < dashCount; i++) {
    const startX = x1 + (dx / distance) * i * (dashLength + gapLength)
    const startY = y1 + (dy / distance) * i * (dashLength + gapLength)
    const endX = startX + (dx / distance) * dashLength
    const endY = startY + (dy / distance) * dashLength
    
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
  }
  
  ctx.stroke()
}

/**
 * 绘制带阴影的矩形
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x - 起始 x 坐标
 * @param {number} y - 起始 y 坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string} color - 填充颜色
 * @param {Object} shadow - 阴影配置 { color, blur, offsetX, offsetY }
 */
export function drawShadowRect(ctx, x, y, width, height, color, shadow) {
  ctx.save()
  
  if (shadow) {
    ctx.shadowColor = shadow.color || 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = shadow.blur || 10
    ctx.shadowOffsetX = shadow.offsetX || 0
    ctx.shadowOffsetY = shadow.offsetY || 5
  }
  
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
  
  ctx.restore()
}

/**
 * 绘制二维码（模拟）
 * @param {Object} ctx - Canvas 上下文
 * @param {number} x - 起始 x 坐标
 * @param {number} y - 起始 y 坐标
 * @param {number} size - 二维码大小
 */
export function drawQRCode(ctx, x, y, size) {
  const cellSize = size / 25
  
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(x, y, size, size)
  
  ctx.fillStyle = '#000000'
  
  // 绘制定位点
  const drawPositionPattern = (px, py) => {
    ctx.fillRect(px, py, 7 * cellSize, 7 * cellSize)
    ctx.clearRect(px + cellSize, py + cellSize, 5 * cellSize, 5 * cellSize)
    ctx.fillRect(px + 2 * cellSize, py + 2 * cellSize, 3 * cellSize, 3 * cellSize)
  }
  
  drawPositionPattern(x, y)
  drawPositionPattern(x + size - 7 * cellSize, y)
  drawPositionPattern(x, y + size - 7 * cellSize)
  
  // 随机填充数据区域
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      // 跳过定位点区域
      if ((i < 7 && j < 7) || (i > 17 && j < 7) || (i < 7 && j > 17)) {
        continue
      }
      
      if (Math.random() > 0.5) {
        ctx.fillRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize)
      }
    }
  }
}

/**
 * 下载 Canvas 为图片
 * @param {string} canvasId - Canvas ID
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} 图片临时路径
 */
export function canvasToImage(canvasId, options = {}) {
  return new Promise((resolve, reject) => {
    uni.canvasToTempFilePath({
      canvasId,
      ...options,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 保存图片到相册
 * @param {string} filePath - 图片路径
 * @returns {Promise<void>}
 */
export function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        resolve()
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default {
  drawRoundedRect,
  strokeRoundedRect,
  fillRoundedRect,
  wrapText,
  drawMultilineText,
  splitTextIntoLines,
  drawCircularAvatar,
  drawGradientBackground,
  drawDashedLine,
  drawShadowRect,
  drawQRCode,
  canvasToImage,
  saveImageToAlbum
}
