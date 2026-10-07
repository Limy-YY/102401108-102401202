// 全局配置：本地存储 key（纯前端版，无后端）
// 登录态、账号库、物品库全部存在浏览器 localStorage，实现多用户共享广场。
export const TOKEN_KEY = 'lost_found_token'   // 当前登录用户 token（= userId）
export const USER_KEY = 'lost_found_user'     // 当前登录用户名片缓存
export const USERS_KEY = 'lost_found_users'   // 全部注册账号
export const ITEMS_KEY = 'lost_found_items'   // 全部失物招领物品（广场共享）
