// 分类映射
const CATEGORY_MAP = {
  found: '招领',
  lost: '寻物'
}

// 状态映射
const STATUS_MAP = {
  ongoing: '进行中',
  completed: '已完成'
}

// 分类英文转中文
export function formatCategory(cat) {
  return CATEGORY_MAP[cat] || cat
}

// 状态码转中文
export function formatStatus(status) {
  return STATUS_MAP[status] || status
}

// 时间戳转 YYYY-MM-DD HH:mm
export function formatTime(timestamp) {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

// 相对时间：刚刚 / x分钟前 / x小时前 / x天前
export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  return formatTime(timestamp)
}

// 按关键词和分类过滤列表
export function filterItems(items, keyword, category) {
  return items.filter(item => {
    const matchKeyword = !keyword || item.title.includes(keyword) || item.location.includes(keyword)
    const matchCategory = !category || item.category === category
    return matchKeyword && matchCategory
  })
}
