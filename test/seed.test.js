// seed 单元测试 —— 白盒：判定覆盖（空/非空两条路径）
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ensureSeedData } from '../utils/seed.js'
import { installUni } from './helpers/uni-mock.js'
import { USERS_KEY, ITEMS_KEY } from '../utils/config.js'

describe('seed 演示数据播种', () => {
  let uni
  beforeEach(() => { uni = installUni() })

  test('TC13 空库：播种演示账号与至少 6 条物品', () => {
    ensureSeedData()
    const users = uni.getStorageSync(USERS_KEY)
    const items = uni.getStorageSync(ITEMS_KEY)
    assert.equal(users.length, 1)
    assert.equal(users[0].username, 'demo')
    assert.ok(items.length >= 6)
    assert.ok(items.some(i => i.category === 'lost'))
    assert.ok(items.some(i => i.category === 'found'))
  })

  test('TC14 非空库：已有数据不被覆盖（判定 false 分支）', () => {
    uni.setStorageSync(USERS_KEY, [{ id: 'custom' }])
    uni.setStorageSync(ITEMS_KEY, [{ id: 1 }])
    ensureSeedData()
    assert.equal(uni.getStorageSync(USERS_KEY).length, 1)
    assert.equal(uni.getStorageSync(ITEMS_KEY).length, 1)
    assert.equal(uni.getStorageSync(USERS_KEY)[0].id, 'custom')
  })

  test('TC15 存储写入抛错（如配额满）：被捕获且不崩溃', () => {
    // setStorageSync 一律抛错，模拟 localStorage 配额超限
    globalThis.uni = {
      getStorageSync: () => '',
      setStorageSync: () => { throw new Error('quota exceeded') }
    }
    assert.doesNotThrow(() => ensureSeedData())
  })
})
