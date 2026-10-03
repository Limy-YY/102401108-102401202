import { getUserInfo } from './user.js'

// 本地存储 key
const STORAGE_KEY = 'lost_found_items'

// 旧版本分类曾以中文「寻物/招领」存储，这里统一迁移为英文枚举
const LEGACY_CATEGORY = { '寻物': 'lost', '招领': 'found' }

// 获取全部列表
export function getItems() {
  const data = uni.getStorageSync(STORAGE_KEY)
  if (!data) return []
  let items
  try {
    items = JSON.parse(data)
  } catch (e) {
    return []
  }
  if (!Array.isArray(items)) return []
  // 按发布时间倒序（最新在前），保证列表与「我的发布」排序稳定
  return items.map(item => ({
    ...item,
    category: LEGACY_CATEGORY[item.category] || item.category
  })).sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
}

// 新增一条记录，自动生成 id、发布时间(createTime)、默认状态和空图片数组
export function saveItem(item) {
  const items = getItems()
  item.id = Date.now()
  item.createTime = Date.now()
  item.status = 'ongoing'
  item.images = item.images || []
  item.publisherId = getUserInfo().id
  items.unshift(item)
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(items))
  return item
}

// 更新单条记录的任意字段，status 只允许合法值
export function updateItem(id, updates) {
  const items = getItems()
  const item = items.find(i => i.id === id)
  if (!item) return false
  if (updates.status && !['ongoing', 'completed'].includes(updates.status)) {
    return false
  }
  Object.assign(item, updates)
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(items))
  return true
}

// 根据 id 删除记录
export function deleteItem(id) {
  const items = getItems()
  const index = items.findIndex(i => i.id === id)
  if (index !== -1) {
    items.splice(index, 1)
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(items))
    return true
  }
  return false
}

// 根据 id 查找单条
export function getItemById(id) {
  const items = getItems()
  return items.find(i => i.id === id) || null
}

// 获取「我的发布」：当前为单用户本地应用，本地存储的全部记录都属于当前用户。
// 后续若接入多用户/后端，可改为按发布者标识过滤。
export function getMyItems() {
  return getItems()
}
