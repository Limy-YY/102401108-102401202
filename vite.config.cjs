// 命令行构建配置（让 uni-app Vite 插件识别本项目根目录为源码目录，
// 从而无需 HBuilderX、也无需把文件挪进 src/）。
process.env.UNI_INPUT_DIR = process.cwd()

const { defineConfig } = require('vite')
const uni = require('@dcloudio/vite-plugin-uni')

module.exports = defineConfig({
})
