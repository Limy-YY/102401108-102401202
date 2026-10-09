<template>
  <view class="page-container">
    <!-- 状态栏占位：自定义导航下移，避开手机顶部状态栏（时间/电量/信号） -->
    <view class="status-bar-space" :style="statusBarHeight ? { height: statusBarHeight + 'px' } : null"></view>

    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="back-btn" @click="goBack">‹</view>
      <text class="title">{{ item ? formatCategory(item.category) : '' }}详情</text>
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
        <ProfileCard :userInfo="publisher" />
      </view>
    </view>

    <!-- 底部操作：仅发布者本人可见 -->
    <view class="bottom-actions" v-if="isMine">
      <!-- 进行中：可一键标记完成；已完成：可重新寻物/招领，恢复为进行中 -->
      <button v-if="item.status === 'ongoing'" class="action-btn complete" @click="handleComplete">
        {{ item.category === 'lost' ? '标记为已找到' : '标记为已归还' }}
      </button>
      <button v-else class="action-btn complete" @click="handleReopen">
        重新{{ item.category === 'lost' ? '寻物' : '招领' }}
      </button>
      <button class="action-btn delete" @click="handleDelete">删除</button>
      <button class="action-btn edit" @click="goEdit">编辑</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getItemById, deleteItem, updateItem } from '@/utils/storage.js'
import { formatCategory, formatStatus, formatTime } from '@/utils/format.js'
import ProfileCard from '@/components/ProfileCard.vue'
import { getCurrentUser } from '@/utils/auth.js'
import { backOrHome, getStatusBarHeight } from '@/utils/nav.js'

const item = ref(null)
const itemId = ref(null)

// 状态栏高度：自定义导航栏下移，避开手机顶部状态栏（H5 下为 0，由 CSS env() 兜底）
const statusBarHeight = getStatusBarHeight()
// 发布者个人名片：从本地账号库按 publisherId 查得（多用户：显示真正的发布者）
const publisher = ref({ nickname: '', wechat: '', phone: '', avatar: '' })

// 是否本人发布：仅本人可编辑/删除
const isMine = computed(() => {
  if (!item.value) return false
  const me = getCurrentUser()
  return !!me && item.value.publisherId === me.id
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

onLoad(async (options) => {
  const id = options && options.id
  if (id) {
    itemId.value = Number(id)
    try {
      const res = await getItemById(itemId.value)
      item.value = res.item
      publisher.value = res.publisher || { nickname: '', wechat: '', phone: '', avatar: '' }
    } catch (e) {
      item.value = null
    }
  }
})

// 返回上一级；若无上级页面（如直接打开），回退到首页
const goBack = () => {
  backOrHome()
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
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteItem(itemId.value)
          uni.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 800)
        } catch (e) {
          uni.showToast({ title: e.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 标记为已找到 / 已归还：把状态改为 completed，避免他人重复询问和无效联系
const handleComplete = () => {
  const doneLabel = item.value.category === 'lost' ? '已找到' : '已归还'
  uni.showModal({
    title: '确认更新',
    content: `确认将此物品标记为「${doneLabel}」吗？标记后其他人仍可浏览，但会看到已完成状态。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await updateItem(itemId.value, { status: 'completed' })
          item.value.status = 'completed'
          uni.showToast({ title: '已标记' + doneLabel, icon: 'success' })
        } catch (e) {
          uni.showToast({ title: e.message || '更新失败', icon: 'none' })
        }
      }
    }
  })
}

// 重新寻物 / 招领：把状态恢复为进行中（此前已标记完成）
const handleReopen = () => {
  const reopenLabel = item.value.category === 'lost' ? '寻物' : '招领'
  uni.showModal({
    title: '重新' + reopenLabel,
    content: '确认将此物品恢复为「进行中」吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await updateItem(itemId.value, { status: 'ongoing' })
          item.value.status = 'ongoing'
          uni.showToast({ title: '已恢复为进行中', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: e.message || '更新失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #F9F1E6;
  overflow: hidden;
}

/* 状态栏占位：白色背景与顶部导航栏连成一体，高度由 env()（iOS 刘海）或 statusBarHeight（App）决定 */
.status-bar-space {
  flex-shrink: 0;
  height: env(safe-area-inset-top);
  background-color: #FFFFFF;
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
  height: 0;
  min-height: 0;
  overflow-y: auto;
  /* 底部不留 padding：末项下方多余空白会导致内容能显示完却仍可下滑一点距离 */
  padding: 30rpx 30rpx 0;
  box-sizing: border-box;
  overscroll-behavior: none;
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
  -webkit-user-select: text;
  user-select: text;
}

.value.desc {
  max-width: 100%;
  text-align: left;
  line-height: 1.6;
}

/* 发布者个人名片：负外边距抵消内容区 padding，使名片与信息列表对齐；
   底部负外边距抵消名片自身的 margin-bottom，避免末项之后残留多余空白导致仍可下滑 */
.publisher-section {
  margin-top: 30rpx;
  margin-left: -30rpx;
  margin-right: -30rpx;
  margin-bottom: -30rpx;
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
  color: #E64340;
}

.action-btn.edit {
  background: #F5F5F5;
  color: #666;
}

.action-btn.complete {
  background: #FF7A33;
  color: #FFF;
}

</style>
