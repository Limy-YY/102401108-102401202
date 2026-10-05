// 物品数据层：全部走后端 API（多用户集中存储，广场共享）。
// 所有函数均为异步（返回 Promise），调用方需 await。
import { request } from './http.js'

// 旧版本分类曾以中文「寻物/招领」存储，这里统一迁移为英文枚举
const LEGACY_CATEGORY = { '寻物': 'lost', '招领': 'found' }

// 规整后端返回的单条物品（兼容老分类）
function normalize(item) {
  return { ...item, category: LEGACY_CATEGORY[item.category] || item.category }
}

// 广场：获取全部物品（共享）
export async function getItems() {
  const res = await request('/api/items')
  return (res.items || []).map(normalize)
}

// 我的发布：当前登录用户自己的物品
export async function getMyItems() {
  const res = await request('/api/items/mine', { auth: true })
  return (res.items || []).map(normalize)
}

// 新增一条记录；id / createTime / publisherId 由后端生成
export async function saveItem(item) {
  const res = await request('/api/items', { method: 'POST', data: item, auth: true })
  return normalize(res.item)
}

// 更新单条记录（仅本人，后端校验）
export async function updateItem(id, updates) {
  const res = await request('/api/items/' + id, { method: 'PUT', data: updates, auth: true })
  return normalize(res.item)
}

// 删除单条记录（仅本人，后端校验）
export async function deleteItem(id) {
  return request('/api/items/' + id, { method: 'DELETE', auth: true })
}

// 单条详情：返回 { item, publisher }
export async function getItemById(id) {
  return request('/api/items/' + id)
}
