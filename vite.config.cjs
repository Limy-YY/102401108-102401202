// 命令行构建配置（让 uni-app Vite 插件识别本项目根目录为源码目录，
// 从而无需 HBuilderX、也无需把文件挪进 src/）。
process.env.UNI_INPUT_DIR = process.cwd()

const { defineConfig } = require('vite')
const uni = require('@dcloudio/vite-plugin-uni')

module.exports = defineConfig({
  plugins: [uni.default ? uni.default() : uni()],
  server: {
    host: true, // 监听所有网卡，允许用 fzulostandfound 访问
    port: 80,   // 80 端口：浏览器里 http://fzulostandfound 不用写端口
    open: true, // 启动开发服务器后自动打开浏览器
    allowedHosts: ['fzulostandfound'] // 放行自定义域名，避免 403
  }
})
