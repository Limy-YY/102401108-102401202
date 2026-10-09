// 获取当前页面路由（如 'pages/index/index'）；无页面时返回空字符串。
// 供底部导航高亮、搜索栏判断当前页等场景复用。
export function getCurrentRoute() {
  const pages = getCurrentPages()
  return pages.length > 0 ? pages[pages.length - 1].route : ''
}

// 返回上一级；若无上级页面（如直接打开），回退到首页。
// 供详情页返回、发布页取消等场景复用。
export function backOrHome() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}

// 顶部状态栏安全高度（px）：自定义导航栏（navigationStyle: custom）下，页面顶部需手动下移，
// 避开手机状态栏（时间 / 电量 / 信号），避免标题与按钮和状态栏重叠。
// App 端返回真实状态栏高度；H5 端为 0（浏览器自带地址栏已让位，iOS 刘海由 CSS 的
// env(safe-area-inset-top) 兜底）。
export function getStatusBarHeight() {
  const sys = uni.getSystemInfoSync()
  const inset = (sys.safeAreaInsets && sys.safeAreaInsets.top) || 0
  return Math.max(sys.statusBarHeight || 0, inset)
}
