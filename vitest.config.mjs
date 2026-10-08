// Vitest 配置（仅用于组件测试；H5 开发/构建仍走 vite.config.cjs 的 uni 插件）
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// uni-app 专有标签按自定义元素处理（input/textarea/button 保留为原生，保证 v-model/点击可用）
const UNI_TAGS = ['view', 'text', 'scroll-view', 'picker', 'image', 'navigator', 'icon']

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => UNI_TAGS.includes(tag)
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/component/**/*.test.js'],
    setupFiles: ['test/component/setup.js']
  }
})
