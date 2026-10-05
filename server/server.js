// 校园失物招领 · 多用户后端（零依赖，仅用 Node 内置 http 模块）
// 运行：node server.js   数据落盘到 ./data/db.json
//
// 设计目标：许多人各自一个账号，共用一个失物招领广场。
//   - 账号集中存储：users（username 唯一）
//   - 物品集中存储：items（广场共享，所有登录用户可见）
//   - 每条物品绑定 publisherId；「我的发布」按 publisherId 隔离
//   - 详情接口同时返回发布者名片（nickname/wechat/phone）
//
// 认证：登录/注册成功后下发 token（= userId），客户端存本地，
//       后续受保护接口在请求头带 Authorization: Bearer <token>。
//       （教学演示用，未做密码哈希 / 真正的 token 签名。）

const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')

const PORT = process.env.PORT || 3000
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// ---------- 数据读写 ----------
function loadDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    const db = JSON.parse(raw)
    if (!Array.isArray(db.users)) db.users = []
    if (!Array.isArray(db.items)) db.items = []
    return db
  } catch (e) {
    return { users: [], items: [] }
  }
}

function saveDB(db) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8')
}

// ---------- 工具 ----------
function send(res, status, body) {
  const data = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  res.end(data)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > 8 * 1024 * 1024) { // 8MB 上限（base64 图片可能较大）
        reject(new Error('请求体过大'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {})
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

// 从 Authorization 头解析当前用户 id
function authUser(req, db) {
  const h = req.headers['authorization'] || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  if (!token) return null
  return db.users.find(u => u.id === token) || null
}

// 对外的用户名片（不返回密码）
function publicUser(u) {
  return u ? { id: u.id, nickname: u.nickname, wechat: u.wechat, phone: u.phone, avatar: u.avatar || '' } : null
}

// ---------- 路由 ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname

  // CORS 预检
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    return res.end()
  }

  const db = loadDB()

  try {
    // ===== 认证 =====
    if (p === '/api/auth/register' && req.method === 'POST') {
      const b = await readBody(req)
      const username = String(b.username || '').trim()
      const password = String(b.password || '')
      const nickname = String(b.nickname || '').trim()

      if (password.length < 6) return send(res, 400, { message: '密码至少 6 位' })
      if (!nickname) return send(res, 400, { message: '请输入昵称' })
      const phone = String(b.phone || '').trim()
      if (!/^1\d{10}$/.test(phone)) return send(res, 400, { message: '请输入正确的手机号' })
      if (db.users.some(u => u.username === username)) {
      }

      const user = {
        id: 'u' + Date.now() + Math.floor(Math.random() * 1000),
        username,
        password,
        nickname,
        wechat: String(b.wechat || '').trim(),
        phone: String(b.phone || '').trim(),
        avatar: '',
        createTime: Date.now()
      }
      db.users.push(user)
      saveDB(db)
      // token 直接用 userId（演示用）
      return send(res, 200, { token: user.id, user: publicUser(user) })
    }

    if (p === '/api/auth/login' && req.method === 'POST') {
      const b = await readBody(req)
      const username = String(b.username || '').trim()
      const user = db.users.find(u => u.username === username)
      if (user.password !== String(b.password || '')) {
        return send(res, 401, { message: '密码错误' })
      }
      return send(res, 200, { token: user.id, user: publicUser(user) })
    }

    if (p === '/api/me' && req.method === 'GET') {
      const user = authUser(req, db)
      if (!user) return send(res, 401, { message: '未登录' })
      return send(res, 200, { user: publicUser(user) })
    }

    // ===== 物品 =====
    // 广场：全部物品（共享）
    if (p === '/api/items' && req.method === 'GET') {
      const list = [...db.items].sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
      return send(res, 200, { items: list })
    }

    // 我的发布（需登录）
    if (p === '/api/items/mine' && req.method === 'GET') {
      const user = authUser(req, db)
      if (!user) return send(res, 401, { message: '未登录' })
      const list = db.items
        .filter(i => i.publisherId === user.id)
        .sort((a, b) => (b.createTime || 0) - (a.createTime || 0))
      return send(res, 200, { items: list })
    }

    // 新建发布（需登录）
    if (p === '/api/items' && req.method === 'POST') {
      const user = authUser(req, db)
      if (!user) return send(res, 401, { message: '未登录' })
      const b = await readBody(req)
      const item = {
        id: Date.now(),
        publisherId: user.id,
        category: b.category || '',
        itemName: b.itemName || '',
        locationTag: b.locationTag || '',
        locationDetail: b.locationDetail || '',
        time: b.time || '',
        color: b.color || '',
        images: Array.isArray(b.images) ? b.images : [],
        detail: b.detail || '',
        status: b.status === 'completed' ? 'completed' : 'ongoing',
        createTime: Date.now()
      }
      db.items.push(item)
      saveDB(db)
      return send(res, 200, { item })
    }

    // 单条详情：含发布者名片
    const singleMatch = p.match(/^\/api\/items\/(\d+)$/)
    if (singleMatch && req.method === 'GET') {
      const id = Number(singleMatch[1])
      const item = db.items.find(i => i.id === id)
      if (!item) return send(res, 404, { message: '物品不存在' })
      const publisher = db.users.find(u => u.id === item.publisherId)
      return send(res, 200, { item, publisher: publicUser(publisher) })
    }

    // 更新（仅本人）
    if (singleMatch && req.method === 'PUT') {
      const user = authUser(req, db)
      if (!user) return send(res, 401, { message: '未登录' })
      const id = Number(singleMatch[1])
      const item = db.items.find(i => i.id === id)
      if (!item) return send(res, 404, { message: '物品不存在' })
      if (item.publisherId !== user.id) return send(res, 403, { message: '只能编辑自己的发布' })
      const b = await readBody(req)
      const fields = ['category', 'itemName', 'locationTag', 'locationDetail', 'time', 'color', 'images', 'detail', 'status']
      fields.forEach(f => {
        if (b[f] !== undefined) item[f] = b[f]
      })
      saveDB(db)
      return send(res, 200, { item })
    }

    // 删除（仅本人）
    if (singleMatch && req.method === 'DELETE') {
      const user = authUser(req, db)
      if (!user) return send(res, 401, { message: '未登录' })
      const id = Number(singleMatch[1])
      const idx = db.items.findIndex(i => i.id === id)
      if (idx === -1) return send(res, 404, { message: '物品不存在' })
      if (db.items[idx].publisherId !== user.id) return send(res, 403, { message: '只能删除自己的发布' })
      db.items.splice(idx, 1)
      saveDB(db)
      return send(res, 200, { ok: true })
    }

    return send(res, 404, { message: '接口不存在' })
  } catch (e) {
    return send(res, 500, { message: '服务器错误: ' + e.message })
  }
})

server.listen(PORT, () => {
  console.log('失物招领后端已启动: http://localhost:' + PORT)
})
