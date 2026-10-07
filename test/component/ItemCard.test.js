// ItemCard 组件测试：标题/状态角标/地点时间/图片占位/点击跳详情
import { describe, test, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ItemCard from '@/components/ItemCard.vue'

const baseItem = {
  id: 123,
  category: 'lost',
  status: 'ongoing',
  itemName: '黑色双肩包',
  locationTag: '图书馆',
  locationDetail: '3楼自习区',
  time: '2026-10-07 09:00',
  createTime: Date.now(),
  images: []
}

describe('ItemCard 物品卡片', () => {
  beforeEach(() => { vi.clearAllMocks() })

  test('进行中寻物：渲染标题/寻物中角标/地点时间/无图占位', () => {
    const wrapper = mount(ItemCard, { props: { item: baseItem } })
    expect(wrapper.find('.item-title').text()).toBe('黑色双肩包')

    const tag = wrapper.find('.status-tag')
    expect(tag.text()).toBe('寻物中')
    expect(tag.classes()).toContain('tag-ongoing')

    expect(wrapper.text()).toContain('图书馆 · 3楼自习区')
    expect(wrapper.text()).toContain('发现于 2026-10-07 09:00')
    expect(wrapper.find('.placeholder-img').exists()).toBe(true)
  })

  test('点击卡片跳转详情页并携带 id', async () => {
    const wrapper = mount(ItemCard, { props: { item: baseItem } })
    await wrapper.find('.item-card').trigger('click')
    expect(globalThis.uni.navigateTo).toHaveBeenCalledTimes(1)
    const arg = globalThis.uni.navigateTo.mock.calls[0][0]
    expect(arg.url).toBe('/pages/detail/detail?id=123')
  })

  test('已完成招领：角标为“已归还”且灰色，有图显示缩略图', () => {
    const item = {
      ...baseItem,
      id: 456,
      category: 'found',
      status: 'completed',
      itemName: '棕色卡包',
      images: ['data:image/jpeg;base64,abc']
    }
    const wrapper = mount(ItemCard, { props: { item } })
    const tag = wrapper.find('.status-tag')
    expect(tag.text()).toBe('已归还')
    expect(tag.classes()).toContain('tag-completed')
    expect(wrapper.find('image').attributes('src')).toBe('data:image/jpeg;base64,abc')
    expect(wrapper.find('.placeholder-img').exists()).toBe(false)
  })
})
