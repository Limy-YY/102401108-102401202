// ========== 用户注册 / 登录 / 会话（纯前端版，数据存 localStorage）==========
// 无后端：账号库存在浏览器本地，登录成功后把 token（= userId）和用户名片缓存在本地。
// 注意：这是教学演示版，密码以明文存入 localStorage，仅用于本机体验，不适用于生产环境。
import { TOKEN_KEY, USER_KEY, USERS_KEY } from './config.js'
import { ensureSeedData } from './seed.js'

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

// 缓存登录态：token = userId；USER_KEY 只存对外名片（不含密码）
function setSession(user) {
  uni.setStorageSync(TOKEN_KEY, user.id)
  uni.setStorageSync(USER_KEY, publicUser(user))
}

// 对外的用户名片（不返回密码）
function publicUser(u) {
  return u
    ? { id: u.id, nickname: u.nickname, wechat: u.wechat, phone: u.phone, avatar: u.avatar || '' }
    : null
}

// 读取全部注册账号
function readUsers() {
  try {
    const raw = uni.getStorageSync(USERS_KEY)
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    return []
  }
}

function writeUsers(users) {
  try {
    uni.setStorageSync(USERS_KEY, users)
  } catch (e) { /* 存储满等异常：静默跳过 */ }
}

// 生成唯一 userId
function nextId() {
  return 'u' + Date.now() + Math.floor(Math.random() * 1000)
}

// 注册：校验后写入账号库并自动登录
// 入参 { username, password, nickname, wechat, phone }
export async function register(payload) {
  ensureSeedData()
  const username = String(payload.username || '').trim()
  const password = String(payload.password || '')
  const nickname = String(payload.nickname || '').trim()

  if (!username) throw new Error('请输入账号')
  if (password.length < 6) throw new Error('密码至少 6 位')
  if (!nickname) throw new Error('请输入昵称')
  if (!/^1\d{10}$/.test(String(payload.phone || '').trim())) throw new Error('请输入正确的手机号')

  const users = readUsers()
  if (users.some(u => u.username === username)) {
    throw new Error('该账号已被注册')
  }

  const user = {
    id: nextId(),
    username,
    password,
    nickname,
    wechat: String(payload.wechat || '').trim(),
    phone: String(payload.phone || '').trim(),
    avatar: '',
    createTime: Date.now()
  }
  users.push(user)
  writeUsers(users)
  setSession(user)
  return publicUser(user)
}

// 登录：账号密码校验通过后建立会话
export async function login(username, password) {
  ensureSeedData()
  const uname = String(username || '').trim()
  const users = readUsers()
  const user = users.find(u => u.username === uname)
  if (!user || user.password !== String(password || '')) {
    throw new Error('账号或密码错误')
  }
  setSession(user)
  return publicUser(user)
}

// 退出登录：清除本地登录态
export function logout() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}
