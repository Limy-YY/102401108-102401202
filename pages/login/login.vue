<template>
  <view class="auth-page">
    <!-- 顶部占位 -->
    <view class="top-space"></view>

    <!-- 品牌区 -->
    <view class="brand">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">校园失物招领</text>
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
      <!-- 学号 -->
      <view class="field">
        <text class="field-label">学号<text class="req-star">*</text></text>
        <input class="field-input" :value="form.username" maxlength="20" :placeholder="isLogin ? '请输入学号' : '请输入学号（20位以内的数字）'" placeholder-class="ph" @input="onUsernameInput" @keydown="onUsernameKeydown" @blur="checkDuplicate" />
        <text class="dup-hint" v-if="!isLogin && dupHint">{{ dupHint }}</text>
      </view>

      <!-- 密码 -->
      <view class="field">
        <text class="field-label">密码<text class="req-star">*</text></text>
        <input class="field-input" :value="form.password" password maxlength="16" :placeholder="isLogin ? '请输入密码' : '请输入密码（6-16位字母、数字或符号）'" placeholder-class="ph" @input="onPasswordInput" @keydown="onPasswordKeydown" />
      </view>

      <!-- 确认密码（仅注册） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">确认密码<text class="req-star">*</text></text>
        <input class="field-input" :value="form.confirm" password maxlength="16" placeholder="请再次输入密码" placeholder-class="ph" @input="onConfirmInput" @keydown="onConfirmKeydown" />
      </view>

      <!-- 昵称（仅注册） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">昵称<text class="req-star">*</text></text>
        <input class="field-input" :value="form.nickname" maxlength="20" placeholder="取个大家能认出的昵称" placeholder-class="ph" @input="onNicknameInput" @keydown="onNicknameKeydown" />
      </view>

      <!-- 微信号（仅注册，选填） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">微信号</text>
        <input class="field-input" :value="form.wechat" maxlength="20" placeholder="选填，方便失主联系你" placeholder-class="ph" @input="onWechatInput" @keydown="onWechatKeydown" />
      </view>

      <!-- 手机号（仅注册，必填） -->
      <view class="field" v-if="!isLogin">
        <text class="field-label">手机号<text class="req-star">*</text></text>
        <input class="field-input" :value="form.phone" maxlength="11" placeholder="请输入手机号" placeholder-class="ph" @input="onPhoneInput" @keydown="onPhoneKeydown" />
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
import { register, login, isStudentIdTaken } from '@/utils/auth.js'
import {
  sanitizeUsername,
  sanitizePassword,
  sanitizePhone,
  sanitizeWechat,
  sanitizeNickname,
  makeSanitizeInput
} from '@/utils/inputRules.js'

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

// 注册模式下学号实时查重提示（失焦时校验是否已被注册）
const dupHint = ref('')
const checkDuplicate = () => {
  if (isLogin.value) return
  const s = form.username.trim()
  if (!s || !/^\d+$/.test(s)) {
    dupHint.value = ''
    return
  }
  dupHint.value = isStudentIdTaken(s) ? '该学号已被注册' : ''
}
// 按键拦截（桌面端）：单个可打印字符若非法则直接阻止录入，光标不移动。
// 超长限制由 maxlength 静默吞掉，不在按键层提示。
const onUsernameKeydown = (e) => {
  const key = e.key || ''
  if (key.length !== 1) return
  if (!/\d/.test(key)) {
    e.preventDefault()
    uni.showToast({ title: '请输入数字', icon: 'none' })
  }
}
const onPasswordKeydown = (e) => {
  const key = e.key || ''
  if (key.length !== 1) return
  if (!/[!-~]/.test(key)) {
    e.preventDefault()
    uni.showToast({ title: '请输入数字、字母或符号', icon: 'none' })
  }
}
// 确认密码：与密码相同的拦截规则
const onConfirmKeydown = (e) => {
  const key = e.key || ''
  if (key.length !== 1) return
  if (!/[!-~]/.test(key)) {
    e.preventDefault()
    uni.showToast({ title: '请输入数字、字母或符号', icon: 'none' })
  }
}
const onPhoneKeydown = (e) => {
  const key = e.key || ''
  if (key.length !== 1) return
  if (!/\d/.test(key)) {
    e.preventDefault()
    uni.showToast({ title: '请输入数字', icon: 'none' })
  }
}
const onWechatKeydown = (e) => {
  const key = e.key || ''
  if (key.length !== 1) return
  if (!/[A-Za-z0-9_-]/.test(key)) {
    e.preventDefault()
    uni.showToast({ title: '请输入字母、数字、下划线或短横线', icon: 'none' })
  }
}
const onNicknameKeydown = (e) => {
  const key = e.key || ''
  if (key.length !== 1) return
  if (key === ' ' && !String(form.nickname || '').trim()) {
    e.preventDefault()
    uni.showToast({ title: '昵称不能以空格开头', icon: 'none' })
  }
}

// 输入兜底（移动端）：软键盘不触发 keydown，非法字符只能在 @input 里清洗并回退 DOM。
// 超长由 maxlength 静默吞掉（不触发 input），故这里只过滤非法字符。
const baseUsernameInput = makeSanitizeInput(sanitizeUsername, '请输入数字', (v) => { form.username = v })
const onUsernameInput = (e) => {
  dupHint.value = ''
  baseUsernameInput(e)
}
const onPasswordInput = makeSanitizeInput(sanitizePassword, '请输入数字、字母或符号', (v) => { form.password = v })
const onConfirmInput = makeSanitizeInput(sanitizePassword, '请输入数字、字母或符号', (v) => { form.confirm = v })
const onPhoneInput = makeSanitizeInput(sanitizePhone, '请输入数字', (v) => { form.phone = v })
const onWechatInput = makeSanitizeInput(sanitizeWechat, '请输入字母、数字、下划线或短横线', (v) => { form.wechat = v })
const onNicknameInput = makeSanitizeInput(sanitizeNickname, '昵称不能以空格开头', (v) => { form.nickname = v })

// 客户端校验：返回友好错误文案或空串
// 学号：20 位以内数字；密码：6~16 位字母、数字、符号（ASCII 可打印字符）
function validate() {
  const username = form.username.trim()
  if (!username) return '请输入学号（20位以内的数字）'
  if (username.length > 20 || !/^\d+$/.test(username)) return '学号请输入20位以内的数字'
  if (!form.password) return '请输入密码（6-16位字母、数字或符号）'
  if (form.password.length < 6 || form.password.length > 16 || !/^[!-~]+$/.test(form.password)) {
    return '密码请输入6-16位字母、数字或符号'
  }
  if (!isLogin.value) {
    if (!form.confirm.trim()) return '请再次输入密码以确认'
    if (form.confirm !== form.password) return '两次输入的密码不一致'
    if (!form.nickname.trim()) return '请输入昵称（20字以内）'
    if (!form.phone.trim()) return '请输入手机号（11位数字）'
    if (!/^1\d{10}$/.test(form.phone.trim())) return '手机号请输入11位数字（以1开头）'
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
  height: calc(40rpx + env(safe-area-inset-top));
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.logo {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 20rpx;
  margin-top: 80rpx;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
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
  margin-bottom: 24rpx;
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
  padding: 32rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.field {
  margin-bottom: 22rpx;
}

.field-label {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
}

/* 必填项红标：inline 保证与标签同行，不换行 */
.req-star {
  color: #E64340;
  margin-left: 4rpx;
  display: inline;
}

/* 学号查重提示 */
.dup-hint {
  display: block;
  font-size: 22rpx;
  color: #E64340;
  margin-top: 8rpx;
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
  margin-top: 12rpx;
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
