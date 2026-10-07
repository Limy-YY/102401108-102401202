// ProfileCard 组件测试：名片渲染、默认兜底、头像
import { describe, test, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileCard from '@/components/ProfileCard.vue'

describe('ProfileCard 个人名片', () => {
  test('渲染昵称、微信号、手机号', () => {
    const wrapper = mount(ProfileCard, {
      props: { userInfo: { nickname: '小明', wechat: 'xm_wx', phone: '13800000000', avatar: '' } }
    })
    expect(wrapper.text()).toContain('小明')
    expect(wrapper.text()).toContain('xm_wx')
    expect(wrapper.text()).toContain('13800000000')
  })

  test('缺省字段走兜底文案', () => {
    const wrapper = mount(ProfileCard, {
      props: { userInfo: { nickname: '', wechat: '', phone: '', avatar: '' } }
    })
    expect(wrapper.text()).toContain('未设置昵称')
    expect(wrapper.findAll('.value').map(n => n.text())).toEqual(['未绑定', '未绑定'])
  })

  test('头像：有地址用地址，无地址用默认头像', () => {
    const withAvatar = mount(ProfileCard, {
      props: { userInfo: { nickname: 'A', avatar: 'data:image/png;base64,xxx' } }
    })
    expect(withAvatar.find('image').attributes('src')).toBe('data:image/png;base64,xxx')

    const noAvatar = mount(ProfileCard, { props: { userInfo: { nickname: 'A', avatar: '' } } })
    expect(noAvatar.find('image').attributes('src')).toBe('/static/default-avatar.png')
  })

  test('一键复制联系方式：有值才显示复制按钮，点击写入剪贴板', async () => {
    const wrapper = mount(ProfileCard, {
      props: { userInfo: { nickname: '小明', wechat: 'xm_wx', phone: '13800000000', avatar: '' } }
    })
    const copyBtns = wrapper.findAll('.copy-btn')
    expect(copyBtns).toHaveLength(2) // 微信、手机号各一个

    await copyBtns[0].trigger('click')
    expect(uni.setClipboardData).toHaveBeenCalledWith({ data: 'xm_wx' })
    await copyBtns[1].trigger('click')
    expect(uni.setClipboardData).toHaveBeenCalledWith({ data: '13800000000' })

    // 未填写联系方式时不显示复制按钮
    const empty = mount(ProfileCard, {
      props: { userInfo: { nickname: '无名氏', wechat: '', phone: '', avatar: '' } }
    })
    expect(empty.findAll('.copy-btn')).toHaveLength(0)
  })
})
