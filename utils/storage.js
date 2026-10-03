// 本地存储 key
const STORAGE_KEY = 'lost_found_items'

// 获取全部列表
export function getItems() {
  const data = uni.getStorageSync(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 新增一条记录，自动生成 id、创建时间、默认状态和空图片数组
export function saveItem(item) {
  const items = getItems()
  item.id = Date.now()
  item.createTime = Date.now()
  item.status = 'ongoing'
  item.images = item.images || []
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

// 根据手机号获取某人发布的记录
export function getMyItems(phone) {
  const items = getItems()
  return items.filter(i => i.contactPhone === phone)
}
