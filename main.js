// uni-app Vue3 入口：导出 createApp，由 uni-app 框架调用以创建应用实例
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
