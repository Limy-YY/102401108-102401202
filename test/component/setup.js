// 组件测试全局环境：mock uni 运行时与页面栈，happy-dom 下保证组件可独立挂载
import { vi } from 'vitest'

// uni 导航 / 提示 / 存储 mock（组件内会调用的方法）
globalThis.uni = {
  navigateTo: vi.fn(),
  switchTab: vi.fn(),
  showToast: vi.fn(),
  hideKeyboard: vi.fn(),
  setClipboardData: vi.fn(),
  getStorageSync: vi.fn(() => ''),
  setStorageSync: vi.fn(),
  removeStorageSync: vi.fn()
}

// uni-app 页面栈 mock：默认空（视为非搜索页）；个别用例可覆盖
globalThis.getCurrentPages = () => []
