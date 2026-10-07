// storage 单元测试 —— 白盒：基本路径 + 判定覆盖；含发布→标记完成端到端流程（mock uni）
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  getItems,
  getMyItems,
  saveItem,
  updateItem,
  deleteItem,
  getItemById
} from '../utils/storage.js'
import { installUni } from './helpers/uni-mock.js'
import { USERS_KEY, USER_KEY, ITEMS_KEY } from '../utils/config.js'

const U1 = { id: 'u1', username: 'u1', password: 'p1', nickname: '同学一', wechat: 'w1', phone: '13800000001', avatar: '' }
const U2 = { id: 'u2', username: 'u2', password: 'p2', nickname: '同学二', wechat: 'w2', phone: '13800000002', avatar: '' }
const publicCard = (u) => ({ id: u.id, nickname: u.nickname, wechat: u.wechat, phone: u.phone, avatar: '' })

describe('storage 物品数据层', () => {
  let uni
  beforeEach(() => {
    uni = installUni({ [USERS_KEY]: [U1, U2], [USER_KEY]: publicCard(U1) })
  })

  test('TC20 getItems：物品空库触发播种，并按发布时间倒序', async () => {
    const items = await getItems()
    assert.ok(items.length >= 6)
    for (let i = 1; i < items.length; i++) {
      assert.ok(items[i - 1].createTime >= items[i].createTime)
    }
  })

  test('TC21 saveItem：生成 id/publisherId/createTime，状态默认 ongoing，images 非数组归一', async () => {
    const saved = await saveItem({ category: 'lost', itemName: '钥匙', images: undefined })
    assert.equal(typeof saved.id, 'number')
    assert.equal(saved.publisherId, 'u1')
    assert.equal(typeof saved.createTime, 'number')
    assert.equal(saved.status, 'ongoing')
    assert.deepEqual(saved.images, [])
    assert.ok(uni.getStorageSync(ITEMS_KEY).some(i => i.id === saved.id))
  })

  test('TC22 getMyItems：仅返回当前登录用户的发布', async () => {
    uni.setStorageSync(ITEMS_KEY, [
      { id: 1, publisherId: 'u1', createTime: 1, status: 'ongoing', category: 'lost', itemName: 'a' },
      { id: 2, publisherId: 'u2', createTime: 2, status: 'ongoing', category: 'lost', itemName: 'b' },
      { id: 3, publisherId: 'u1', createTime: 3, status: 'ongoing', category: 'found', itemName: 'c' }
    ])
    const mine = await getMyItems()
    assert.equal(mine.length, 2)
    assert.ok(mine.every(i => i.publisherId === 'u1'))
  })

  test('TC23 updateItem：合并字段并可标记完成，不存在则抛错', async () => {
    const saved = await saveItem({ category: 'lost', itemName: '旧名', locationTag: '教学楼', time: '2026-10-07 09:00' })
    const updated = await updateItem(saved.id, { itemName: '新名', status: 'completed' })
    assert.equal(updated.itemName, '新名')
    assert.equal(updated.status, 'completed')
    await assert.rejects(() => updateItem(999999, { status: 'completed' }), /物品不存在/)
  })

  test('TC24 deleteItem：删除成功返回 ok，再删/不存在抛错', async () => {
    const saved = await saveItem({ category: 'lost', itemName: '待删', locationTag: '教学楼', time: '2026-10-07 09:00' })
    const res = await deleteItem(saved.id)
    assert.deepEqual(res, { ok: true })
    await assert.rejects(() => deleteItem(saved.id), /物品不存在/)
  })

  test('TC25 getItemById：返回物品与发布者名片(无密码)，不存在抛错', async () => {
    const saved = await saveItem({ category: 'found', itemName: '钱包', locationTag: '食堂', time: '2026-10-07 12:00' })
    const { item, publisher } = await getItemById(saved.id)
    assert.equal(item.id, saved.id)
    assert.equal(publisher.id, 'u1')
    assert.equal(publisher.nickname, '同学一')
    assert.equal(publisher.password, undefined)
    await assert.rejects(() => getItemById(999), /物品不存在/)
  })

  test('TC26 端到端：发布→我的发布→标记已找到/已归还→详情状态正确', async () => {
    const lost = await saveItem({ category: 'lost', itemName: '学生证', locationTag: '实验楼', time: '2026-10-07 09:00' })
    const found = await saveItem({ category: 'found', itemName: '保温杯', locationTag: '宿舍楼', time: '2026-10-07 10:00' })

    let mine = await getMyItems()
    assert.ok(mine.some(i => i.id === lost.id && i.status === 'ongoing'))

    await updateItem(lost.id, { status: 'completed' })
    await updateItem(found.id, { status: 'completed' })

    assert.equal((await getItemById(lost.id)).item.status, 'completed')
    assert.equal((await getItemById(found.id)).item.status, 'completed')
  })

  test('TC27 兼容旧数据：中文分类「寻物/招领」规整为英文枚举', async () => {
    uni.setStorageSync(ITEMS_KEY, [
      { id: 1, publisherId: 'u1', createTime: 1, category: '寻物', itemName: '旧物品' }
    ])
    const items = await getItems()
    assert.equal(items[0].category, 'lost')
  })

  test('TC28 getItemById：发布者读取抛错/不存在时 publisher 为 null，物品仍返回', async () => {
    // 读账号库抛错（覆盖 readUsers catch），物品库正常返回
    globalThis.uni = {
      getStorageSync: (k) => {
        if (k === USERS_KEY) throw new Error('corrupt')
        if (k === ITEMS_KEY) return [{ id: 1, publisherId: 'ghost', createTime: 1, category: 'lost', itemName: '无主' }]
        return ''
      },
      setStorageSync: () => {}
    }
    const { item, publisher } = await getItemById(1)
    assert.equal(item.id, 1)
    assert.equal(publisher, null)
  })

  test('TC29 读取抛错（存储损坏）：readItems 捕获后返回空数组，不崩溃', async () => {
    globalThis.uni = {
      getStorageSync: (key) => { if (key === ITEMS_KEY) throw new Error('corrupt'); return '' },
      setStorageSync: () => {}
    }
    const items = await getItems()
    assert.deepEqual(items, [])
  })

  test('TC30 写入抛错（配额满）：writeItems 捕获，saveItem 仍返回记录不崩溃', async () => {
    globalThis.uni = {
      getStorageSync: (key) => (key === USER_KEY ? { id: 'u1' } : ''),
      setStorageSync: () => { throw new Error('quota') }
    }
    const saved = await saveItem({ category: 'lost', itemName: '钥匙' })
    assert.equal(saved.publisherId, 'u1')
    assert.equal(saved.status, 'ongoing')
  })
})
