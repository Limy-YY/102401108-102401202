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
