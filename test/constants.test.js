// 常量一致性单元测试（node:test）
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CATEGORY_OPTIONS, CATEGORY_VALUES, STATUS_OPTIONS, STATUS_VALUES,
  LOCATION_TAGS, COLOR_LIST, TIME_FILTER_DAYS
} from '../utils/constants.js'

describe('枚举常量一致性', () => {
  test('分类/状态的中文选项与英文取值一一对应', () => {
    assert.equal(CATEGORY_OPTIONS.length, CATEGORY_VALUES.length)
    assert.equal(STATUS_OPTIONS.length, STATUS_VALUES.length)
    assert.deepEqual(CATEGORY_VALUES, ['lost', 'found'])
    assert.deepEqual(STATUS_VALUES, ['ongoing', 'completed'])
  })

  test('场所/颜色无重复，时间筛选天数正确', () => {
    assert.equal(new Set(LOCATION_TAGS).size, LOCATION_TAGS.length)
    assert.equal(new Set(COLOR_LIST).size, COLOR_LIST.length)
    assert.equal(TIME_FILTER_DAYS['一天内'], 1)
  })
})
