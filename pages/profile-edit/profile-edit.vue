<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="title">编辑资料</text>
      <text class="save-btn" :class="{ disabled: saving }" @click="handleSave">保存</text>
    </view>

    <!-- 表单区 -->
    <view class="form-area">
      <!-- 头像 -->
      <view class="avatar-section">
        <image v-if="form.avatar" class="avatar" :src="form.avatar" mode="aspectFill" @click="chooseAvatar" />
        <view v-else class="avatar avatar-placeholder" @click="chooseAvatar">{{ avatarInitial }}</view>
        <view class="avatar-actions" @click="chooseAvatar">
          <text class="avatar-title">头像</text>
          <text class="avatar-tip">点击更换头像</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="item-label">昵称<text class="req-star">*</text></text>
        <input class="input-box" v-model="form.nickname" placeholder="请输入昵称" placeholder-class="ph" />
      </view>

      <!-- 微信号 -->
      <view class="form-item">
        <text class="item-label">微信号</text>
        <input class="input-box" v-model="form.wechat" placeholder="选填，方便失主联系你" placeholder-class="ph" />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="item-label">手机号<text class="req-star">*</text></text>
        <input class="input-box" v-model="form.phone" placeholder="请输入手机号" placeholder-class="ph" />
      </view>
    </view>

    <!-- 头像裁剪：自定义裁剪范围 -->
    <AvatarCropper v-if="showCropper" :src="cropSrc" @confirm="onCropConfirm" @cancel="showCropper = false" />
  </view>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUserInfo } from '@/utils/user.js'
import { updateUser } from '@/utils/auth.js'
import AvatarCropper from '@/components/AvatarCropper.vue'
import { backOrHome } from '@/utils/nav.js'

const form = reactive({ avatar: '', nickname: '', wechat: '', phone: '' })
const saving = ref(false)
const showCropper = ref(false)
const cropSrc = ref('')

// 进入时回填当前资料
onLoad(() => {
  Object.assign(form, getUserInfo())
})

// 无头像时取昵称首字占位（兼容中文 / emoji）
const avatarInitial = computed(() => {
  const name = (form.nickname || '').trim()
  return name ? [...name][0] : '友'
})

// 选择头像：先选图，再进入自定义裁剪（裁剪结果转为 data URL 持久化）
const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['album', 'camera'],
    sizeType: ['original', 'compressed'],
    success: (res) => {
      const p = res.tempFilePaths && res.tempFilePaths[0]
      if (!p) return
      cropSrc.value = p
      showCropper.value = true
    }
  })
}

// 裁剪确认：拿到方形 data URL 后写入表单头像
const onCropConfirm = (dataUrl) => {
  form.avatar = dataUrl
  showCropper.value = false
}

const goBack = () => backOrHome()

// 保存：校验后写入本地并刷新缓存
const handleSave = async () => {
  if (saving.value) return
  if (!form.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!form.phone.trim()) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(form.phone.trim())) {
    uni.showToast({ title: '请输入11位数字', icon: 'none' })
    return
  }
  saving.value = true
  try {
    await updateUser({
      avatar: form.avatar,
      nickname: form.nickname.trim(),
      wechat: form.wechat.trim(),
      phone: form.phone.trim()
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => backOrHome(), 600)
  } catch (e) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  height: 100dvh;
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

.save-btn {
  position: absolute;
  right: 30rpx;
  background-color: #FF7A33;
  color: #FFFFFF;
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  line-height: 1;
  z-index: 1;
}

.save-btn.disabled {
  opacity: 0.6;
}

.form-area {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx;
  box-sizing: border-box;
}

.avatar-section {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #F0F0F0;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  font-weight: bold;
  color: #FF7A33;
  background-color: #FFE1CE;
}

.avatar-actions {
  margin-left: 30rpx;
  display: flex;
  flex-direction: column;
}

.avatar-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.avatar-tip {
  font-size: 24rpx;
  color: #999;
}

.form-item {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.item-label {
  font-size: 28rpx;
  color: #333;
  width: 140rpx;
  flex-shrink: 0;
}

/* 必填项红标：inline 保证与标签同行，不换行 */
.req-star {
  color: #E64340;
  margin-left: 4rpx;
  display: inline;
}

.input-box {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #333;
  text-align: right;
  -webkit-user-select: text;
  user-select: text;
}

.ph {
  color: #BBBBBB;
}
</style>
