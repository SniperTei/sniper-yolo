import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // server: {
  //   host: '0.0.0.0', // 关键：监听所有IP
  //   port: 5173, // 前端服务端口，默认5173
  //   open: false
  // },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    https: false,
    proxy: {
      // 配置API代理，转发到本地后端服务
      '/api': {
        target: 'http://localhost:8000', // 本地后端服务地址
        changeOrigin: true, // 允许跨域
        secure: false, // 不验证SSL证书
        // 配置请求头
        headers: {
          'Origin': 'http://localhost:5173',
          'X-Requested-With': 'XMLHttpRequest'
        },
        // 配置超时时间
        timeout: 60000,
        // 配置错误处理
        onError: (err, req, res) => {
          console.error('Proxy error:', err)
          res.writeHead(500, {
            'Content-Type': 'application/json'
          })
          res.end(JSON.stringify({
            code: 'PROXY_ERROR',
            message: '代理服务错误，请检查后端服务是否正常运行'
          }))
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 自动导入全局变量文件
        // additionalData: `@import "${path.resolve(__dirname, 'src/styles/variables.scss')}";`,
        additionalData: `@use '@/styles/variables.scss' as *;`
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
