// EmptyState 组件测试
import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/EmptyState.vue'

describe('EmptyState 空状态', () => {
  test('渲染空状态图标与“暂无信息”文案', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.text()).toContain('暂无信息')
    expect(wrapper.find('.empty-icon').exists()).toBe(true)
  })
})
