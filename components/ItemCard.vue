<template>
  <!-- 卡片容器：点击跳转详情页 -->
  <view class="item-card" @click="handleClick">
    <!-- 左上角状态标签 -->
    <view class="status-tag" :class="statusClass">
      {{ statusText }}
    </view>

    <!-- 左侧信息区 -->
    <view class="card-left">
      <!-- 物品名称作为大标题 -->
      <text class="item-title">{{ item.itemName }}</text>

      <!-- 时间地点作为副信息 -->
      <view class="info-row">
        <text class="icon">📍</text>
        <text class="text">{{ locationText }}</text>
      </view>

      <view class="info-row">
        <text class="icon">🕒</text>
        <text class="text">{{ foundTimeText }}</text>
      </view>
      <view class="info-row">
        <text class="icon">📅</text>
        <text class="text">{{ publishTimeText }}</text>
      </view>
    </view>

    <!-- 右侧图片区：有图显示缩略图，无图显示占位 -->
    <view class="card-right">
      <image
        v-if="item.images && item.images.length > 0"
        :src="item.images[0]"
        mode="aspectFill"
        class="card-img"
      />
      <view v-else class="placeholder-img">暂无图片</view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { formatStatusText, formatRelativeTime } from '@/utils/format.js'

// 接收父组件传入的物品数据
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// 状态角标文字：寻物中 / 招领中 / 已寻回 / 已招领
const statusText = computed(() => formatStatusText(props.item.category, props.item.status))

// 根据状态动态切换标签样式类
const statusClass = computed(() => {
  return props.item.status === 'ongoing' ? 'tag-ongoing' : 'tag-completed'
})

// 地点展示：场所 + 具体位置拼接
const locationText = computed(() => {
  const tag = props.item.locationTag || ''
  const detail = props.item.locationDetail || ''
  return detail ? `${tag} · ${detail}` : tag
})

// 发现时间：用户在发布时手动选择的日期，与「发布时间」区分
const foundTimeText = computed(() => {
  return props.item.time ? '发现于 ' + props.item.time : '发现时间未知'
})

// 发布时间：系统保存时自动生成，展示为相对时间更直观
const publishTimeText = computed(() => {
  if (!props.item.createTime) return '发布时间未知'
  return '发布于 ' + formatRelativeTime(props.item.createTime)
})

// 点击卡片跳转到详情页，带 id 参数
const handleClick = () => {
  if (!props.item || !props.item.id) {
    return
  }
  uni.navigateTo({
    url: `/pages/detail/detail?id=${props.item.id}`
  })
}
</script>

<style scoped>
/* 卡片容器：相对定位便于标签绝对定位 */
.item-card {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 48rpx 24rpx 24rpx 24rpx;
  margin: 0 30rpx 30rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 左上角状态标签 */
.status-tag {
  position: absolute;
  top: 0;
  left: 0;
  padding: 6rpx 16rpx;
  border-bottom-right-radius: 12rpx;
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: bold;
  line-height: 1.2;
}

/* 进行中状态：橙色 */
.tag-ongoing {
  background-color: #FF7A33;
}

/* 已完成状态：灰色 */
.tag-completed {
  background-color: #999999;
}

/* 左侧信息区 */
.card-left {
  flex: 1;
  padding-left: 10rpx;
  padding-right: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 物品名称：单行省略 */
.item-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
  margin-top: 5rpx;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 副信息行：图标 + 文字 */
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.icon {
  font-size: 24rpx;
  margin-right: 8rpx;
  opacity: 0.7;
}

.text {
  font-size: 26rpx;
  color: #666666;
}

/* 右侧图片容器：固定尺寸，防止被压缩 */
.card-right {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #F5F5F5;
  flex-shrink: 0;
}

.card-img {
  width: 100%;
  height: 100%;
}

/* 无图时的占位区域 */
.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #CCCCCC;
}
</style>
