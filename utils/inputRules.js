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
