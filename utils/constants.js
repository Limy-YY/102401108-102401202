// ========== 数据模型常量（全项目唯一标准） ==========
// 物品字段规范：
//   id, createTime, publisherId, category, itemName, locationTag, locationDetail,
//   time, color, images, detail, status
//
//   createTime：发布时间，保存时由系统自动生成，用户无需填写，用于排序与展示。
//   time：发现时间，用户在发布时手动选择。
//
//   publisherId 记录发布者标识，详情页据此判断是否本人发布（仅本人可编辑/删除）。
//
// 联系人信息（昵称/微信号/手机号）不存储在物品上，由发布者的
// 个人名片（ProfileCard / 用户资料）统一提供，发布时无需填写。
//
// 枚举统一「存英文、显示中文」：
//   category: lost(寻物) / found(招领)
//   status:   ongoing(进行中) / completed(已完成)
//
// 所有页面的 picker 选项列表都从这里引入，避免各页面各自维护一份导致漂移。

// 分类：显示中文，存储英文（下标一一对应）
export const CATEGORY_OPTIONS = ['寻物', '招领']
export const CATEGORY_VALUES = ['lost', 'found']

// 场所（发布页与搜索页共用）
export const LOCATION_TAGS = ['教学楼', '宿舍楼', '图书馆', '操场', '食堂', '实验楼', '校门口', '其他']

// 颜色
export const COLOR_LIST = ['黑色', '灰色', '白色', '棕色', '红色', '黄色', '蓝色', '绿色', '紫色', '其他']

// 状态：显示中文，存储英文
export const STATUS_OPTIONS = ['进行中', '已完成']
export const STATUS_VALUES = ['ongoing', 'completed']

// 搜索页「时间」筛选：中文选项 → 天数（近 N 天内）
export const TIME_FILTER_DAYS = { '一天内': 1, '三天内': 3, '一周内': 7, '两周内': 14, '四周内': 28 }
