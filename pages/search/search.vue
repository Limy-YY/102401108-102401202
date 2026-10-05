<template>
  <!-- 搜索页容器 -->
  <view class="search-page">

    <!-- 搜索栏（固定在顶部） -->
    <view class="search-bar-fixed">
      <SearchBar
        :modelValue="keyword"
        :showDate="false"
        @update:modelValue="keyword = $event"
        @search="handleSearch"
      />
    </view>

    <!-- 筛选栏：类型 / 时间 / 地点 / 颜色 -->
    <view class="filter-bar" :style="{ top: topOffset }">
      <!-- 漏斗图标，纯展示 -->
      <view class="filter-icon-btn">
        <text class="icon">▽</text>
      </view>

      <view
        class="filter-item"
        :class="{ active: activeFilter === 'type' }"
        @click="openFilter('type')"
      >
        <text>{{ filters.type || '类型' }}</text>
        <text class="arrow">▾</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'time' }"
        @click="openFilter('time')"
      >
        <text>{{ filters.time || '时间' }}</text>
        <text class="arrow">▾</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'location' }"
        @click="openFilter('location')"
      >
        <text>{{ filters.location || '地点' }}</text>
        <text class="arrow">▾</text>
      </view>
      <view
        class="filter-item"
        :class="{ active: activeFilter === 'color' }"
        @click="openFilter('color')"
      >
        <text>{{ filters.color || '颜色' }}</text>
        <text class="arrow">▾</text>
      </view>
    </view>

    <!-- 下拉选项面板：根据当前激活的筛选项展示对应选项 -->
    <view class="filter-dropdown" v-if="activeFilter" :style="{ top: dropdownTop }">
      <view
        class="dropdown-item"
        v-for="(option, index) in currentOptions"
        :key="index"
        @click="selectOption(option)"
      >
        <text>{{ option }}</text>
        <text class="check" v-if="filters[activeFilter] === option">✓</text>
      </view>
    </view>

    <!-- 遮罩层：点击关闭筛选面板 -->
    <view class="mask" v-if="activeFilter" :style="{ top: dropdownTop }" @click="closeFilter"></view>

    <!-- 有结果：纵向滚动列表 -->
    <scroll-view
      v-if="displayItems.length > 0"
      class="content-area"
      scroll-y
      :bounces="false"
      :style="{ marginTop: contentMarginTop, height: contentHeight }"
    >
      <ItemCard
        v-for="item in displayItems"
        :key="item.id"
        :item="item"
      />
    </scroll-view>

    <!-- 空状态：无结果时在列表区正中央展示（普通流，不滚动） -->
    <view
      v-else
      class="empty-wrap"
      :style="{ marginTop: contentMarginTop, height: contentHeight }"
    >
      <EmptyState />
    </view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getItems } from '@/utils/storage.js'
import { parseCategory, parseDate } from '@/utils/format.js'
import { CATEGORY_OPTIONS, LOCATION_TAGS, COLOR_LIST, TIME_FILTER_DAYS } from '@/utils/constants.js'
import SearchBar from '@/components/SearchBar.vue'
import ItemCard from '@/components/ItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'

// --- 数据源：后端广场的全部物品（异步加载）---
const allItems = ref([])

// --- 搜索相关 ---
// 输入框当前文字：实时绑定输入框，仅在输入时变化
const keyword = ref('')
// 实际生效的搜索关键词：仅在点击搜索按钮时更新，用于过滤列表
const appliedKeyword = ref('')

// 读取从首页搜索栏跳转携带的关键词（此时搜索动作已在首页发生，故同步生效）
onLoad(async (options) => {
  try {
    allItems.value = await getItems()
  } catch (e) {
    allItems.value = []
  }
  if (options && options.keyword) {
    keyword.value = decodeURIComponent(options.keyword)
    appliedKeyword.value = keyword.value
  }
})

// 搜索触发：点击搜索按钮后才让关键词生效
const handleSearch = (val) => {
  appliedKeyword.value = val
}

// --- 筛选相关 ---
const filters = ref({ type: '', time: '', location: '', color: '' })

// 各筛选项的可选项列表（分类/场所/颜色与发布页共用同一份常量）
const filterOptions = {
  type: ['全部', ...CATEGORY_OPTIONS],
  time: ['全部', '一天内', '三天内', '一周内', '两周内', '四周内'],
  location: ['全部', ...LOCATION_TAGS],
  color: ['全部', ...COLOR_LIST]
}

const activeFilter = ref(null)
// 当前激活筛选项对应的选项列表
const currentOptions = computed(() => activeFilter.value ? filterOptions[activeFilter.value] : [])

// 切换筛选面板：点击同一项则关闭，否则打开
const openFilter = (field) => {
  activeFilter.value = activeFilter.value === field ? null : field
}
// 关闭筛选面板
const closeFilter = () => { activeFilter.value = null }

// 选中筛选项：'全部' 则清空该筛选项，否则设置值（筛选立即生效，不影响关键词）
const selectOption = (option) => {
  if (!activeFilter.value) return
  filters.value[activeFilter.value] = option === '全部' ? '' : option
  activeFilter.value = null
}

// --- 数据过滤：关键词 + 多条件筛选 ---
const displayItems = computed(() => {
  let list = [...allItems.value]

  // 关键词过滤：匹配物品名称 / 场所 / 具体位置
  const kw = appliedKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(item =>
      (item.itemName || '').toLowerCase().includes(kw) ||
      (item.locationTag || '').toLowerCase().includes(kw) ||
      (item.locationDetail || '').toLowerCase().includes(kw)
    )
  }

  // 类型过滤：中文显示 → 英文枚举
  if (filters.value.type) {
    const val = parseCategory(filters.value.type)
    if (val) list = list.filter(item => item.category === val)
  }

  // 场所过滤：精确匹配
  if (filters.value.location) {
    list = list.filter(item => item.locationTag === filters.value.location)
  }

  // 颜色过滤：精确匹配
  if (filters.value.color) {
    list = list.filter(item => item.color === filters.value.color)
  }

  // 时间过滤：发现时间在 N 天以内
  const days = TIME_FILTER_DAYS[filters.value.time]
  if (days) {
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000
    list = list.filter(item => {
      const t = parseDate(item.time)
      return !isNaN(t) && t >= threshold
    })
  }

  return list
})

// --- 动态计算各区域高度 ---
// 搜索栏高度由 DOM 实测得到；筛选栏、卡片间距为固定像素值（px，用于 fixed 定位布局）
const GAP_PX = 0            // 搜索栏与筛选栏之间的间距
const FILTER_BAR_PX = 36    // 筛选栏高度
const CARD_TOP_GAP = 8      // 内容区顶部与筛选栏的间距
const searchBarHeight = ref(0)

onMounted(() => {
  nextTick(() => {
    // 延迟测量：等待首帧渲染完成后，搜索栏高度才稳定
    setTimeout(() => {
      const query = uni.createSelectorQuery()
      query.select('.search-bar-fixed').boundingClientRect((rect) => {
        if (rect && rect.height > 0) {
          searchBarHeight.value = rect.height
        } else {
          // 兜底：状态栏高度 + 默认导航栏高度
          const sys = uni.getSystemInfoSync()
          searchBarHeight.value = (sys.statusBarHeight || 0) + 44
        }
      }).exec()
    }, 150)
  })
})

// 筛选栏 top 偏移
const topOffset = computed(() => (searchBarHeight.value + GAP_PX) + 'px')
// 下拉面板 top 偏移
const dropdownTop = computed(() => (searchBarHeight.value + GAP_PX + FILTER_BAR_PX) + 'px')
// 内容区 marginTop，避免被固定栏遮挡
const contentMarginTop = computed(() => (searchBarHeight.value + GAP_PX + FILTER_BAR_PX + CARD_TOP_GAP) + 'px')
// 内容区高度 = 可视区高度 - 顶部占用高度：列表短时不产生多余滚动，列表长时才在内部滚动
const contentHeight = computed(() => {
  const sys = uni.getSystemInfoSync()
  const top = searchBarHeight.value + GAP_PX + FILTER_BAR_PX + CARD_TOP_GAP
  return Math.max(0, sys.windowHeight - top) + 'px'
})
</script>

<style scoped>
/* 页面容器：暖色背景，页面本身不滚动，只有列表区内部滚动 */
.search-page {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: #F9F1E6;
}

/* 搜索栏：固定在顶部，z-index 最高 */
.search-bar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 15rpx;
  z-index: 102;
}

/* 筛选栏：固定在搜索栏下方 */
.filter-bar {
  position: fixed;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #EEEEEE;
  padding: 0 10rpx;
  z-index: 101;
}

/* 漏斗图标按钮 */
.filter-icon-btn {
  width: 60rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filter-icon-btn .icon {
  font-size: 28rpx;
  color: #666666;
}

/* 筛选项：均分宽度，居中对齐 */
.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  font-size: 26rpx;
  color: #666666;
}

/* 激活态：橙色高亮 */
.filter-item.active {
  color: #FF7A33;
  font-weight: bold;
}

.filter-item .arrow {
  margin-left: 6rpx;
  font-size: 20rpx;
  color: #999999;
}

.filter-item.active .arrow {
  color: #FF7A33;
}

/* 下拉选项面板：固定在筛选栏下方 */
.filter-dropdown {
  position: fixed;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  z-index: 100;
  border-bottom: 1rpx solid #EEEEEE;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 下拉选项项 */
.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  color: #333333;
  border-bottom: 1rpx solid #F5F5F5;
}

.dropdown-item:active {
  background-color: #FFF5EE;
}

/* 选中对勾标记 */
.dropdown-item .check {
  color: #FF7A33;
  font-weight: bold;
  font-size: 32rpx;
}

/* 遮罩层：半透明黑色，点击关闭面板 */
.mask {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

/* 内容区：可滚动列表（高度由 contentHeight 动态撑满可视列表区） */
.content-area {
  padding: 20rpx;
  box-sizing: border-box;
}

/* H5 下阻止滚动区在内容不足/到达边界时回弹（露出背景色） */
::v-deep .content-area,
::v-deep .content-area .uni-scroll-view,
::v-deep .content-area .uni-scroll-view-content {
  overscroll-behavior: none;
}

/* 空状态占位容器：撑满列表可视区并居中（普通流，不产生滚动） */
.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>
