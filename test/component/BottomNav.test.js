// BottomNav 组件测试：当前页高亮、切换 Tab、当前页不重复跳转
import { describe, test, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BottomNav from '@/components/BottomNav.vue'

describe('BottomNav 底部导航', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.getCurrentPages = () => [{ route: 'pages/index/index' }]
  })

  test('当前在首页：首页标签高亮', () => {
    const wrapper = mount(BottomNav)
    const labels = wrapper.findAll('.label')
    expect(labels[0].classes()).toContain('active')
    expect(labels[1].classes()).not.toContain('active')
  })

  test('点击发布/我的：switchTab 到对应页', async () => {
    const wrapper = mount(BottomNav)
    const items = wrapper.findAll('.nav-item')

    await items[1].trigger('click') // 中间发布按钮
    expect(globalThis.uni.switchTab).toHaveBeenCalledWith({ url: '/pages/publish/publish' })

    await items[2].trigger('click') // 我的
    expect(globalThis.uni.switchTab).toHaveBeenCalledWith({ url: '/pages/profile/profile' })
  })

  test('点击当前所在 Tab：不重复跳转', async () => {
    const wrapper = mount(BottomNav)
    await wrapper.findAll('.nav-item')[0].trigger('click')
    expect(globalThis.uni.switchTab).not.toHaveBeenCalled()
  })
})
