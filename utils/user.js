// 当前登录用户资料：从本地缓存的登录态读取（多用户集中存储版）。
import { getCurrentUser } from './auth.js'

// 兜底：未登录时返回空资料，避免渲染崩溃（正常流程下登录守卫会拦截）
const DEFAULT_USER = {
  id: '',
  avatar: '',
  nickname: '未登录用户',
  wechat: '',
  phone: ''
}

// 返回一份拷贝，避免各页面共用引用导致意外修改
export function getUserInfo() {
  const user = getCurrentUser()
  if (!user) return { ...DEFAULT_USER }
  return {
    id: user.id,
    avatar: user.avatar || '',
    nickname: user.nickname || '',
    wechat: user.wechat || '',
    phone: user.phone || ''
  }
}
