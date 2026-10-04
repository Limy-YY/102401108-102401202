<template>
  <view class="profile-page">
    <!-- 固定头部：顶部占位 + 个人名片 + 「我的发布」栏（不参与滚动，固定在顶部） -->
    <view class="page-header">
      <!-- 顶部占位：避开状态栏/刘海 -->
      <view class="top-space"></view>

      <!-- 个人名片 -->
      <ProfileCard :userInfo="userInfo" />

      <!-- 我的发布：通栏标志栏 -->
      <view class="section-bar">
        <text class="section-title">我的发布</text>
      </view>
    </view>

    <!-- 无发布：普通流居中展示占位，不渲染滚动区，避免空列表仍可下滑 -->
    <view v-if="myItems.length === 0" class="empty-wrap">
      <EmptyState />
    </view>

    <!-- 发布列表滚动区：仅列表可滚动 -->
    <scroll-view v-else class="list-container" scroll-y :enhanced="true" :bounces="false">
      <ItemCard
        v-for="item in myItems"
        :key="item.id"
        :item="item"
      />

      <!-- 底部占位：避免最后一张卡片被底部导航栏遮挡 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部导航栏（与首页一致） -->
    <BottomNav />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onPageShow } from '@dcloudio/uni-app'
import { getMyItems } from '@/utils/storage.js'
import ProfileCard from '@/components/ProfileCard.vue'
import ItemCard from '@/components/ItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import BottomNav from '@/components/BottomNav.vue'
import { getUserInfo } from '@/utils/user.js'

// 当前用户资料（占位数据，来源统一在 utils/user.js）
const userInfo = getUserInfo()
const myItems = ref([])

// 页面每次显示时重新加载「我的发布」
onPageShow(() => {
  myItems.value = getMyItems()
})
</script>

<style scoped>
/* 页面容器：flex 纵向布局，页面本身不滚动，只有列表区内部滚动 */
.profile-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #F9F1E6;
}

/* 固定头部：作为 flex 子项不参与滚动，天然固定在顶部 */
.page-header {
  flex-shrink: 0;
}

/* 顶部占位：避开状态栏/刘海 */
.top-space {
  height: calc(80rpx + env(safe-area-inset-top));
}

/* 「我的发布」标志栏：白底、文字居中、通栏宽度 */
.section-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40rpx 0 30rpx;
  background-color: #FFFFFF;
  padding: 20rpx 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

/* 列表滚动区：占据头部与底部之间的剩余空间 */
.list-container {
  flex: 1;
  height: 0;
  min-height: 0;
}

/* 空列表占位容器：撑满列表区并居中，普通流不产生滚动 */
.empty-wrap {
  flex: 1;
  height: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 底部占位：高度与固定底部导航栏相当，避免最后一张卡片被遮挡 */
.bottom-space {
  height: calc(140rpx + env(safe-area-inset-bottom));
}

/* H5 下阻止内容不足/到达边界时回弹（露出背景色） */
::v-deep .list-container,
::v-deep .list-container .uni-scroll-view,
::v-deep .list-container .uni-scroll-view-content {
  overscroll-behavior: none;
}
</style>
