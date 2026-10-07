// E2E 公共辅助：账号生成、登录/注册、picker 滚轮选择、发布表单
import { expect } from '@playwright/test'

// 生成唯一且合法的注册账号（手机号 11 位）
export function uniqueUser() {
  const s = Date.now().toString().slice(-8)
  return {
    username: 'u' + s,
    password: 'secret1',
    nickname: '同学' + s.slice(-4),
    wechat: 'wx_' + s,
    phone: '138' + s
  }
}

// 打开登录页（默认登录表单）
export async function openLogin(page) {
  await page.goto('/#/pages/login/login')
  await page.waitForTimeout(400)
}

// 登录：填写账号/密码并提交，等待 reLaunch 回首页
export async function login(page, username, password) {
  await openLogin(page)
  const inputs = page.locator('input.uni-input-input')
  await inputs.nth(0).fill(username)
  await inputs.nth(1).fill(password)
  await page.locator('.submit-btn').click()
  await page.waitForTimeout(1400)
}

// 注册：切到注册表单，填 6 项并提交
export async function register(page, user) {
  await openLogin(page)
  await page.locator('.mode-tab').nth(1).click() // 切到“注册”
  await page.waitForTimeout(300)
  const inputs = page.locator('input.uni-input-input')
  await inputs.nth(0).fill(user.username)
  await inputs.nth(1).fill(user.password)
  await inputs.nth(2).fill(user.password)
  await inputs.nth(3).fill(user.nickname)
  await inputs.nth(4).fill(user.wechat)
  await inputs.nth(5).fill(user.phone)
  await page.locator('.submit-btn').click()
  await page.waitForTimeout(1400)
}

// 断言顶部 toast 出现某文案（纯文本 toast 用 .uni-simple-toast__text，图标 toast 用 .uni-toast）
export async function expectToast(page, text) {
  await expect(
    page.locator('.uni-simple-toast__text, .uni-toast').filter({ hasText: text }).first()
  ).toBeVisible({ timeout: 3000 })
}

// 确认 uni.showModal 弹窗的主按钮（固定/居中定位，用合成点击确保触发）
export async function confirmModal(page) {
  await page.locator('.uni-modal__btn_primary').first().evaluate(el => el.click())
  await page.waitForTimeout(800)
}

// 操作 picker：打开后用 wheel 事件把每一列设为目标索引，再点“完成”。
// targets 为每一列目标索引组成的数组（单列 picker 传 [idx]，时间传 [时, 分]）。
export async function pick(page, pickerEl, targets) {
  await pickerEl.locator('.input-box').click()
  await page.waitForTimeout(800)

  // 打开后唯一 display:block 的容器
  const container = page.locator('.uni-picker-container[style*="display: block"]')
  await expect(container).toBeVisible()

  const columns = container.locator('uni-picker-view-column')
  if (await columns.count() > 0) {
    // 直接在各列 group 上派发 wheel：先归 0（自动钳制），再到目标，避免 hover/动画判定
    for (let ci = 0; ci < targets.length; ci++) {
      await columns.nth(ci).locator('.uni-picker-view-group').evaluate((group, target) => {
        const wheel = (dy) => group.dispatchEvent(new WheelEvent('wheel', {
          deltaY: dy, bubbles: true, cancelable: true
        }))
        for (let i = 0; i < 80; i++) wheel(-100) // 归 0
        for (let i = 0; i < target; i++) wheel(100) // 到目标
      }, targets[ci])
      await page.waitForTimeout(700) // 等待滚轮 settle
    }
  } else {
    // 桌面端简单列表：直接点目标项
    await container.locator('.uni-picker-select .uni-picker-item').nth(targets[0]).click()
    await page.waitForTimeout(300)
  }

  await container.locator('.uni-picker-action-confirm').evaluate(el => el.click())
  await page.waitForTimeout(600)
}

// 完整发布一条物品，返回发布时填写的数据
export async function publishItem(page, { categoryIndex, name, locationIndex, detail, date, hour, minute, color }) {
  await page.goto('/#/pages/publish/publish')
  await page.waitForTimeout(1000)

  // 类型（第 1 个 picker）
  await pick(page, page.locator('uni-picker').nth(0), [categoryIndex])
  // 物品名称（第 1 个文本输入）
  await page.locator('input.uni-input-input').nth(0).fill(name)
  // 场所（第 2 个 picker）
  await pick(page, page.locator('uni-picker').nth(1), [locationIndex])
  // 位置（第 2 个文本输入）
  await page.locator('input.uni-input-input').nth(1).fill(detail)
  // 日期：先填日期（必须先于时间）
  await page.locator('input.uni-picker-system_input[type="date"]').fill(date)
  await page.waitForTimeout(300)
  // 具体时间（第 4 个 picker，两列）
  await pick(page, page.locator('uni-picker').nth(3), [hour, minute])
  // 颜色（第 3 个文本输入，选填）
  if (color) await page.locator('input.uni-input-input').nth(2).fill(color)

  // 提交
  await page.locator('.submit-btn').click()
  await page.waitForTimeout(1500) // 进入“发布成功”页
}
