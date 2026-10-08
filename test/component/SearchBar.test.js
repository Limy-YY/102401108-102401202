// SearchBar 组件测试：v-model、空值提示、非搜索页跳转、搜索页 emit、返回按钮
import { describe, test, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/SearchBar.vue'

describe('SearchBar 搜索栏', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.getCurrentPages = () => [] // 默认非搜索页
  })

  test('非搜索页：显示日期，输入关键词后跳转搜索页并编码', async () => {
    const wrapper = mount(SearchBar)
    expect(wrapper.find('.date-tip').exists()).toBe(true)

    await wrapper.find('input').setValue('黑色 双肩包')
    await wrapper.find('.search-btn').trigger('click')

    expect(globalThis.uni.navigateTo).toHaveBeenCalledTimes(1)
    const url = globalThis.uni.navigateTo.mock.calls[0][0].url
    expect(url).toBe('/pages/search/search?keyword=' + encodeURIComponent('黑色 双肩包'))
  })

  test('空关键词：提示且不跳转', async () => {
    const wrapper = mount(SearchBar)
    await wrapper.find('.search-btn').trigger('click')
    expect(globalThis.uni.navigateTo).not.toHaveBeenCalled()
    expect(globalThis.uni.showToast).toHaveBeenCalled()
  })

  test('搜索页：显示返回按钮，点击搜索改为 emit 事件', async () => {
    globalThis.getCurrentPages = () => [{ route: 'pages/search/search' }]
    const wrapper = mount(SearchBar, { props: { showDate: false } })
    await nextTick() // 等待 onMounted 中 showBack 变更触发的重渲染

    expect(wrapper.find('.back-icon').exists()).toBe(true)
    expect(wrapper.find('.date-tip').exists()).toBe(false)

    await wrapper.find('input').setValue('雨伞')
    await wrapper.find('.search-btn').trigger('click')
    expect(globalThis.uni.navigateTo).not.toHaveBeenCalled()
    expect(wrapper.emitted('search')[0]).toEqual(['雨伞'])
  })
})
