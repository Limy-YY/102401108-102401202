// E2E：集中浏览、关键词搜索、详情查看联系方式
import { test, expect } from '@playwright/test'
import { login } from './helpers.js'

const HOME = /#\/(pages\/index\/index)?$/

test.beforeEach(async ({ page }) => {
  await login(page, 'demo', '123456')
})

test('首页浏览：寻物/招领 Tab 切换显示对应分类', async ({ page }) => {
  await expect(page).toHaveURL(HOME)

  // 默认寻物 Tab：含寻物物品，不含招领物品
  await expect(page.locator('.item-card', { hasText: '黑色双肩包' })).toBeVisible()
  expect(await page.locator('.item-card', { hasText: '白色无线耳机' }).count()).toBe(0)

  // 切到招领
  await page.locator('.category-tabs .tab').nth(1).click()
  await expect(page.locator('.item-card', { hasText: '白色无线耳机' })).toBeVisible()
  expect(await page.locator('.item-card', { hasText: '黑色双肩包' }).count()).toBe(0)
})

test('关键词搜索：搜“雨伞”只保留雨伞结果', async ({ page }) => {
  await page.goto('/#/pages/search/search?keyword=' + encodeURIComponent('雨伞'))
  await page.waitForTimeout(1000)

  const cards = page.locator('.item-card')
  await expect(cards).toHaveCount(1)
  await expect(cards.first()).toContainText('蓝色雨伞')
})

test('搜索无结果：展示空状态', async ({ page }) => {
  await page.goto('/#/pages/search/search?keyword=' + encodeURIComponent('zzz不存在物品'))
  await page.waitForTimeout(1000)
  await expect(page.locator('.empty-wrap')).toBeVisible()
  expect(await page.locator('.item-card').count()).toBe(0)
})

test('详情页：查看物品信息与发布者联系方式', async ({ page }) => {
  // 从首页寻物列表点“黑色双肩包”
  await page.locator('.item-card', { hasText: '黑色双肩包' }).click()
  await page.waitForTimeout(1000)
  await expect(page).toHaveURL(/detail\?id=/)

  // 物品名称
  await expect(page.locator('.info-list')).toContainText('黑色双肩包')
  // 发布者名片：昵称 + 微信号 + 手机号
  const publisher = page.locator('.publisher-section')
  await expect(publisher).toContainText('演示同学')
  await expect(publisher).toContainText('demo001')
  await expect(publisher).toContainText('13800000001')
})
