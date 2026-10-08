<template>
  <view
    class="cropper"
    @touchstart="onStart"
    @touchmove.prevent="onMove"
    @touchend="onEnd"
    @touchcancel="onEnd"
    @mousedown="onStart"
    @mousemove="onMove"
    @mouseup="onEnd"
    @mouseleave="onEnd"
  >
    <!-- 顶部操作栏 -->
    <view class="cropper-bar">
      <text class="bar-btn" @click="onCancel">取消</text>
      <text class="bar-title">裁剪头像</text>
      <text class="bar-btn primary" @click="onConfirm">确定</text>
    </view>

    <!-- 图片 + 裁剪框 -->
    <view class="cropper-stage">
      <view v-if="!ready" class="loading">图片加载中…</view>
      <image class="crop-image" :src="src" :style="imageStyle" />
      <view v-if="ready" class="crop-box" :style="boxStyle">
        <view class="grid g1"></view>
        <view class="grid g2"></view>
        <view class="grid g3"></view>
        <view class="grid g4"></view>
        <view class="corner tl"></view>
        <view class="corner tr"></view>
        <view class="corner bl"></view>
        <view class="corner br"></view>
      </view>
    </view>

    <!-- App 端裁剪用的离屏 canvas -->
    <canvas canvas-id="avatarCropCanvas" class="crop-canvas"></canvas>
  </view>
</template>

<script setup>
import { reactive, ref, computed, getCurrentInstance } from 'vue'
import { fileToDataURL } from '@/utils/image.js'

// 父组件传入原始图片（H5 为 blob: 地址，App 为本地文件路径）
const props = defineProps({
  src: { type: String, default: '' }
})
const emit = defineEmits(['confirm', 'cancel'])

const instance = getCurrentInstance()

// 输出头像边长、裁剪框最小尺寸、右下角把手命中区域（单位 px）
const OUT = 400
const MIN_SIZE = 60
const HANDLE = 36

const winInfo = uni.getSystemInfoSync()
const winW = winInfo.windowWidth
const winH = winInfo.windowHeight
const BAR_H = 96 // 顶部操作栏高度
const MARGIN = 24 // 图片四周留白

// 图片在屏幕上的显示矩形（px）
const layout = reactive({ w: 0, h: 0, left: 0, top: 0 })
// 裁剪框（正方形，可拖动 + 右下角缩放）
const box = reactive({ left: 0, top: 0, size: 0 })
// 图片自然尺寸（px）
const nat = reactive({ w: 0, h: 0 })
const ready = ref(false)

// 计算图片显示布局：等比缩放到尽量铺满、居中
function setupLayout() {
  const availH = winH - BAR_H
  const maxW = winW - MARGIN * 2
  const maxH = availH - MARGIN * 2
  let w = maxW
  let h = (w * nat.h) / nat.w
  if (h > maxH) {
    h = maxH
    w = (h * nat.w) / nat.h
  }
  layout.w = w
  layout.h = h
  layout.left = (winW - w) / 2
  layout.top = BAR_H + (availH - h) / 2

  const size = Math.min(w, h) * 0.8
  box.left = layout.left + (w - size) / 2
  box.top = layout.top + (h - size) / 2
  box.size = size
  ready.value = true
}

// 读取自然尺寸：H5 用 Image，App 用 getImageInfo
function loadNaturalSize() {
  // #ifdef H5
  const img = new Image()
  img.onload = () => {
    nat.w = img.naturalWidth
    nat.h = img.naturalHeight
    setupLayout()
  }
  img.onerror = () => emit('cancel')
  img.src = props.src
  // #endif
  // #ifndef H5
  uni.getImageInfo({
    src: props.src,
    success: (res) => {
      nat.w = res.width
      nat.h = res.height
      setupLayout()
    },
    fail: () => emit('cancel')
  })
  // #endif
}
loadNaturalSize()

const imageStyle = computed(() => ({
  width: layout.w + 'px',
  height: layout.h + 'px',
  left: layout.left + 'px',
  top: layout.top + 'px'
}))

const boxStyle = computed(() => ({
  left: box.left + 'px',
  top: box.top + 'px',
  width: box.size + 'px',
  height: box.size + 'px'
}))

// ---- 拖动 / 缩放交互（触屏 + 鼠标通用） ----
function getXY(e) {
  const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0])
  if (t) {
    return {
      x: t.clientX != null ? t.clientX : t.pageX,
      y: t.clientY != null ? t.clientY : t.pageY
    }
  }
  if (typeof e.clientX === 'number') return { x: e.clientX, y: e.clientY }
  return null
}

const clamp = (min, max, v) => Math.max(min, Math.min(max, v))

let mode = null // 'move' | 'resize' | null
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0
let startSize = 0
let startCx = 0
let startCy = 0

function onStart(e) {
  const p = getXY(e)
  if (!p || !ready.value) return
  const inBox =
    p.x >= box.left && p.x <= box.left + box.size && p.y >= box.top && p.y <= box.top + box.size
  if (!inBox) return
  // 右下角区域视为缩放把手，其余为拖动
  mode = p.x >= box.left + box.size - HANDLE && p.y >= box.top + box.size - HANDLE ? 'resize' : 'move'
  startX = p.x
  startY = p.y
  startLeft = box.left
  startTop = box.top
  startSize = box.size
  startCx = box.left + box.size / 2
  startCy = box.top + box.size / 2
}

function onMove(e) {
  if (!mode) return
  const p = getXY(e)
  if (!p) return
  const dx = p.x - startX
  const dy = p.y - startY
  const maxSize = Math.min(layout.w, layout.h)
  if (mode === 'move') {
    box.left = clamp(layout.left, layout.left + layout.w - box.size, startLeft + dx)
    box.top = clamp(layout.top, layout.top + layout.h - box.size, startTop + dy)
  } else {
    // 围绕中心缩放，保持正方形
    const size = clamp(MIN_SIZE, maxSize, startSize + Math.max(dx, dy))
    box.size = size
    box.left = clamp(layout.left, layout.left + layout.w - size, startCx - size / 2)
    box.top = clamp(layout.top, layout.top + layout.h - size, startCy - size / 2)
  }
}

function onEnd() {
  mode = null
}

const onCancel = () => emit('cancel')

// 按裁剪框把图片裁成 OUT×OUT 的 data URL
function cropToDataURL(sx, sy, sw, sh, out) {
  return new Promise((resolve) => {
    // #ifdef H5
    const canvas = document.createElement('canvas')
    canvas.width = out
    canvas.height = out
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, out, out)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, out, out)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => resolve(props.src)
    img.src = props.src
    // #endif
    // #ifndef H5
    const appCtx = uni.createCanvasContext('avatarCropCanvas', instance && instance.proxy)
    appCtx.fillStyle = '#FFFFFF'
    appCtx.fillRect(0, 0, out, out)
    appCtx.drawImage(props.src, sx, sy, sw, sh, 0, 0, out, out)
    appCtx.draw(false, () => {
      uni.canvasToTempFilePath(
        {
          canvasId: 'avatarCropCanvas',
          width: out,
          height: out,
          destWidth: out,
          destHeight: out,
          fileType: 'jpg',
          quality: 0.85,
          success: async (res) => {
            const path = res && res.tempFilePath
            if (path && path.indexOf('data:') === 0) resolve(path)
            else resolve(await fileToDataURL(path))
          },
          fail: () => resolve(props.src)
        },
        instance && instance.proxy
      )
    })
    // #endif
  })
}

async function onConfirm() {
  if (!ready.value) return
  const scale = nat.w / layout.w
  const sx = Math.max(0, Math.round((box.left - layout.left) * scale))
  const sy = Math.max(0, Math.round((box.top - layout.top) * scale))
  const sw = Math.min(nat.w - sx, Math.round(box.size * scale))
  const sh = Math.min(nat.h - sy, Math.round(box.size * scale))
  const dataUrl = await cropToDataURL(sx, sy, sw, sh, OUT)
  emit('confirm', dataUrl)
}
</script>

<style scoped>
.cropper {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cropper-bar {
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.bar-btn {
  font-size: 30px;
  color: #ffffff;
  padding: 8px 16px;
}

.bar-btn.primary {
  color: #ff7a33;
  font-weight: bold;
}

.bar-title {
  font-size: 32px;
  color: #ffffff;
  font-weight: bold;
}

.cropper-stage {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.loading {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 28px;
}

.crop-image {
  position: absolute;
  -webkit-user-drag: none;
}

/* 裁剪框：白框 + 外部暗色遮罩（box-shadow 撑开） */
.crop-box {
  position: absolute;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
}

.grid {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
}

.grid.g1 { left: 33.33%; top: 0; width: 1px; height: 100%; }
.grid.g2 { left: 66.66%; top: 0; width: 1px; height: 100%; }
.grid.g3 { left: 0; top: 33.33%; width: 100%; height: 1px; }
.grid.g4 { left: 0; top: 66.66%; width: 100%; height: 1px; }

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #ff7a33;
}

.corner.tl { left: -3px; top: -3px; border-right: none; border-bottom: none; }
.corner.tr { right: -3px; top: -3px; border-left: none; border-bottom: none; }
.corner.bl { left: -3px; bottom: -3px; border-right: none; border-top: none; }
.corner.br { right: -3px; bottom: -3px; border-left: none; border-top: none; }

.crop-canvas {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 400px;
  height: 400px;
}
</style>
