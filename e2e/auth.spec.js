// E2E：注册与登录
import { test, expect } from '@playwright/test'
import { uniqueUser, register, login, openLogin, expectToast } from './helpers.js'

// 首页（reLaunch 回首页后 hash 规范化为 "#/"，也兼容全路径）
const HOME = /#\/(pages\/index\/index)?$/

test('注册新用户：成功后自动进入首页并能看到物品卡片', async ({ page }) => {
  const user = uniqueUser()
  await register(page, user)

  await expect(page).toHaveURL(HOME)
  // 首页寻物 Tab 下有演示物品卡片
  await expect(page.locator('.item-card').first()).toBeVisible()
})

test('重复注册同一账号：提示已被注册且不跳转', async ({ page }) => {
  const user = uniqueUser()
  await register(page, user)
  await expect(page).toHaveURL(HOME)

  // 再次用同一账号注册
  await openLogin(page)
  await page.locator('.mode-tab').nth(1).click()
  await page.waitForTimeout(300)
  const inputs = page.locator('input.uni-input-input')
  await inputs.nth(0).fill(user.username)
  await inputs.nth(1).fill(user.password)
  await inputs.nth(2).fill(user.password)
  await inputs.nth(3).fill(user.nickname)
  await inputs.nth(4).fill(user.wechat)
  await inputs.nth(5).fill(user.phone)
  await page.locator('.submit-btn').click()

  await expectToast(page, '该账号已被注册')
  await expect(page).toHaveURL(/#\/pages\/login\/login/)
})

test('登录密码错误：提示账号或密码错误', async ({ page }) => {
  // 直接填写并提交（不使用 login 助手的长等待，以免错过 toast）
  await openLogin(page)
  const inputs = page.locator('input.uni-input-input')
  await inputs.nth(0).fill('demo')
  await inputs.nth(1).fill('wrongpwd')
  await page.locator('.submit-btn').click()

  await expectToast(page, '账号或密码错误')
  await expect(page).toHaveURL(/#\/pages\/login\/login/)
})

test('演示账号登录成功：进入首页', async ({ page }) => {
  await login(page, 'demo', '123456')
  await expect(page).toHaveURL(HOME)
  await expect(page.locator('.item-card').first()).toBeVisible()
})
