/**
 * 音频工具类
 * 提供音频相关的通用函数
 */

/**
 * 格式化时长
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时长字符串 (MM:SS)
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 生成波形数据
 * @param {number} count - 波形条数
 * @param {number} intensity - 波形强度 (0-1)
 * @returns {number[]} 波形高度数组
 */
export function generateWaveform(count = 20, intensity = 1) {
  const heights = []
  const minHeight = 10
  const maxHeight = 50 * intensity
  
  for (let i = 0; i < count; i++) {
    // 使用正弦波生成平滑的波形
    const baseWave = Math.sin(i * 0.5) * 0.5 + 0.5
    const randomFactor = Math.random() * 0.4 + 0.6
    const height = minHeight + baseWave * maxHeight * randomFactor
    heights.push(Math.round(height))
  }
  
  return heights
}

/**
 * 生成模拟音频数据
 * @param {number} duration - 音频时长(秒)
 * @returns {Object} 音频数据对象
 */
export function generateMockAudioData(duration = 10) {
  const dataPoints = Math.floor(duration * 10)
  const waveform = []
  
  for (let i = 0; i < dataPoints; i++) {
    waveform.push(Math.random() * 100)
  }
  
  return {
    duration,
    waveform,
    peaks: findPeaks(waveform),
    average: waveform.reduce((a, b) => a + b, 0) / waveform.length
  }
}

/**
 * 查找波形峰值
 * @param {number[]} data - 波形数据
 * @returns {number[]} 峰值索引数组
 */
function findPeaks(data) {
  const peaks = []
  const threshold = Math.max(...data) * 0.5
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > threshold) {
      peaks.push(i)
    }
  }
  
  return peaks
}

/**
 * 音频播放状态管理
 */
export class AudioPlayer {
  constructor() {
    this.innerAudioContext = null
    this.isPlaying = false
    this.currentTime = 0
    this.duration = 0
    this.onTimeUpdate = null
    this.onEnded = null
    this.onError = null
  }
  
  /**
   * 初始化音频播放器
   * @param {string} src - 音频文件路径
   */
  init(src) {
    if (this.innerAudioContext) {
      this.destroy()
    }
    
    this.innerAudioContext = uni.createInnerAudioContext()
    this.innerAudioContext.src = src
    
    this.innerAudioContext.onPlay(() => {
      this.isPlaying = true
    })
    
    this.innerAudioContext.onPause(() => {
      this.isPlaying = false
    })
    
    this.innerAudioContext.onStop(() => {
      this.isPlaying = false
      this.currentTime = 0
    })
    
    this.innerAudioContext.onEnded(() => {
      this.isPlaying = false
      this.currentTime = 0
      if (this.onEnded) this.onEnded()
    })
    
    this.innerAudioContext.onTimeUpdate(() => {
      this.currentTime = this.innerAudioContext.currentTime
      this.duration = this.innerAudioContext.duration
      if (this.onTimeUpdate) this.onTimeUpdate(this.currentTime, this.duration)
    })
    
    this.innerAudioContext.onError((err) => {
      console.error('音频播放错误:', err)
      if (this.onError) this.onError(err)
    })
  }
  
  /**
   * 播放音频
   */
  play() {
    if (this.innerAudioContext) {
      this.innerAudioContext.play()
    }
  }
  
  /**
   * 暂停音频
   */
  pause() {
    if (this.innerAudioContext) {
      this.innerAudioContext.pause()
    }
  }
  
  /**
   * 停止播放
   */
  stop() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop()
    }
  }
  
  /**
   * 跳转到指定位置
   * @param {number} position - 位置(秒)
   */
  seek(position) {
    if (this.innerAudioContext) {
      this.innerAudioContext.seek(position)
    }
  }
  
  /**
   * 销毁播放器
   */
  destroy() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy()
      this.innerAudioContext = null
      this.isPlaying = false
      this.currentTime = 0
      this.duration = 0
    }
  }
}

/**
 * 录音管理器
 */
export class AudioRecorder {
  constructor() {
    this.recorderManager = null
    this.isRecording = false
    this.duration = 0
    this.timer = null
    this.onStart = null
    this.onStop = null
    this.onError = null
  }
  
  /**
   * 初始化录音管理器
   */
  init() {
    this.recorderManager = uni.getRecorderManager()
    
    this.recorderManager.onStart(() => {
      this.isRecording = true
      this.startTimer()
      if (this.onStart) this.onStart()
    })
    
    this.recorderManager.onStop((res) => {
      this.isRecording = false
      this.stopTimer()
      if (this.onStop) this.onStop(res)
    })
    
    this.recorderManager.onError((err) => {
      this.isRecording = false
      this.stopTimer()
      console.error('录音错误:', err)
      if (this.onError) this.onError(err)
    })
  }
  
  /**
   * 开始录音
   * @param {Object} options - 录音配置
   */
  start(options = {}) {
    if (!this.recorderManager) {
      this.init()
    }
    
    const defaultOptions = {
      duration: 600000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'mp3'
    }
    
    this.recorderManager.start({ ...defaultOptions, ...options })
  }
  
  /**
   * 停止录音
   */
  stop() {
    if (this.recorderManager) {
      this.recorderManager.stop()
    }
  }
  
  /**
   * 暂停录音
   */
  pause() {
    if (this.recorderManager) {
      this.recorderManager.pause()
    }
  }
  
  /**
   * 继续录音
   */
  resume() {
    if (this.recorderManager) {
      this.recorderManager.resume()
    }
  }
  
  /**
   * 开始计时
   */
  startTimer() {
    this.duration = 0
    this.timer = setInterval(() => {
      this.duration++
    }, 1000)
  }
  
  /**
   * 停止计时
   */
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
  
  /**
   * 获取格式化时长
   * @returns {string}
   */
  getFormattedDuration() {
    return formatDuration(this.duration)
  }
}

export default {
  formatDuration,
  generateWaveform,
  generateMockAudioData,
  AudioPlayer,
  AudioRecorder
}
