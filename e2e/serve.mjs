// E2E 用零依赖静态服务器：托管 uni-app H5 构建产物 dist/build/h5（hash 路由，含 SPA 回退）
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist', 'build', 'h5')
const PORT = Number(process.env.E2E_PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

if (!fs.existsSync(DIST)) {
  console.error('未找到 H5 构建产物：请先运行 npm run build:h5')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let file = path.join(DIST, urlPath)
  if (!file.startsWith(DIST)) { res.statusCode = 403; return res.end('forbidden') }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html') // SPA 回退
  }
  fs.readFile(file, (e, data) => {
    if (e) { res.statusCode = 404; return res.end('not found') }
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream')
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log('E2E static server: http://localhost:' + PORT)
})

// 优雅退出：Playwright 结束后回收 webServer（Linux CI 下由 SIGTERM/SIGINT 触发）
const shutdown = () => server.close(() => process.exit(0))
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
