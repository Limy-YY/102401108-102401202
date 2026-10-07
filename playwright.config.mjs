// Playwright 配置：对构建后的 H5 做端到端测试
import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:' + PORT,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:' + PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
})
