<template>
  <view class="index-page">
    <!-- 固定头部：搜索栏 + 分类 Tab（不参与滚动） -->
    <view class="page-header">
      <SearchBar @search="goToSearchPage" />

      <!-- 分类 Tab 切换：全部 / 寻物 / 招领 -->
      <view class="category-tabs">
        <view
          class="tab"
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: currentCategory === tab.value }"
          @click="setCategory(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>
    </view>

    <!-- 列表为空：普通流居中展示占位，不渲染滚动区，避免空列表仍可下滑 -->
    <view v-if="displayList.length === 0" class="empty-wrap list-fill-center">
      <EmptyState />
    </view>

    <!-- 列表滚动区：有数据时才渲染，支持下拉刷新 -->
    <scroll-view
      v-else
      class="list-container list-fill"
      scroll-y
      @refresherrefresh="onRefresh"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
	  :enhanced="true"
	  :bounces="false"
    >
      <!-- 根据当前分类过滤后的列表 -->
      <ItemCard
        v-for="item in displayList"
        :key="item.id"
        :item="item"
      />

      <!-- 底部占位：保证最后一张卡片能完整滚出底部导航栏的遮挡范围 -->
      <view class="list-bottom-space"></view>
    </scroll-view>

    <!-- 底部导航栏 -->
    <BottomNav />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onPageShow } from '@dcloudio/uni-app'
import { getItems } from '@/utils/storage.js'
import SearchBar from '@/components/SearchBar.vue'
import ItemCard from '@/components/ItemCard.vue'
import BottomNav from '@/components/BottomNav.vue'
import EmptyState from '@/components/EmptyState.vue'

// 分类 Tab：显示中文、存储英文枚举（「全部」用空串，表示不筛选）
const tabs = [
  { label: '全部', value: '' },
  { label: '寻物', value: 'lost' },
  { label: '招领', value: 'found' }
]
const currentCategory = ref('')
const isRefreshing = ref(false)
const rawItems = ref([])

// 页面每次显示时重新加载数据
onPageShow(async () => {
  // 隐藏 uni-app 原生 tabBar（已用自定义 BottomNav 替代）。
  // 原生 tabBar 会在页面底部预留 50px，把页面容器（100dvh）顶出可视区，导致整页可滚动。
  uni.hideTabBar({ animation: false })
  try {
    rawItems.value = await getItems()
  } catch (e) {
    rawItems.value = []
  }
})

// 按当前分类过滤（「全部」为空串，直接返回全部），透传原始数据给 ItemCard
const displayList = computed(() => {
  if (!currentCategory.value) return rawItems.value
  return rawItems.value.filter(item => item.category === currentCategory.value)
})

const setCategory = (cat) => {
  currentCategory.value = cat
}

const onRefresh = () => {
  isRefreshing.value = true
  getItems().then(list => {
    rawItems.value = list
  }).catch(() => {}).finally(() => {
    isRefreshing.value = false
    uni.showToast({ title: '刷新成功', icon: 'none' })
  })
}

const goToSearchPage = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}
</script>

<style scoped>
/* 页面容器：flex 纵向布局，页面本身不滚动，只有列表滚动 */
.index-page {
  height: 100vh;
  height: 100dvh; /* 移动端浏览器动态视口，避免被浏览器工具栏撑高导致页面可滚动 */
  display: flex;
  flex-direction: column;
  background-color: #F9F1E6;
  overflow: hidden;
}

/* 固定头部：作为 flex 子项不参与滚动，天然固定在顶部 */
.page-header {
  flex-shrink: 0;
}

/* 分类 Tab 容器 */
.category-tabs {
  display: flex;
  justify-content: center;
  margin: 0 30rpx 20rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 10rpx 0;
}

/* 单个 Tab */
.tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  padding: 10rpx 0;
}

/* 选中态：高亮 + 底部指示条 */
.tab.active {
  color: #FF7A33;
  font-weight: bold;
  border-bottom: 4rpx solid #FF7A33;
}

::v-deep .list-container,
::v-deep .list-container .uni-scroll-view,
::v-deep .list-container .uni-scroll-view-content {
  overscroll-behavior: none;
}
</style>
