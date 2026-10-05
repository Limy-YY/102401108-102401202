// 统一 HTTP 请求封装：基于 uni.request，返回 Promise。
// 受保护接口自动带上登录 token；后端返回非 2xx 时 reject 出错误信息。
import { API_BASE, TOKEN_KEY } from './config.js'

export function request(path, { method = 'GET', data = {}, auth = false } = {}) {
  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' }
    if (auth) {
      const token = uni.getStorageSync(TOKEN_KEY)
      if (token) header['Authorization'] = 'Bearer ' + token
    }

    uni.request({
      url: API_BASE + path,
      method,
      data,
      header,
      success: (res) => {
        const body = res.data || {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body)
        } else {
          reject(new Error(body.message || ('请求失败（' + res.statusCode + '）')))
        }
      },
      fail: () => reject(new Error('网络异常，请确认后端服务已启动'))
    })
  })
}
