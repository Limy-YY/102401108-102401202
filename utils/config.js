// 全局配置：后端地址与本地存储 key
// H5 本地调试时，后端跑在本机 3000 端口。
// 部署到真机/其他设备时，把这里改成后端机器的局域网 IP / 线上地址。
export const API_BASE = 'http://localhost:3000'

// 本地缓存 key（登录态）
export const TOKEN_KEY = 'lost_found_token'
export const USER_KEY = 'lost_found_user'
