<template>
  <view class="profile-page">
    <!-- 固定头部：顶部占位 + 个人名片 + 「我的发布」栏（不参与滚动，固定在顶部） -->
    <view class="page-header">
      <!-- 顶部占位：避开状态栏/刘海 -->
      <view class="top-space"></view>

      <!-- 个人名片：可编辑（点击进编辑页），不显示一键复制 -->
      <ProfileCard :userInfo="userInfo" editable :show-copy="false" @edit="goEditProfile" />

      <!-- 个人中心菜单：退出登录 -->
      <view class="menu-card">
        <view class="menu-item" @click="handleLogout">
          <text class="menu-icon">🚪</text>
          <text class="menu-text logout-text">退出登录</text>
        </view>
      </view>

      <!-- 我的发布：通栏标志栏 -->
      <view class="section-bar">
        <text class="section-title">我的发布</text>
      </view>
    </view>

    <!-- 无发布：普通流居中展示占位，不渲染滚动区，避免空列表仍可下滑 -->
    <view v-if="myItems.length === 0" class="empty-wrap list-fill-center">
      <EmptyState />
    </view>

    <!-- 发布列表滚动区：仅列表可滚动 -->
    <scroll-view v-else class="list-container list-fill" scroll-y :enhanced="true" :bounces="false">
      <ItemCard
        v-for="item in myItems"
        :key="item.id"
        :item="item"
      />

      <!-- 底部占位：避免最后一张卡片被底部导航栏遮挡 -->
      <view class="list-bottom-space"></view>
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
import { logout } from '@/utils/auth.js'

// 当前用户资料（来自登录缓存）
const userInfo = ref(getUserInfo())
const myItems = ref([])

// 页面每次显示时重新加载「我的发布」与最新资料
onPageShow(async () => {
  userInfo.value = getUserInfo()
  try {
    myItems.value = await getMyItems()
  } catch (e) {
    myItems.value = []
  }
})

// 编辑资料：跳转到个人资料编辑页
const goEditProfile = () => {
  uni.navigateTo({ url: '/pages/profile-edit/profile-edit' })
}

// 退出登录：清除登录态后回到登录/注册页
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}
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

/* 个人中心菜单卡片：编辑资料 / 退出登录 */
.menu-card {
  margin: 30rpx 30rpx 0;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.menu-text.logout-text {
  color: #E64340;
}

.menu-arrow {
  font-size: 40rpx;
  color: #CCCCCC;
}

.menu-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin-left: 82rpx;
}

/* H5 下阻止内容不足/到达边界时回弹（露出背景色） */
::v-deep .list-container,
::v-deep .list-container .uni-scroll-view,
::v-deep .list-container .uni-scroll-view-content {
  overscroll-behavior: none;
}

</style>
