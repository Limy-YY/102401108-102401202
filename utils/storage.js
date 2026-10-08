// 物品数据层（纯前端版，无后端）：全部存浏览器 localStorage，广场共享。
// 所有函数均为异步（返回 Promise），调用方需 await，签名与旧版一致。
import { ITEMS_KEY, USERS_KEY, USER_KEY } from './config.js'
import { ensureSeedData } from './seed.js'

// 旧版本分类曾以中文「寻物/招领」存储，这里统一迁移为英文枚举
const LEGACY_CATEGORY = { '寻物': 'lost', '招领': 'found' }

// 规整单条物品（兼容老分类）
function normalize(item) {
  return { ...item, category: LEGACY_CATEGORY[item.category] || item.category }
}

// 读取全部物品
function readItems() {
  try {
    const raw = uni.getStorageSync(ITEMS_KEY)
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    return []
  }
}

function writeItems(items) {
  try {
    uni.setStorageSync(ITEMS_KEY, items)
  } catch (e) { /* 存储满等异常：静默跳过 */ }
}

// 读取全部账号
function readUsers() {
  try {
    const raw = uni.getStorageSync(USERS_KEY)
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    return []
  }
}

// 对外的用户名片（不返回密码）
function publicUser(u) {
  return u
    ? { id: u.id, nickname: u.nickname, wechat: u.wechat, phone: u.phone, avatar: u.avatar || '' }
    : null
}

// 广场：获取全部物品（共享），按最新发布优先
export async function getItems() {
  ensureSeedData()
  return readItems()
    .map(normalize)
    .sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
}

// 我的发布：当前登录用户自己的物品
export async function getMyItems() {
  const me = uni.getStorageSync(USER_KEY) || null
  const myId = me ? me.id : ''
  return readItems()
    .filter(i => i.publisherId === myId)
    .map(normalize)
    .sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
}

// 新增一条记录；id / publisherId / createTime 由本地生成
export async function saveItem(item) {
  const me = uni.getStorageSync(USER_KEY) || null
  const now = Date.now()
  const record = {
    id: now,
    publisherId: me ? me.id : '',
    category: item.category || '',
    itemName: item.itemName || '',
    locationTag: item.locationTag || '',
    locationDetail: item.locationDetail || '',
    time: item.time || '',
    color: item.color || '',
    images: Array.isArray(item.images) ? item.images : [],
    detail: item.detail || '',
    status: item.status === 'completed' ? 'completed' : 'ongoing',
    createTime: now
  }
  const items = readItems()
  items.push(record)
  writeItems(items)
  return normalize(record)
}

// 更新单条记录（仅本人，调用方已保证权限）
export async function updateItem(id, updates) {
  const items = readItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) throw new Error('物品不存在')
  const fields = ['category', 'itemName', 'locationTag', 'locationDetail', 'time', 'color', 'images', 'detail', 'status']
  fields.forEach(f => {
    if (updates[f] !== undefined) items[idx][f] = updates[f]
  })
  writeItems(items)
  return normalize(items[idx])
}

// 删除单条记录（仅本人，调用方已保证权限）
export async function deleteItem(id) {
  const items = readItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) throw new Error('物品不存在')
  items.splice(idx, 1)
  writeItems(items)
  return { ok: true }
}

// 单条详情：返回 { item, publisher }
export async function getItemById(id) {
  const items = readItems()
  const item = items.find(i => i.id === id)
  if (!item) throw new Error('物品不存在')
  const publisher = readUsers().find(u => u.id === item.publisherId)
  return { item: normalize(item), publisher: publicUser(publisher) }
}
