import { CATEGORY_OPTIONS, CATEGORY_VALUES, STATUS_OPTIONS, STATUS_VALUES } from './constants.js'

// 分类 / 状态映射：由 constants.js 中「显示中文 / 存储英文」的平行数组派生，
// 保证枚举只在一处维护，避免多处硬编码后出现不一致。
const CATEGORY_MAP = Object.fromEntries(CATEGORY_VALUES.map((v, i) => [v, CATEGORY_OPTIONS[i]]))
const STATUS_MAP = Object.fromEntries(STATUS_VALUES.map((v, i) => [v, STATUS_OPTIONS[i]]))

// ========== 英文 → 中文（显示用）==========

export function formatCategory(cat) {
  return CATEGORY_MAP[cat] || cat
}

export function formatStatus(status) {
  return STATUS_MAP[status] || status
}

// ========== 中文 → 英文（存储用）==========

export function parseCategory(cat) {
  const i = CATEGORY_OPTIONS.indexOf(cat)
  return i >= 0 ? CATEGORY_VALUES[i] : cat
}

// 组合状态标签（卡片角标 / 详情用）：
//   进行中：寻物中 / 招领中；已完成：已找到 / 已归还
export function formatStatusText(category, status) {
  if (status === 'completed') {
    return category === 'lost' ? '已找到' : '已归还'
  }
  return category === 'lost' ? '寻物中' : '招领中'
}

// ========== 时间相关 ==========

export function formatTime(timestamp) {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

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

// 将 'YYYY-MM-DD' 或 'YYYY-MM-DD HH:mm' 解析为时间戳。
// 手动解析（而非 new Date(str)），规避 iOS 对带横杠日期解析的兼容问题；
// 兼容可选的时间部分——搜索页时间筛选传入的 item.time 是带 HH:mm 的完整串。
export function parseDate(str) {
  const s = String(str || '').trim()
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/)
  if (!m) return NaN
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const h = m[4] === undefined ? 0 : Number(m[4])
  const mi = m[5] === undefined ? 0 : Number(m[5])
  return new Date(y, mo - 1, d, h, mi).getTime()
}

// ========== 发布页时间上限（发现/丢失时间不得晚于当前时刻） ==========

const pad2 = (n) => String(n).padStart(2, '0')

// 当前本地日期字符串 'YYYY-MM-DD'（零填充，字典序即时间序）
export function todayStr(now = new Date()) {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
}

// 当前本地时间字符串 'HH:mm'（零填充）
export function nowTimeStr(now = new Date()) {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
}

// 所选日期是否晚于今天（发布日）。日期/时间均为零填充字符串，直接按字典序比较。
export function isDateAfterToday(dateStr, now = new Date()) {
  return String(dateStr || '') > todayStr(now)
}

// 所选时间是否晚于当前时刻（仅当所选日期为今天时才需要拦截）。
export function isTimeAfterNow(dateStr, timeStr, now = new Date()) {
  if (String(dateStr || '') !== todayStr(now)) return false
  return String(timeStr || '') > nowTimeStr(now)
}
