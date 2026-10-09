// inputRules 单元测试 —— 覆盖输入过滤纯函数与移动端非法字符兜底
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  sanitizePhone,
  sanitizeWechat,
  sanitizeNickname,
  sanitizePassword,
  sanitizeUsername,
  makeSanitizeInput
} from '../utils/inputRules.js'

// makeSanitizeInput 需要 uni.showToast，用内存 mock 捕获提示文案
let toasts
beforeEach(() => {
  toasts = []
  globalThis.uni = { showToast: ({ title }) => toasts.push(title) }
})

// 等待一个宏任务，让 makeSanitizeInput 内部的 nextTick 回退逻辑执行完
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('输入过滤纯函数（粘贴/自动填充兜底）', () => {
  test('sanitizePhone：仅保留数字并截断到 11 位', () => {
    assert.equal(sanitizePhone('1380000abc00'), '138000000')
    assert.equal(sanitizePhone('138-0000-0000'), '13800000000')
    assert.equal(sanitizePhone('138000000001234'), '13800000000')
  })

  test('sanitizeWechat：仅保留字母/数字/下划线/短横线并截断到 20 位', () => {
    assert.equal(sanitizeWechat('ab_c-d$e'), 'ab_c-de')
    assert.equal(sanitizeWechat('a b'), 'ab')
    assert.equal(sanitizeWechat('x'.repeat(25)), 'x'.repeat(20))
  })

  test('sanitizeNickname：去除开头空白并截断到 20 位', () => {
    assert.equal(sanitizeNickname('  你好'), '你好')
    assert.equal(sanitizeNickname('  '), '')
    assert.equal(sanitizeNickname('  中 间'), '中 间')
  })

  test('sanitizePassword：仅保留 ASCII 可打印字符（去空格/中文）并截断到 16 位', () => {
    assert.equal(sanitizePassword('a b!'), 'ab!')
    assert.equal(sanitizePassword('中abc'), 'abc')
    assert.equal(sanitizePassword('x'.repeat(20)), 'x'.repeat(16))
  })

  test('sanitizeUsername：仅保留数字并截断到 20 位', () => {
    assert.equal(sanitizeUsername('20abc00'), '2000')
    assert.equal(sanitizeUsername('20240001'), '20240001')
  })
})

describe('makeSanitizeInput 移动端非法字符兜底', () => {
  test('合法输入：原样写入、不提示', async () => {
    let wrote = ''
    const handler = makeSanitizeInput(sanitizePhone, '请输入数字', (v) => { wrote = v })
    handler({ detail: { value: '13800000000' } })
    await flush()
    assert.equal(wrote, '13800000000')
    assert.deepEqual(toasts, [])
  })

  test('非法字符：提示并回退（先写原始值再写清洗值）', async () => {
    const writes = []
    const handler = makeSanitizeInput(sanitizePhone, '请输入数字', (v) => { writes.push(v) })
    handler({ detail: { value: '138a' } })
    assert.deepEqual(writes, ['138a'])           // 先写入原始值，触发响应式
    await flush()
    assert.deepEqual(writes, ['138a', '138'])    // 下一拍回退为清洗值
    assert.deepEqual(toasts, ['请输入数字'])
  })

  test('空串输入单个非法字符：回退为空串', async () => {
    let wrote = ''
    const handler = makeSanitizeInput(sanitizeUsername, '请输入数字', (v) => { wrote = v })
    handler({ detail: { value: 'a' } })
    await flush()
    assert.equal(wrote, '')
    assert.deepEqual(toasts, ['请输入数字'])
  })

  test('detail.value 缺失：按空串处理、不提示', async () => {
    let wrote = 'x'
    const handler = makeSanitizeInput(sanitizeUsername, '请输入数字', (v) => { wrote = v })
    handler({ detail: {} })
    await flush()
    assert.equal(wrote, '')
    assert.deepEqual(toasts, [])
  })
})
