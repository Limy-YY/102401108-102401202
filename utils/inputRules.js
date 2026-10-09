// 输入框通用规则：统一处理「非法字符即时拦截 + 超长静默限制」。
// 超长由 maxlength 原生静默吞掉（不触发 input、无提示）；非法字符由
// @keydown（桌面端）在按键层拦截、@input（移动端）在输入后清洗并回退。

import { nextTick } from 'vue'

// ===== 输入过滤纯函数（粘贴 / 自动填充 / 移动端兜底）：同步剔除非法字符并截断 =====

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

// ===== 移动端 @input 兜底 =====
// 手机软键盘不触发 keydown，非法字符无法在按键层拦截，只能在 @input 里清洗。
// 超长由 maxlength 原生静默吞掉（不触发 input），故这里只负责非法字符的过滤与提示。

// 生成一个「非法字符过滤」的 @input 处理器：
// 对 raw 过滤非法字符，若发生变化则提示，并把输入框 DOM 回退到清洗后的值。
export function makeSanitizeInput(sanitize, illegalMsg, set) {
  return (e) => {
    const raw = e.detail.value || ''
    const clean = sanitize(raw)
    if (clean === raw) {
      set(clean)
      return
    }
    uni.showToast({ title: illegalMsg, icon: 'none' })
    // 关键：clean 与当前模型值相同（如空串里输入单个非法字符）时，直接 set(clean) 不会
    // 触发响应式，DOM 里的非法字符会残留。先写 raw 制造一次变更，再下一拍写回 clean，
    // 让 uni-app 的 value 监听把输入框回退到清洗后的值。
    set(raw)
    nextTick(() => set(clean))
  }
}
