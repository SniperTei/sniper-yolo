import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
import config from './config/env'
import { useUserStore } from './stores/user'
import deviceBridge from './utils/device'

// 引入全局SCSS样式
import './styles/main.scss'

// 开发环境下引入VConsole
let vconsole = null
if (import.meta.env.DEV) {
  import('vconsole').then((VConsole) => {
    vconsole = new VConsole.default()
    console.log('VConsole已启用')
  })
}

const app = createApp(App)

// 设置应用标题
document.title = config.title

// 使用插件
app.use(createPinia())
app.use(router)
app.use(Vant)

// 开发环境下启用调试
if (config.debug) {
  console.log('应用配置:', config)
  console.log('当前环境:', config.env)
}

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserStore()

// 🆕 在 App 环境下自动获取 App 登录数据
if (!deviceBridge.isWeb && !userStore.isAuthenticated) {
  console.log('📱 检测到 App 环境，尝试获取登录数据...')

  deviceBridge.getUserInfoFromApp().then((result) => {
    if (result && result.code === '000000') {
      const userData = result.data
      console.log('✅ 从 App 获取登录数据成功:', userData)

      // 保存到 userStore
      userStore.setUserData({
        token: userData.token || '',
        tokenType: userData.tokenType || 'Bearer',
        userInfo: userData.userInfo
      })

      console.log('✅ App 登录数据已保存到 userStore')
    } else {
      console.log('ℹ️ App 未登录或获取登录数据失败:', result?.msg || '未知错误')
    }
  }).catch((error) => {
    console.error('❌ 获取 App 登录数据异常:', error)
  })
} else if (deviceBridge.isWeb) {
  console.log('🌐 Web 环境，使用本地登录状态')
} else {
  console.log('✅ 已登录，跳过获取 App 登录数据')
}

app.mount('#app')
