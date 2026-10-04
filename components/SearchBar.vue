<template>
  <!-- 搜索栏：包含日期提示、返回按钮、输入框 -->
  <view class="search-bar">
    <!-- 日期提示：仅在首页等场景显示 -->
    <view class="date-tip" v-if="showDate">
       {{ currentDate }}
    </view>

    <!-- 搜索主体区 -->
    <view class="search-wrapper">
      <!-- 返回按钮：仅在搜索页显示 -->
      <view v-if="showBack" class="back-icon" @click="handleBack">
        <text class="arrow-icon">‹</text>
      </view>

      <!-- 输入框容器：点击任意位置聚焦输入 -->
      <view class="input-container" @click="focusInput">
        <view class="search-icon"></view>
        <input
          ref="inputRef"
          :focus="isFocused"
          class="search-input"
          v-model="keyword"
          placeholder="搜索物品名称"
          placeholder-style="color: #B3B3B3; font-size: 28rpx;"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">搜索</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { backOrHome, getCurrentRoute } from '@/utils/nav.js'

// 支持 v-model 双向绑定，showDate 控制日期提示显隐
const props = defineProps({
  modelValue: { type: String, default: '' },
  showDate: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'search'])

// 动态生成当前日期字符串
const currentDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const keyword = ref('')
const isFocused = ref(false)
const showBack = ref(false)

// 监听父组件传入值变化，同步到本地 keyword
watch(() => props.modelValue, (val) => { keyword.value = val })
// 监听本地 keyword 变化，同步回父组件（v-model 双向绑定）
watch(keyword, (val) => { emit('update:modelValue', val) })

onMounted(() => {
  keyword.value = props.modelValue
  // 根据当前页面路由判断是否显示返回按钮
  showBack.value = getCurrentRoute() === 'pages/search/search'
})

// 点击输入框容器，主动聚焦 input
const focusInput = () => {
  // 1. 先收起键盘并将 focus 重置为 false，确保状态发生变化
  uni.hideKeyboard()
  isFocused.value = false

  // 2. 等待 DOM 更新后，再将 focus 设为 true，触发原生组件聚焦
  nextTick(() => {
    isFocused.value = true
  })
}

// 返回上一页
const handleBack = () => { backOrHome() }

// 搜索处理：空值校验 + 页面路由判断
const handleSearch = () => {
  const value = keyword.value.trim()
  if (!value) {
    uni.showToast({ title: '请输入搜索内容', icon: 'none' })
    return
  }
  // 已在搜索页：触发 search 事件通知父组件
  // 不在搜索页：跳转到搜索页并携带 keyword 参数
  if (getCurrentRoute() === 'pages/search/search') {
    emit('search', value)
  } else {
    uni.navigateTo({ url: `/pages/search/search?keyword=${encodeURIComponent(value)}` })
  }
}
</script>

<style scoped>
/* 搜索栏容器：暖色背景 */
.search-bar {
  padding: 80rpx 40rpx 40rpx;
  background-color: #F9F1E6;
}

/* 日期提示文字 */
.date-tip {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

/* 搜索主体：返回按钮 + 输入框 */
.search-wrapper {
  display: flex;
  align-items: center;
}

/* 返回按钮区域 */
.back-icon {
  width: 60rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -20rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

/* 返回箭头：微调位置使其视觉居中 */
.arrow-icon {
  font-size: 56rpx;
  color: #333333;
  font-weight: 300;
  line-height: 1;
  position: relative;
  transform: translateY(-5px);
}

/* 输入框容器：白色圆角胶囊 */
.input-container {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 40rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
  height: 80rpx;
  box-sizing: border-box;
}

/* 搜索图标 */
.search-icon {
  font-size: 28rpx;
  color: #999999;
  margin-right: 10rpx;
}

/* 输入框本体 */
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  height: 60rpx;
}

/* 搜索按钮：橙色圆角 */
.search-btn {
  background-color: #FF7A33;
  color: #FFFFFF;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
}
</style>
