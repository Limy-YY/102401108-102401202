// nav 单元测试：路由获取与返回逻辑（手动 stub 全局，node:test）
import { describe, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { getCurrentRoute, backOrHome } from '../utils/nav.js'

// 每个用例前重置全局，避免用例间相互影响
beforeEach(() => {
  globalThis.getCurrentPages = () => []
  globalThis.uni = {}
})

describe('getCurrentRoute', () => {
  test('返回最后一个页面的 route', () => {
    globalThis.getCurrentPages = () => [
      { route: 'pages/index/index' }, { route: 'pages/search/search' }
    ]
    assert.equal(getCurrentRoute(), 'pages/search/search')
  })

  test('无页面返回空串', () => {
    assert.equal(getCurrentRoute(), '')
  })
})

describe('backOrHome', () => {
  test('有上级页面调用 navigateBack', () => {
    let called = 0
    globalThis.getCurrentPages = () => [{ route: 'a' }, { route: 'b' }]
    globalThis.uni = { navigateBack: () => { called++ } }
    backOrHome()
    assert.equal(called, 1)
  })

  test('无上级页面 switchTab 回首页', () => {
    let url = ''
    globalThis.getCurrentPages = () => [{ route: 'pages/index/index' }]
    globalThis.uni = { switchTab: (opt) => { url = opt.url } }
    backOrHome()
    assert.equal(url, '/pages/index/index')
  })
})
