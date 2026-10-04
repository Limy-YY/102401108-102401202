<template>
  <!-- 空状态占位：列表无数据时展示 -->
  <view class="empty-state">
    <text class="empty-icon">📭</text>
    <text class="empty-text">暂无信息</text>
  </view>
</template>

<style scoped>
/* 容器：垂直居中 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0;
}

/* 图标：半透明降低存在感 */
.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

/* 提示文字 */
.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
