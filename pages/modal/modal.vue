<template>
  <view class="modal-container">
    <view class="modal-box">
      <view class="icon">✅</view>
      <text class="title">{{ isEdit ? '修改成功' : '发布成功' }}</text>
      <!-- 副标题：查看详情链接（下划线提示可点击） -->
      <text class="desc-link" @click="goDetail">查看详情</text>
      <view class="btn-group">
        <button class="btn-secondary" @click="goBack">返回首页</button>
        <button class="btn-primary" @click="publishAnother">继续发布</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 从发布页提交后携带 id 跳转过来，用于「查看详情」跳转
const itemId = ref(null)
// 是否为「修改」操作（用于区分弹窗标题：发布成功 / 修改成功）
const isEdit = ref(false)

onLoad((options) => {
  if (options && options.id) {
    itemId.value = Number(options.id)
  }
  if (options && options.mode === 'edit') {
    isEdit.value = true
  }
})

// 查看详情：跳转到刚发布/编辑的那条详情页
const goDetail = () => {
  if (!itemId.value) return
  uni.navigateTo({ url: '/pages/detail/detail?id=' + itemId.value })
}

const goBack = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

const publishAnother = () => {
  uni.setStorageSync('publish_reset', true)
  uni.switchTab({ url: '/pages/publish/publish' })
}
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  width: 560rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

/* 副标题：查看详情链接，橙色 + 下划线提示可点击 */
.desc-link {
  font-size: 28rpx;
  color: #FF7A33;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.6;
  text-decoration: underline;
}

.btn-group {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  /* 关键修复：去除按钮默认边框和背景，确保点击区域正常 */
  border: none;
  padding: 0;
  margin: 0;
}

.btn-secondary {
  background-color: #F5F5F5;
  color: #666;
}

.btn-primary {
  background-color: #FF7A33;
  color: #FFFFFF;
}

/* 按钮点击态 */
.btn-secondary:active {
  background-color: #E0E0E0;
}

.btn-primary:active {
  background-color: #E66A29;
}
</style>
