// 命令行启动器：把项目根目录设为 uni-app 源码目录，再启动 uni CLI。
// 这样无需 HBuilderX、也无需把源码挪进 src/。
// 用法：
//   node scripts/run.js        启动 H5 开发服务器
//   node scripts/run.js build  打包生产 H5
process.env.UNI_INPUT_DIR = process.cwd()

require('@dcloudio/vite-plugin-uni/bin/uni.js')
