import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/userApi'

// 定义用户store
export const useUserStore = defineStore('user', () => {
  // 状态定义
  const token = ref('')
  const tokenType = ref('')
  const userInfo = ref(null)
  const isAuthenticated = ref(false)

  // 计算属性
  const userDetails = computed(() => {
    return userInfo.value || {}
  })

  const displayName = computed(() => {
    return userInfo.value?.username || userInfo.value?.email || '未登录用户'
  })

  const authHeader = computed(() => {
    if (!token.value || !tokenType.value) return {}
    return {
      Authorization: `${tokenType.value} ${token.value}`
    }
  })

  // 登录
  const login = async (identifier, password) => {
    try {
      const res = await loginApi(identifier, password)
      const data = res.data

      // 更新状态
      token.value = data.access_token
      tokenType.value = data.token_type
      userInfo.value = data.user
      isAuthenticated.value = true

      // 保存到localStorage
      saveToStorage()

      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, error: error.message || '登录失败' }
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    tokenType.value = ''
    userInfo.value = null
    isAuthenticated.value = false
    clearStorage()
  }

  // 保存数据到localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('userStore', JSON.stringify({
        token: token.value,
        tokenType: tokenType.value,
        userInfo: userInfo.value
      }))
    } catch (error) {
      console.error('保存用户数据失败:', error)
    }
  }

  // 从localStorage加载数据
  const loadFromStorage = () => {
    try {
      const storedData = localStorage.getItem('userStore')
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        token.value = parsedData.token || ''
        tokenType.value = parsedData.tokenType || ''
        userInfo.value = parsedData.userInfo || null
        isAuthenticated.value = !!token.value && !!userInfo.value
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      clearStorage()
    }
  }

  // 清除localStorage数据
  const clearStorage = () => {
    try {
      localStorage.removeItem('userStore')
    } catch (error) {
      console.error('清除用户数据失败:', error)
    }
  }

  // 检查token是否有效
  const isTokenValid = () => {
    return !!token.value && isAuthenticated.value
  }

  // 初始化加载用户数据
  const initUserStore = () => {
    loadFromStorage()
  }

  // 暴露状态和方法
  return {
    token,
    tokenType,
    userInfo,
    isAuthenticated,
    userDetails,
    displayName,
    authHeader,
    login,
    logout,
    isTokenValid,
    initUserStore
  }
})
