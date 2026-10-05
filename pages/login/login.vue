<template>
  <view class="auth-page">
    <!-- 顶部占位 -->
    <view class="top-space"></view>

    <!-- 品牌区 -->
    <view class="brand">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">校园失物招领</text>
      <text class="slogan">{{ isLogin ? '欢迎回来，请登录' : '第一次使用，请注册账号' }}</text>
    </view>

    <!-- 模式切换：登录 / 注册 -->
    <view class="mode-tabs">
      <view
        class="mode-tab"
        :class="{ active: isLogin }"
        @click="isLogin = true"
      >登录</view>
      <view
        class="mode-tab"
        :class="{ active: !isLogin }"
        @click="isLogin = false"
      >注册</view>
    </view>

    <!-- 表单卡片 -->
    <view class="form-card">
      <!-- 账号 -->
      <view class="field">
        <text class="field-label">账号</text>
        <input class="field-input" v-model="form.username" placeholder="请输入账号" placeholder-class="ph" />
      </view>

      <!-- 密码 -->
      <view class="field">
        <text class="field-label">密码</text>
        <input class="field-input" v-model="form.password" password placeholder="请输入密码" placeholder-class="ph" />
      </view>

      <!-- 确认密码（仅注册） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">确认密码</text>
        <input class="field-input" v-model="form.confirm" password placeholder="请再次输入密码" placeholder-class="ph" />
      </view>

      <!-- 昵称（仅注册） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">昵称</text>
        <input class="field-input" v-model="form.nickname" placeholder="取个大家能认出的昵称" placeholder-class="ph" />
      </view>

      <!-- 微信号（仅注册，选填） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">微信号</text>
        <input class="field-input" v-model="form.wechat" placeholder="选填，方便失主联系你" placeholder-class="ph" />
      </view>

      <!-- 手机号（仅注册，必填） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">手机号</text>
        <input class="field-input" v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="ph" />
      </view>

      <!-- 提交按钮 -->
      <view class="submit-btn" :class="{ disabled: submitting }" @click="onSubmit">
        {{ submitting ? '请稍候...' : (isLogin ? '登 录' : '注册并进入') }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { register, login } from '@/utils/auth.js'

const isLogin = ref(true)
const submitting = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirm: '',
  nickname: '',
  wechat: '',
  phone: ''
})

// 客户端校验：返回错误文案或空串
function validate() {
  if (!form.username.trim()) return '请输入账号'
  if (!form.password) return '请输入密码'
  if (form.password.length < 6) return '密码至少 6 位'
  if (!isLogin.value) {
    if (form.confirm !== form.password) return '两次输入的密码不一致'
    if (!form.nickname.trim()) return '请输入昵称'
    if (!form.phone.trim()) return '请输入手机号'
    if (!/^1\d{10}$/.test(form.phone.trim())) return '手机号格式不正确'
  }
  return ''
}

async function onSubmit() {
  if (submitting.value) return
  const err = validate()
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }
  submitting.value = true
  try {
    if (isLogin.value) {
      await login(form.username.trim(), form.password)
      uni.showToast({ title: '登录成功', icon: 'success' })
    } else {
      await register({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim(),
        wechat: form.wechat.trim(),
        phone: form.phone.trim()
      })
      uni.showToast({ title: '注册成功', icon: 'success' })
    }
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 600)
  } catch (e) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #F9F1E6;
  padding: 0 50rpx;
  box-sizing: border-box;
}

.top-space {
  height: calc(120rpx + env(safe-area-inset-top));
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50rpx;
}

.logo {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.slogan {
  font-size: 26rpx;
  color: #999999;
}

.mode-tabs {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 30rpx;
}

.mode-tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  padding: 16rpx 0;
  border-radius: 12rpx;
}

.mode-tab.active {
  background-color: #FF7A33;
  color: #FFFFFF;
  font-weight: bold;
}

.form-card {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.field {
  margin-bottom: 30rpx;
}

.field-label {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
}

.field-input {
  background-color: #F7F3EC;
  border-radius: 12rpx;
  padding: 22rpx 24rpx;
  font-size: 30rpx;
  color: #333333;
}

.ph {
  color: #BBBBBB;
}

.submit-btn {
  margin-top: 20rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: #FF7A33;
  color: #FFFFFF;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.submit-btn.disabled {
  opacity: 0.6;
}
</style>
