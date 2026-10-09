// inputRules 单元测试 —— 覆盖超长判断、纯长度限制处理器与输入过滤纯函数
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  willExceedLength,
  makeLengthGuard,
  sanitizePhone,
  sanitizeWechat,
  sanitizeNickname,
  sanitizePassword,
  sanitizeUsername
} from '../utils/inputRules.js'

// makeLengthGuard 需要 uni.showToast，用内存 mock 捕获提示文案
let toasts
beforeEach(() => {
  toasts = []
  globalThis.uni = { showToast: ({ title }) => toasts.push(title) }
})

describe('willExceedLength 超长判断', () => {
  test('未达上限：返回 false', () => {
    const e = { target: { selectionStart: 10, selectionEnd: 10 } }
    assert.equal(willExceedLength(e, 11, 10), false)
  })

  test('已达上限且无选区：返回 true', () => {
    const e = { target: { selectionStart: 11, selectionEnd: 11 } }
    assert.equal(willExceedLength(e, 11, 11), true)
  })

  test('已达上限但有选区（替换选中内容）：返回 false', () => {
    const e = { target: { selectionStart: 0, selectionEnd: 11 } }
    assert.equal(willExceedLength(e, 11, 11), false)
  })

  test('事件对象缺少 target：按无选区处理，已达上限返回 true', () => {
    assert.equal(willExceedLength({}, 11, 11), true)
  })
})

describe('makeLengthGuard 纯长度限制处理器', () => {
  test('达到上限且输入单个可打印字符：拦截并提示', () => {
    const guard = makeLengthGuard(20, '物品名称最多 20 字', () => 20)
    let prevented = false
    guard({ key: 'a', preventDefault: () => { prevented = true } })
    assert.equal(prevented, true)
    assert.deepEqual(toasts, ['物品名称最多 20 字'])
  })

  test('未达上限：不拦截、不提示', () => {
    const guard = makeLengthGuard(20, '物品名称最多 20 字', () => 19)
    let prevented = false
    guard({ key: 'a', preventDefault: () => { prevented = true } })
    assert.equal(prevented, false)
    assert.deepEqual(toasts, [])
  })

  test('控制键（如 Backspace）：不拦截', () => {
    const guard = makeLengthGuard(20, '物品名称最多 20 字', () => 20)
    let prevented = false
    guard({ key: 'Backspace', preventDefault: () => { prevented = true } })
    assert.equal(prevented, false)
    assert.deepEqual(toasts, [])
  })
})

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
    assert.equal(sanitizeNickname('  中 间'), '中 间')   // 只去掉开头空白，中间保留
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
