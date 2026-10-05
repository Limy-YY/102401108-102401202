// ========== 用户注册 / 登录 / 会话（对接后端，多用户集中存储）==========
// 账号与物品数据都在后端；这里只负责：
//   - 调用后端注册 / 登录接口
//   - 把登录成功后下发的 token 和用户名片缓存在本地（用于免登录与展示）
import { request } from './http.js'
import { TOKEN_KEY, USER_KEY } from './config.js'

// 读取本地缓存的 token
export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

// 读取本地缓存的当前用户名片
export function getCurrentUser() {
  return uni.getStorageSync(USER_KEY) || null
}

// 是否已登录（本地有 token 即视为已登录）
export function isLoggedIn() {
  return !!getToken()
}

// 缓存登录态
function setSession(token, user) {
  uni.setStorageSync(TOKEN_KEY, token)
  uni.setStorageSync(USER_KEY, user)
}

// 注册：调用后端，成功后自动登录
// 入参 { username, password, nickname, wechat, phone }
export async function register(payload) {
  const res = await request('/api/auth/register', { method: 'POST', data: payload })
  setSession(res.token, res.user)
  return res.user
}

// 登录
export async function login(username, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    data: { username, password }
  })
  setSession(res.token, res.user)
  return res.user
}

// 退出登录：清除本地登录态
export function logout() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}
