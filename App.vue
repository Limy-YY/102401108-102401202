<script setup>
import { onLaunch } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/utils/auth.js'
import { ensureSeedData } from '@/utils/seed.js'

// 启动登录守卫：未登录（第一次进入或退出登录后）一律跳到登录/注册页
onLaunch(() => {
  // 首次进入播种演示账号与演示物品（无后端，数据存 localStorage）
  ensureSeedData()
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})
</script>

<template>
  <view></view>
</template>

<style>
page {
  background-color: #F9F1E6;
}

/* H5 下阻止页面/浏览器在滚动边界处回弹（露出背景色） */
page,
body,
html {
  overscroll-behavior: none;
}

/* 列表页通用布局类（首页 / 我的发布共用）：
   占满头部与底部之间的剩余高度、空状态居中、底部占位撑开导航遮挡 */
.list-fill {
  flex: 1;
  height: 0;
  min-height: 0;
}

.list-fill-center {
  flex: 1;
  height: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-bottom-space {
  height: calc(140rpx + env(safe-area-inset-bottom));
}
</style>
