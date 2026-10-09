// 输入框通用规则：统一处理"非法字符即时拦截 + 超长提示"。

// 判断单个按键是否会导致超过最大长度：
// 已输入的字符数达到上限且没有选中文字时，再输入一个可打印字符就会超长。
// currentLength 取表单模型里的当前长度（可靠）；有选区时（替换选中内容）不算超长，
// 交由 maxlength 自行处理。
export function willExceedLength(e, max, currentLength) {
  const el = e && e.target
  const hasSelection = !!(el && el.selectionStart !== el.selectionEnd)
  return currentLength >= max && !hasSelection
}

// 生成一个"纯长度限制"的按键处理器：仅在超过最大长度时拦截并提示。
// 用于只限制字数、不限制字符集的字段（如发布页的物品名称、颜色、位置）。
export function makeLengthGuard(max, message, getLength) {
  return (e) => {
    const key = e.key || ''
    if (key.length !== 1) return
    if (willExceedLength(e, max, getLength())) {
      e.preventDefault()
      uni.showToast({ title: message, icon: 'none' })
    }
  }
}

// ===== 输入过滤（粘贴 / 自动填充兜底）：同步剔除非法字符 =====
// 这些纯函数被登录/注册、编辑资料页的 @input 复用，集中定义便于统一测试与维护。

// 手机号：仅保留数字，截断到 11 位
export function sanitizePhone(raw) {
  return String(raw || '').replace(/\D/g, '').slice(0, 11)
}

// 微信号：仅保留字母、数字、下划线、短横线，截断到 20 位
export function sanitizeWechat(raw) {
  return String(raw || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 20)
}

// 昵称：去除开头空白（空格等），截断到 20 位
export function sanitizeNickname(raw) {
  return String(raw || '').replace(/^\s+/, '').slice(0, 20)
}

// 密码：仅保留 ASCII 可打印字符（字母/数字/符号，不含空格），截断到 16 位
export function sanitizePassword(raw) {
  return String(raw || '').replace(/[^!-~]/g, '').slice(0, 16)
}

// 学号：仅保留数字，截断到 20 位
export function sanitizeUsername(raw) {
  return String(raw || '').replace(/\D/g, '').slice(0, 20)
}
