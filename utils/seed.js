// 演示数据播种（纯前端版，无后端）
// 首次进入应用时，若账号库 / 物品库为空，则写入一份演示数据，
// 让登录页有可用的演示账号、首页广场有可浏览的内容。
import { USERS_KEY, ITEMS_KEY } from './config.js'

// 演示账号：学号 20240001 / 密码 campus2024，登录页可用它直接体验
export const DEMO_USER = {
  id: 'u-demo-1001',
  username: '20240001',
  password: 'campus2024',
  nickname: '演示同学',
  wechat: 'demo001',
  phone: '13800000001',
  avatar: '',
  createTime: Date.now() - 6 * 24 * 60 * 60 * 1000
}

// 演示物品（广场内容），均归属演示账号；新注册用户发布的信息会追加到同一列表
function buildSeedItems() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  // 时间：YYYY-MM-DD HH:mm
  const mkTime = (offsetMs) => {
    const d = new Date(now - offsetMs)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }
  return [
    {
      id: now - 1 * day, publisherId: DEMO_USER.id, category: 'lost',
      itemName: '双肩包', locationTag: '图书馆', locationDetail: '1楼自习区B区',
      time: mkTime(1 * day), color: '黑色', images: [], detail: '包内有笔记本电脑和两本教材。',
      status: 'ongoing', createTime: now - 1 * day
    },
    {
      id: now - 2 * day, publisherId: DEMO_USER.id, category: 'lost',
      itemName: '雨伞', locationTag: '教学楼', locationDetail: '东2-101教室',
      time: mkTime(2 * day), color: '蓝色', images: [], detail: '折叠伞，伞柄有挂绳。',
      status: 'ongoing', createTime: now - 2 * day
    },
    {
      id: now - 3 * day, publisherId: DEMO_USER.id, category: 'found',
      itemName: '无线耳机', locationTag: '操场', locationDetail: '第一田径场跑道边看台',
      time: mkTime(3 * day), color: '白色', images: [], detail: '左右耳一对，充电盒有刻字。',
      status: 'ongoing', createTime: now - 3 * day
    },
    {
      id: now - 4 * day, publisherId: DEMO_USER.id, category: 'found',
      itemName: '卡包', locationTag: '食堂', locationDetail: '紫荆园奶茶店柜台旁',
      time: mkTime(4 * day), color: '棕色', images: [], detail: '内有校园卡和几张票据。',
      status: 'ongoing', createTime: now - 4 * day
    },
    {
      id: now - 5 * day, publisherId: DEMO_USER.id, category: 'lost',
      itemName: '学生证', locationTag: '实验楼', locationDetail: '物理实验中心2楼走廊',
      time: mkTime(5 * day), color: '其他', images: [], detail: '贴有照片，已挂失补办中。',
      status: 'completed', createTime: now - 5 * day
    },
    {
      id: now - 6 * day, publisherId: DEMO_USER.id, category: 'found',
      itemName: '保温杯', locationTag: '宿舍楼', locationDetail: '4号楼一楼值班室',
      time: mkTime(6 * day), color: '灰色', images: [], detail: '不锈钢内胆，已交值班室保管。',
      status: 'completed', createTime: now - 6 * day
    }
  ]
}

// 读取本地数组，异常时返回空数组
function readList(key) {
  try {
    const raw = uni.getStorageSync(key)
    return Array.isArray(raw) ? raw : []
  } catch (e) {
    return []
  }
}

function writeList(key, list) {
  try {
    uni.setStorageSync(key, list)
  } catch (e) { /* 存储满等异常：静默跳过，不影响主流程 */ }
}

// 播种：账号库为空则写演示账号，物品库为空则写演示物品。
// 顺带迁移旧演示账号密码（123456 已被浏览器标记为数据泄露），让老数据也能用新密码登录。
export function ensureSeedData() {
  let users = readList(USERS_KEY)
  if (users.length === 0) {
    users = [DEMO_USER]
    writeList(USERS_KEY, users)
  } else {
    const demo = users.find((u) => u.username === DEMO_USER.username)
    if (demo && demo.password === '123456') {
      demo.password = DEMO_USER.password
      writeList(USERS_KEY, users)
    }
  }
  if (readList(ITEMS_KEY).length === 0) {
    writeList(ITEMS_KEY, buildSeedItems())
  }
}
