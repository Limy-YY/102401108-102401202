// E2E：发布寻物/招领，并由发布者标记为“已找到”/“已归还”
import { test, expect } from '@playwright/test'
import { uniqueUser, register, publishItem, confirmModal } from './helpers.js'

test('发布寻物：成功后详情可见，标记为“已找到”', async ({ page }) => {
  const user = uniqueUser()
  await register(page, user)

  const name = '测试丢失的钥匙串' + Date.now().toString().slice(-5)
  await publishItem(page, {
    categoryIndex: 0, // 寻物
    name,
    locationIndex: 2, // 图书馆
    detail: '三楼还书处旁',
    date: '2026-10-05',
    hour: 14,
    minute: 30,
    color: '银色'
  })

  // 发布成功页
  await expect(page.locator('.modal-box .title')).toHaveText('发布成功')
  await page.locator('.desc-link').click() // 查看详情
  await page.waitForTimeout(1000)

  // 详情：名称、状态“寻物中”、联系方式为本人
  await expect(page.locator('.info-list')).toContainText(name)
  await expect(page.locator('.info-list')).toContainText('进行中')
  await expect(page.locator('.publisher-section')).toContainText(user.wechat)

  // 标记为已找到
  const completeBtn = page.locator('.action-btn.complete')
  await expect(completeBtn).toHaveText('标记为已找到')
  await completeBtn.click()
  await page.waitForTimeout(600)
  await confirmModal(page) // 确认弹窗

  // 变为完成态：完成提示出现，标记按钮消失
  await expect(page.locator('.done-note')).toContainText('已找到')
  expect(await page.locator('.action-btn.complete').count()).toBe(0)
})

test('发布招领：成功后标记为“已归还”', async ({ page }) => {
  const user = uniqueUser()
  await register(page, user)

  const name = '捡到的校园卡' + Date.now().toString().slice(-5)
  await publishItem(page, {
    categoryIndex: 1, // 招领
    name,
    locationIndex: 4, // 食堂
    detail: '二食堂餐具回收处',
    date: '2026-10-06',
    hour: 10,
    minute: 15,
    color: '蓝色'
  })

  await expect(page.locator('.modal-box .title')).toHaveText('发布成功')
  await page.locator('.desc-link').click()
  await page.waitForTimeout(1000)

  await expect(page.locator('.info-list')).toContainText('进行中')
  const completeBtn = page.locator('.action-btn.complete')
  await expect(completeBtn).toHaveText('标记为已归还')
  await completeBtn.click()
  await page.waitForTimeout(600)
  await confirmModal(page)

  await expect(page.locator('.done-note')).toContainText('已归还')
  expect(await page.locator('.action-btn.complete').count()).toBe(0)
})
