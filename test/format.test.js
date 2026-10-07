// format 单元测试 —— 白盒：判定覆盖/条件组合覆盖；黑盒补充：边界值分析
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatCategory,
  formatStatus,
  parseCategory,
  formatStatusText,
  formatTime,
  formatRelativeTime,
  parseDate
} from '../utils/format.js'

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('format 格式化模块', () => {
  test('TC07 分类/状态映射：合法枚举显示中文，非法值原样返回（判定 false 分支）', () => {
    assert.equal(formatCategory('lost'), '寻物')
    assert.equal(formatCategory('found'), '招领')
    assert.equal(formatCategory('xxx'), 'xxx')
    assert.equal(formatStatus('ongoing'), '进行中')
    assert.equal(formatStatus('completed'), '已完成')
    assert.equal(formatStatus('unknown'), 'unknown')
  })

  test('TC08 parseCategory：中文转英文，非中文原样返回', () => {
    assert.equal(parseCategory('寻物'), 'lost')
    assert.equal(parseCategory('招领'), 'found')
    assert.equal(parseCategory('lost'), 'lost')
  })

  test('TC09 formatStatusText：分类×状态 四组条件组合全覆盖', () => {
    assert.equal(formatStatusText('lost', 'ongoing'), '寻物中')
    assert.equal(formatStatusText('found', 'ongoing'), '招领中')
    assert.equal(formatStatusText('lost', 'completed'), '已找到')
    assert.equal(formatStatusText('found', 'completed'), '已归还')
  })

  test('TC10 formatTime：输出 YYYY-MM-DD HH:mm 格式', () => {
    assert.match(formatTime(new Date(2026, 9, 7, 9, 5).getTime()), /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)
  })

  test('TC11 formatRelativeTime：相对时间各判定边界值', () => {
    const now = Date.now()
    assert.equal(formatRelativeTime(now), '刚刚')                 // 0
    assert.equal(formatRelativeTime(now - 59 * 1000), '刚刚')    // <1 分钟上界
    assert.equal(formatRelativeTime(now - MIN), '1分钟前')        // 1 分钟边界
    assert.equal(formatRelativeTime(now - HOUR + 1000), '59分钟前')
    assert.equal(formatRelativeTime(now - HOUR), '1小时前')       // 1 小时边界
    assert.equal(formatRelativeTime(now - DAY), '1天前')          // 1 天边界
    assert.equal(formatRelativeTime(now - 7 * DAY + HOUR), '6天前')
    assert.match(formatRelativeTime(now - 7 * DAY), /^\d{4}-\d{2}-\d{2}/) // ≥7 天走完整格式
  })

  test('TC12 parseDate：合法日期得时间戳，缺段/非数字得 NaN', () => {
    assert.equal(parseDate('2026-10-07'), new Date(2026, 9, 7).getTime())
    assert.ok(Number.isNaN(parseDate('2026-10')))
    assert.ok(Number.isNaN(parseDate('xxxx-yy-zz')))
  })
})
