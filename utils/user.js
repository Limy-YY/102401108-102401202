// 当前用户资料（占位数据）
// 后续接入真实登录 / 资料编辑后，改为从本地存储读取。
// 物品本身不存联系人信息，详情页的「个人名片」统一从这里取。
const DEFAULT_USER = {
  id: 'local-user', // 发布者标识：详情页据此判断是否本人发布
  avatar: '',
  nickname: '校园用户',
  wechat: 'campus_2026',
  phone: '159 1234 5678'
}

// 返回一份拷贝，避免各页面共用同一个引用导致意外修改
export function getUserInfo() {
  return { ...DEFAULT_USER }
}
