<template>
  <view class="bottom-nav">
    <!-- 首页 Tab -->
    <view class="nav-item" @click="switchTab('/pages/index/index')">
      <text class="icon">🏠</text>
      <text class="label" :class="{ active: currentPath === '/pages/index/index' }">首页</text>
    </view>

    <!-- 中间悬浮发布按钮 -->
    <view class="nav-item publish-btn" @click="switchTab('/pages/publish/publish')">
      <view class="plus-circle">
        <text class="plus-icon">+</text>
      </view>
    </view>

    <!-- 我的 Tab -->
    <view class="nav-item" @click="switchTab('/pages/profile/profile')">
      <text class="icon">👤</text>
      <text class="label" :class="{ active: currentPath === '/pages/profile/profile' }">我的</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 获取当前页面路径，用于高亮当前选中的 Tab
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const currentPath = '/' + currentPage.route

// 切换 Tab 页面，已在当前页时不重复跳转
const switchTab = (url) => {
  if (currentPath === url) return
  uni.switchTab({ url })
}
</script>

<style scoped>
/* 底部导航栏容器：固定在底部，适配 iPhone 底部安全区 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 999;
}

/* 单个导航项 */
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Tab 图标 */
.icon {
  font-size: 44rpx;
  margin-bottom: 6rpx;
}

/* Tab 文字：默认灰色 */
.label {
  font-size: 22rpx;
  color: #999999;
}

/* Tab 文字：选中态高亮 */
.label.active {
  color: #FF7A33;
}

/* 中间发布按钮：向上浮动突出 */
.publish-btn {
  position: relative;
  top: -15rpx;
}

/* 发布按钮圆形背景 */
.plus-circle {
  width: 120rpx;
  height: 120rpx;
  background-color: #FF7A33;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 122, 51, 0.4);
}

/* 发布按钮 "+" 号 */
.plus-icon {
  color: #FFFFFF;
  font-size: 72rpx;
  font-weight: bold;
  line-height: 1;
  margin-top: -5rpx;
}
</style>
