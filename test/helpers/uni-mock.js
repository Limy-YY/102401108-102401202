// 内存版 uni 存储 mock：替代真机/H5 的 uni.*StorageSync，数据存于 Map，测试间互不污染。
export function createUniMock(initial = {}) {
  const store = new Map(Object.entries(initial))
  return {
    __store: store,
    // 与真实 uni 行为一致：key 不存在时返回 ''
    getStorageSync(key) {
      return store.has(key) ? store.get(key) : ''
    },
    setStorageSync(key, value) {
      store.set(key, value)
    },
    removeStorageSync(key) {
      store.delete(key)
    }
  }
}

// 安装为全局 uni 并返回 mock；每个用例在 beforeEach 中调用，保证隔离
export function installUni(initial = {}) {
  const uni = createUniMock(initial)
  globalThis.uni = uni
  return uni
}
