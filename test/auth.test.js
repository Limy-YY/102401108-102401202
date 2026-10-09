// auth 单元测试 —— 白盒：判定覆盖 + 条件组合覆盖（mock uni 本地存储）
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  register,
  login,
  logout,
  getToken,
  getCurrentUser,
  isLoggedIn
} from '../utils/auth.js'
import { installUni } from './helpers/uni-mock.js'
import { USERS_KEY } from '../utils/config.js'

const validUser = {
  username: '20240099',
  password: 'secret1',
  nickname: '爱丽丝',
  wechat: 'alice_wx',
  phone: '13800000000'
}

describe('auth 注册/登录/会话', () => {
  let uni
  beforeEach(() => { uni = installUni() })

  test('TC15 注册非法输入：各校验判定分别抛出对应错误', async () => {
    await assert.rejects(() => register({ ...validUser, username: '' }), /请输入学号/)
    await assert.rejects(() => register({ ...validUser, username: 'alice' }), /学号必须为纯数字/)
    await assert.rejects(() => register({ ...validUser, password: '123' }), /密码至少 6 位/)
    await assert.rejects(() => register({ ...validUser, nickname: '  ' }), /请输入昵称/)
    await assert.rejects(() => register({ ...validUser, phone: '123' }), /请输入11位数字/)
  })

  test('TC16 注册重复账号：命中查重判定，抛出已被注册', async () => {
    await register(validUser)
    await assert.rejects(() => register(validUser), /已被注册/)
  })

  test('TC17 注册合法：返回名片(无密码)、写入账号库并建立会话', async () => {
    const user = await register(validUser)
    assert.equal(user.nickname, '爱丽丝')
    assert.equal(user.password, undefined)          // 名片不含密码
    // 账号库 = 演示账号 + 新账号
    assert.equal(uni.getStorageSync(USERS_KEY).length, 2)
    assert.equal(isLoggedIn(), true)
    assert.equal(getToken(), user.id)
    assert.equal(getCurrentUser().id, user.id)
    assert.equal(getCurrentUser().password, undefined)
  })

  test('TC18 登录：账号不存在/密码错误走失败分支，正确则建立会话', async () => {
    await assert.rejects(() => login('nobody', 'whatever'), /学号或密码错误/)
    await assert.rejects(() => login('20240001', 'wrongpw'), /学号或密码错误/)
    const user = await login('20240001', 'campus2024')
    assert.equal(user.nickname, '演示同学')   // 名片不含 username/password，按名片字段断言
    assert.equal(user.password, undefined)
    assert.equal(isLoggedIn(), true)
  })

  test('TC19 退出登录：清除 token 与用户名片', async () => {
    await login('20240001', 'campus2024')
    assert.equal(isLoggedIn(), true)
    logout()
    assert.equal(getToken(), '')
    assert.equal(getCurrentUser(), null)
    assert.equal(isLoggedIn(), false)
  })

  test('TC20 账号库读写抛错：readUsers/writeUsers 捕获，会话仍可建立不崩溃', async () => {
    // 读写账号库(USERS_KEY)均抛错，写会话 TOKEN/USER 正常并真正落盘
    const m = new Map()
    globalThis.uni = {
      getStorageSync: (k) => { if (k === USERS_KEY) throw new Error('corrupt'); return m.has(k) ? m.get(k) : '' },
      setStorageSync: (k, v) => { if (k === USERS_KEY) throw new Error('quota'); m.set(k, v) }
    }
    const user = await register(validUser)
    assert.equal(user.nickname, '爱丽丝')
    assert.equal(isLoggedIn(), true)
  })
})
