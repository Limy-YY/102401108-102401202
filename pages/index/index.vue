<template>
  <view class="index-page">
    <!-- 固定头部：搜索栏 + 分类 Tab（不参与滚动） -->
    <view class="page-header">
      <SearchBar @search="goToSearchPage" />

      <!-- 分类 Tab 切换：寻物 / 招领 -->
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
    <view v-if="displayList.length === 0" class="empty-wrap">
      <EmptyState />
    </view>

    <!-- 列表滚动区：有数据时才渲染，支持下拉刷新 -->
    <scroll-view
      v-else
      class="list-container"
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

// 分类 Tab：显示中文、存储英文枚举
const tabs = [
  { label: '寻物', value: 'lost' },
  { label: '招领', value: 'found' }
]
const currentCategory = ref('lost')
const isRefreshing = ref(false)
const rawItems = ref([])

// 页面每次显示时重新加载数据
onPageShow(() => {
  rawItems.value = getItems()
})

// 按当前分类过滤，直接透传原始数据给 ItemCard
const displayList = computed(() => {
  return rawItems.value.filter(item => item.category === currentCategory.value)
})

const setCategory = (cat) => {
  currentCategory.value = cat
}

const onRefresh = () => {
  isRefreshing.value = true
  rawItems.value = getItems()
  setTimeout(() => {
    isRefreshing.value = false
    uni.showToast({ title: '刷新成功', icon: 'none' })
  }, 800)
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
.list-bottom-space {
  height: calc(140rpx + env(safe-area-inset-bottom));
}

::v-deep .list-container,
::v-deep .list-container .uni-scroll-view,
::v-deep .list-container .uni-scroll-view-content {
  overscroll-behavior: none;
}
</style>
