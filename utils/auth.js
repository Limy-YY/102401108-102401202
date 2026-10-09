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

// 学号格式校验：非空 + 20 位以内纯数字（作为注册兜底，与登录页提示一致）
export function validateStudentId(id) {
  const s = String(id || '').trim()
  if (!s) return '请输入学号（20位以内的数字）'
  if (s.length > 20 || !/^\d+$/.test(s)) return '学号请输入20位以内的数字'
  return ''
}

// 学号是否已被注册（供注册页实时查重）
export function isStudentIdTaken(id) {
  const s = String(id || '').trim()
  if (!s) return false
  return readUsers().some(u => u.username === s)
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

  const idErr = validateStudentId(username)
  if (idErr) throw new Error(idErr)
  if (password.length < 6 || password.length > 16 || !/^[!-~]+$/.test(password)) {
    throw new Error('密码请输入6-16位字母、数字或符号')
  }
  if (!nickname || nickname.length > 20) throw new Error('请输入昵称（20字以内）')
  if (!/^1\d{10}$/.test(String(payload.phone || '').trim())) throw new Error('手机号请输入11位数字（以1开头）')

  const users = readUsers()
  if (users.some(u => u.username === username)) {
    throw new Error('该学号已被注册')
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
    throw new Error('学号或密码错误')
  }
  setSession(user)
  return publicUser(user)
}

// 退出登录：清除本地登录态
export function logout() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
}

// 更新当前登录用户资料（昵称 / 微信号 / 手机号 / 头像）。
// 学号作为登录账号不在此处修改；联系方式与物品解耦，改一次资料后
// 所有历史发布详情里的联系方式会自动同步（物品只存 publisherId）。
export async function updateUser(updates) {
  const me = getCurrentUser()
  if (!me) throw new Error('未登录')
  const users = readUsers()
  const idx = users.findIndex(u => u.id === me.id)
  if (idx === -1) throw new Error('用户不存在')
  const fields = ['nickname', 'wechat', 'phone', 'avatar']
  fields.forEach(f => {
    if (updates[f] !== undefined) users[idx][f] = updates[f]
  })
  writeUsers(users)
  setSession(users[idx])
  return publicUser(users[idx])
}
