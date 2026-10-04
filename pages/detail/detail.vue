<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="title">{{ formatCategory(item.category) }}详情</text>
    </view>

    <!-- 内容区 -->
    <view class="content" v-if="item">
      <!-- 图片：有有效图片时展示，否则展示占位 -->
      <view class="image-section" v-if="imageList.length > 0">
        <image
          v-for="(img, idx) in imageList"
          :key="idx"
          :src="img"
          mode="aspectFill"
          class="detail-img"
          @click="previewImage(idx)"
        />
      </view>
      <!-- 无图片时的占位提示 -->
      <view class="image-empty" v-else>
        <text>暂无图片</text>
      </view>

      <!-- 信息列表 -->
      <view class="info-list">
        <view class="info-row">
          <text class="label">物品名称</text>
          <text class="value">{{ item.itemName }}</text>
        </view>
        <view class="info-row">
          <text class="label">类型</text>
          <text class="value">{{ formatCategory(item.category) }}</text>
        </view>
        <view class="info-row">
          <text class="label">状态</text>
          <text class="value">{{ formatStatus(item.status) }}</text>
        </view>
        <view class="info-row">
          <text class="label">场所</text>
          <text class="value">{{ item.locationTag }}</text>
        </view>
        <view class="info-row">
          <text class="label">具体位置</text>
          <text class="value">{{ item.locationDetail }}</text>
        </view>
        <view class="info-row">
          <text class="label">发现时间</text>
          <text class="value">{{ item.time }}</text>
        </view>
        <view class="info-row">
          <text class="label">发布时间</text>
          <text class="value">{{ publishTime }}</text>
        </view>
        <view class="info-row">
          <text class="label">颜色</text>
          <text class="value">{{ item.color }}</text>
        </view>
        <view class="info-row vertical">
          <text class="label">细节描述</text>
          <text class="value desc">{{ item.detail }}</text>
        </view>
      </view>

      <!-- 发布者个人名片 -->
      <view class="publisher-section">
        <text class="publisher-title">联系发布者</text>
        <ProfileCard :userInfo="userInfo" />
      </view>
    </view>

    <!-- 底部操作：仅发布者本人可见 -->
    <view class="bottom-actions" v-if="isMine">
      <button class="action-btn delete" @click="handleDelete">删除</button>
      <button class="action-btn primary" @click="goEdit">编辑</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getItemById, deleteItem } from '@/utils/storage.js'
import { formatCategory, formatStatus, formatTime } from '@/utils/format.js'
import ProfileCard from '@/components/ProfileCard.vue'
import { getUserInfo } from '@/utils/user.js'

const item = ref(null)
const itemId = ref(null)
// 发布者个人名片（当前为单用户本地数据，取自用户资料）
const userInfo = getUserInfo()

// 是否本人发布：仅本人可编辑/删除；老数据无 publisherId 时视为本人（单用户本地兼容）
const isMine = computed(() => {
  if (!item.value) return false
  if (!item.value.publisherId) return true
  return item.value.publisherId === userInfo.id
})

// 图片列表：兼容 images 缺失/为空/含空字符串等旧数据，过滤出有效图片地址
const imageList = computed(() => {
  const imgs = item.value && item.value.images
  return Array.isArray(imgs) ? imgs.filter(Boolean) : []
})

// 发布时间：createTime 是保存时系统自动生成的毫秒时间戳，格式化后展示
const publishTime = computed(() => {
  const t = item.value && item.value.createTime
  return t ? formatTime(t) : '未知'
})

// 点击图片放大预览
const previewImage = (index) => {
  uni.previewImage({
    urls: imageList.value,
    current: imageList.value[index]
  })
}

onLoad((options) => {
  const id = options && options.id
  if (id) {
    itemId.value = Number(id)
    item.value = getItemById(itemId.value)
  }
})

// 返回上一级；若无上级页面（如直接打开），回退到首页
const goBack = () => {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

// 编辑：跳转到发布页。publish 是 tabBar 页，switchTab 无法携带 query 参数，
// 故通过 storage 中转待编辑 id。
const goEdit = () => {
  uni.setStorageSync('edit_item_id', itemId.value)
  uni.switchTab({ url: '/pages/publish/publish' })
}

const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除吗？',
    success: (res) => {
      if (res.confirm) {
        deleteItem(itemId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 800)
      }
    }
  })
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F9F1E6;
}

.top-nav {
  height: 100rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
  flex-shrink: 0;
  position: relative;
}

.back-btn {
  font-size: 60rpx;
  color: #333;
  width: 50rpx;
  z-index: 1;
}

.title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx;
}

.image-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;
  overflow-x: auto;
}

.detail-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

/* 无图片时的占位提示 */
.image-empty {
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  font-size: 26rpx;
  color: #999999;
}

.info-list {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.vertical {
  flex-direction: column;
  gap: 12rpx;
}

.label {
  font-size: 28rpx;
  color: #999;
}

.value {
  font-size: 28rpx;
  color: #333;
  max-width: 60%;
  text-align: right;
}

.value.desc {
  max-width: 100%;
  text-align: left;
  line-height: 1.6;
}

/* 发布者个人名片：负外边距抵消内容区 padding，使名片与信息列表对齐 */
.publisher-section {
  margin-top: 30rpx;
  margin-left: -30rpx;
  margin-right: -30rpx;
}

.publisher-title {
  display: block;
  font-size: 26rpx;
  color: #999;
  padding: 0 30rpx 10rpx;
}

.bottom-actions {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  padding: 0;
  margin: 0;
}

.action-btn.delete {
  background: #F5F5F5;
  color: #666;
}

.action-btn.primary {
  background: #FF7A33;
  color: #FFF;
}
</style>
