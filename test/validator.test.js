// validator 单元测试 —— 白盒：判定覆盖 + 条件覆盖
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateItemName,
  validateCategory,
  validateTime,
  validateLocationTag,
  validateForm
} from '../utils/validator.js'

describe('validator 校验模块', () => {
  test('TC01 物品名称：空串/纯空格/null 命中错误条件，有效值通过', () => {
    assert.equal(validateItemName(''), '物品名称不能为空')
    assert.equal(validateItemName('   '), '物品名称不能为空')
    assert.equal(validateItemName(null), '物品名称不能为空')
    assert.equal(validateItemName('黑色双肩包'), '')
  })

  test('TC02 分类：合法枚举走 true 分支，空值/中文走 false 分支', () => {
    assert.equal(validateCategory('lost'), '')
    assert.equal(validateCategory('found'), '')
    assert.equal(validateCategory(''), '请选择分类')
    assert.equal(validateCategory('寻物'), '请选择分类')
  })

  test('TC03 发现时间：空值报错，非空通过', () => {
    assert.equal(validateTime(''), '请选择发现时间')
    assert.equal(validateTime('2026-10-07 09:00'), '')
  })

  test('TC04 场所：空串/纯空格报错，有效值通过', () => {
    assert.equal(validateLocationTag(''), '请选择场所')
    assert.equal(validateLocationTag('  '), '请选择场所')
    assert.equal(validateLocationTag('图书馆'), '')
  })

  test('TC05 整表校验：全部合法时错误聚合数组为空', () => {
    const errs = validateForm({
      itemName: '折叠伞',
      category: 'lost',
      time: '2026-10-07 09:00',
      locationTag: '教学楼'
    })
    assert.deepEqual(errs, [])
  })

  test('TC06 整表校验：全部缺失时 push 出 4 条错误且顺序固定', () => {
    const errs = validateForm({ itemName: '', category: '', time: '', locationTag: '' })
    assert.equal(errs.length, 4)
    assert.equal(errs[0], '物品名称不能为空')
    assert.equal(errs[3], '请选择场所')
  })
})
