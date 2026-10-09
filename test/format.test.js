// format 单元测试：时间解析 parseDate（锁定 'YYYY-MM-DD HH:mm' 兼容，防回归）
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDate } from '../utils/format.js'

describe('parseDate 时间解析', () => {
  test('纯日期解析为当天零点时间戳', () => {
    assert.equal(parseDate('2026-10-07'), new Date(2026, 9, 7).getTime())
  })

  test('带时分的时间串也能解析（搜索页时间筛选依赖此格式）', () => {
    assert.equal(parseDate('2026-10-07 14:30'), new Date(2026, 9, 7, 14, 30).getTime())
  })

  test('非法/缺段/空串返回 NaN', () => {
    assert.ok(Number.isNaN(parseDate('abc')))
    assert.ok(Number.isNaN(parseDate('2026-10')))
    assert.ok(Number.isNaN(parseDate('')))
  })
})
