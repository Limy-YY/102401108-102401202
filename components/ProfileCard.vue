<template>
  <!-- 用户信息卡片 -->
  <view class="profile-card">
    <!-- 左侧头像：无头像时显示默认图 -->
    <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />

    <!-- 右侧信息区 -->
    <view class="info-area">
      <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
      <view class="info-row">
        <text class="label">微信号：</text>
        <text class="value">{{ userInfo.wechat || '未绑定' }}</text>
        <!-- 一键复制微信号（仅在已填写时出现） -->
        <text
          v-if="userInfo.wechat"
          class="copy-btn"
          @click="copy(userInfo.wechat)"
        >复制</text>
      </view>
      <view class="info-row">
        <text class="label">手机号：</text>
        <text class="value">{{ userInfo.phone || '未绑定' }}</text>
        <!-- 一键复制手机号 -->
        <text
          v-if="userInfo.phone"
          class="copy-btn"
          @click="copy(userInfo.phone)"
        >复制</text>
      </view>
    </view>
  </view>
</template>

<script setup>
// 接收父组件传入的用户信息，提供默认空对象兜底
const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({
      avatar: '',
      nickname: '',
      wechat: '',
      phone: ''
    })
  }
})

// 一键复制联系方式：写入系统剪贴板。
// H5 端 setClipboardData 成功后会自带“内容已复制”提示，无需再手动 toast。
const copy = (text) => {
  uni.setClipboardData({ data: String(text || '') })
}
</script>

<style scoped>
/* 卡片容器：大圆角，阴影轻微 */
.profile-card {
  margin: 30rpx;
  background-color: #FFFFFF;
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* 头像：固定尺寸，圆形 */
.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #F0F0F0;
}

/* 右侧信息区：flex 自适应，防止文字溢出 */
.info-area {
  flex: 1;
  margin-left: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

/* 昵称：单行省略 */
.nickname {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 信息行：标签 + 值 */
.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 24rpx;
  color: #999999;
  flex-shrink: 0;
}

/* 值：单行省略，防止长文本撑破布局 */
.value {
  font-size: 24rpx;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 一键复制按钮：小号橙色描边胶囊，点击即复制该联系方式 */
.copy-btn {
  flex-shrink: 0;
  margin-left: 12rpx;
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  color: #FF7A33;
  border: 1rpx solid #FF7A33;
  border-radius: 24rpx;
  line-height: 1.6;
}

.copy-btn:active {
  background-color: #FFF1E8;
}
</style>
