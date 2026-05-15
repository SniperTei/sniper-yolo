<template>
  <div class="home-container">
    <!-- 顶部波浪背景区域 -->
    <div class="hero-section">
      <div class="wave-bg"></div>

      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar-wrapper">
          <img
            :src="avatarUrl"
            alt="用户头像"
            class="user-avatar"
            @error="handleAvatarError"
            v-if="avatarUrl && !avatarError"
          />
          <div class="user-avatar-default" v-else>
            <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <!-- 背景圆角矩形 -->
              <rect x="0" y="0" width="60" height="60" rx="18" fill="rgba(255, 255, 255, 0.25)"/>
              <!-- 头部圆形 -->
              <circle cx="30" cy="22" r="10" fill="white"/>
              <!-- 身体圆角矩形 -->
              <path d="M15 52 Q15 38 30 38 Q45 38 45 52 L45 60 L15 60 Z" fill="white"/>
            </svg>
          </div>
          <div class="avatar-ring"></div>
        </div>
        <div class="user-greeting">
          <div class="greeting-emoji">{{ timeEmoji }}</div>
          <div class="greeting-text">{{ greetingText }}</div>
          <div class="user-name">{{ displayName }}</div>
        </div>
        <div class="user-actions">
          <button class="action-btn notification">
            <i class="van-icon van-icon-bell-o"></i>
            <span class="badge">3</span>
          </button>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-wrapper">
        <div class="search-box">
          <i class="van-icon van-icon-search search-icon"></i>
          <input type="text" placeholder="搜索你想体验的..." class="search-input" />
          <button class="search-btn">搜索</button>
        </div>
      </div>
    </div>

    <!-- 分类卡片区域 -->
    <div class="categories-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">✨</span>
          探索体验
        </h2>
      </div>

      <div class="categories-grid">
        <!-- 吃 - 美食探索 -->
        <div
          class="category-card food"
          @click="handleCategoryClick(categories[0])"
        >
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
              <div class="shape shape-4"></div>
              <div class="shape shape-5"></div>
            </div>
            <div class="animated-bg-layer"></div>
          </div>
          <div class="card-glass-effect"></div>
          <div class="card-content">
            <div class="card-badge">
              <span class="badge-icon">🔥</span>
              <span class="badge-text">热门</span>
            </div>
            <div class="card-icon-wrapper">
              <div class="icon-3d-container">
                <i class="van-icon van-icon-coupon-o"></i>
                <div class="icon-shadow"></div>
                <div class="icon-sparkle">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <h3 class="card-title">吃</h3>
            <p class="card-desc">探索美食</p>
            <div class="card-stats">
              <span class="stat-item">
                <i class="van-icon van-icon-star-o"></i>
                <span>4.9</span>
              </span>
              <span class="stat-item">
                <i class="van-icon van-icon-location-o"></i>
                <span>200+</span>
              </span>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>

        <!-- 喝 - 精品饮品 -->
        <div
          class="category-card drink"
          @click="handleCategoryClick(categories[1])"
        >
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
              <div class="shape shape-4"></div>
              <div class="shape shape-5"></div>
            </div>
            <div class="animated-bg-layer"></div>
          </div>
          <div class="card-glass-effect"></div>
          <div class="card-content">
            <div class="card-badge">
              <span class="badge-icon">💎</span>
              <span class="badge-text">精选</span>
            </div>
            <div class="card-icon-wrapper">
              <div class="icon-3d-container">
                <i class="van-icon van-icon-goblet"></i>
                <div class="icon-shadow"></div>
                <div class="icon-sparkle">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <h3 class="card-title">喝</h3>
            <p class="card-desc">精品饮品</p>
            <div class="card-stats">
              <span class="stat-item">
                <i class="van-icon van-icon-star-o"></i>
                <span>4.8</span>
              </span>
              <span class="stat-item">
                <i class="van-icon van-icon-fire-o"></i>
                <span>150+</span>
              </span>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>

        <!-- 玩 - 娱乐体验 -->
        <div
          class="category-card enjoy"
          @click="handleCategoryClick(categories[2])"
        >
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
              <div class="shape shape-4"></div>
              <div class="shape shape-5"></div>
            </div>
            <div class="animated-bg-layer"></div>
          </div>
          <div class="card-glass-effect"></div>
          <div class="card-content">
            <div class="card-badge">
              <span class="badge-icon">🎮</span>
              <span class="badge-text">刺激</span>
            </div>
            <div class="card-icon-wrapper">
              <div class="icon-3d-container">
                <i class="van-icon van-icon-game"></i>
                <div class="icon-shadow"></div>
                <div class="icon-sparkle">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <h3 class="card-title">玩</h3>
            <p class="card-desc">娱乐体验</p>
            <div class="card-stats">
              <span class="stat-item">
                <i class="van-icon van-icon-star-o"></i>
                <span>4.7</span>
              </span>
              <span class="stat-item">
                <i class="van-icon van-icon-hot-o"></i>
                <span>100+</span>
              </span>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>

        <!-- 乐 - 文化活动 -->
        <div
          class="category-card fun"
          @click="handleCategoryClick(categories[3])"
        >
          <div class="card-background">
            <div class="gradient-overlay"></div>
            <div class="pattern-overlay"></div>
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
              <div class="shape shape-4"></div>
              <div class="shape shape-5"></div>
            </div>
            <div class="animated-bg-layer"></div>
          </div>
          <div class="card-glass-effect"></div>
          <div class="card-content">
            <div class="card-badge">
              <span class="badge-icon">🎨</span>
              <span class="badge-text">创意</span>
            </div>
            <div class="card-icon-wrapper">
              <div class="icon-3d-container">
                <i class="van-icon van-icon-music"></i>
                <div class="icon-shadow"></div>
                <div class="icon-sparkle">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <h3 class="card-title">乐</h3>
            <p class="card-desc">文化活动</p>
            <div class="card-stats">
              <span class="stat-item">
                <i class="van-icon van-icon-star-o"></i>
                <span>4.9</span>
              </span>
              <span class="stat-item">
                <i class="van-icon van-icon-good-job-o"></i>
                <span>80+</span>
              </span>
            </div>
          </div>
          <div class="card-shine"></div>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="bottom-decoration">
      <div class="decoration-circle"></div>
      <div class="decoration-circle"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import deviceBridge from '@/utils/device.js'

const router = useRouter()
const userStore = useUserStore()

// 头像状态
const avatarUrl = ref('')
const avatarError = ref(false)

const displayName = computed(() => userStore.displayName || '探索者')

const timeEmoji = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '🌙'
  if (hour < 12) return '☀️'
  if (hour < 18) return '🌤️'
  return '🌆'
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const categories = ref([
  { id: 1, name: '吃', desc: '探索各地美食佳肴', iconClass: 'van-icon van-icon-coupon-o', category: 'eat' },
  { id: 2, name: '喝', desc: '品味精致饮品咖啡', iconClass: 'van-icon van-icon-goblet', category: 'drink' },
  { id: 3, name: '玩', desc: '发现新奇娱乐体验', iconClass: 'van-icon van-icon-game', category: 'enjoy' },
  { id: 4, name: '乐', desc: '享受精彩文化活动', iconClass: 'van-icon van-icon-music', category: 'fun' }
])

const handleCategoryClick = (category) => {
  const routeMap = {
    eat: '/food',
    drink: '/drink',
    enjoy: '/enjoy',
    fun: '/fun'
  }
  if (routeMap[category.category]) {
    router.push({
      path: routeMap[category.category],
      query: { category: category.category }
    })
  }
}

// 头像加载失败处理
const handleAvatarError = () => {
  avatarError.value = true
}

// 从原生app获取用户信息
const fetchUserInfoFromApp = async () => {
  try {
    console.log('========== 开始从原生app获取用户信息 ==========')

    const result = await deviceBridge.getUserInfoFromApp((response) => {
      console.log('getUserInfoFromApp 回调:', response)
    })

    console.log('原生app返回的完整结果:', JSON.stringify(result, null, 2))

    // 检查返回结果
    if (result && result.code === '000000') {
      const userData = result.data
      console.log('userData内容:', JSON.stringify(userData, null, 2))

      // 检查必要字段是否存在
      if (!userData.token || !userData.userInfo || Object.keys(userData.userInfo).length === 0) {
        console.warn('⚠️ 用户数据不完整，跳过保存')
        console.warn('  - token:', userData.token)
        console.warn('  - userInfo:', userData.userInfo)
        return
      }

      console.log('✅ 用户数据验证通过，开始保存')

      // 设置头像URL
      if (userData.userInfo?.avatar) {
        avatarUrl.value = userData.userInfo.avatar
      }

      // 构建用户数据对象
      const userInfo = {
        token: userData.token,
        tokenType: userData.tokenType || 'Bearer',
        userInfo: {
          id: userData.userInfo?.id,
          username: userData.userInfo?.username,
          email: userData.userInfo?.email,
          mobile: userData.userInfo?.mobile
        }
      }

      console.log('准备保存的数据:', JSON.stringify(userInfo, null, 2))

      // 保存到userStore
      userStore.setUserData(userInfo)

      console.log('✅ 用户信息已保存')
      console.log('  - token:', userStore.token ? '已设置' : '未设置')
      console.log('  - username:', userStore.userInfo?.username)
      console.log('  - email:', userStore.userInfo?.email)
      console.log('  - isAuthenticated:', userStore.isAuthenticated)
    } else {
      console.log('❌ 获取失败或用户未登录')
      console.log('  - code:', result?.code)
      console.log('  - msg:', result?.msg)
    }

    console.log('========== 获取用户信息结束 ==========')
  } catch (error) {
    console.error('❌ 从原生app获取用户信息异常:', error)
  }
}

onMounted(() => {
  console.log('========== Home.vue mounted ==========')
  console.log('设备环境:', {
    isWeb: deviceBridge.isWeb,
    isIOS: deviceBridge.isIOS,
    isAndroid: deviceBridge.isAndroid
  })
  console.log('当前用户状态:', {
    isAuthenticated: userStore.isAuthenticated,
    hasToken: !!userStore.token,
    username: userStore.userInfo?.username,
    displayName: userStore.displayName
  })

  // 如果未登录，尝试获取用户信息（支持原生环境和Web环境的Mock数据）
  if (!userStore.isAuthenticated) {
    if (deviceBridge.isWeb) {
      console.log('🌐 在Web环境，使用Mock数据获取用户信息')
    } else {
      console.log('📱 在App环境，从原生app获取用户信息')
    }
    fetchUserInfoFromApp()
  } else {
    console.log('✅ 用户已登录，无需重新获取')
  }
  console.log('=====================================')
})
</script>

<style lang="scss" scoped>
/* ========== 设计系统 ========== */
:root {
  --color-food: #ff6b6b;
  --color-drink: #4ecdc4;
  --color-enjoy: #48dbfb;
  --color-fun: #ff9ff3;
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.08);
  --shadow-float: 0 12px 48px rgba(0, 0, 0, 0.12);
}

/* ========== 主容器 ========== */
.home-container {
  min-height: 100vh;
  background: #f8f9fe;
  padding-bottom: 40px;
  position: relative;
  overflow-x: hidden;
}

/* ========== 顶部波浪背景区域 ========== */
.hero-section {
  position: relative;
  padding-bottom: 32px;
  overflow: hidden;
}

.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 50% 50% / 0 0 40px 40px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
  }
}

/* ========== 用户信息卡片 ========== */
.user-card {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 20px 20px;
  margin: 0 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.user-avatar-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  object-fit: cover;
}

.user-avatar-default {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  line-height: 0;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 22px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.user-greeting {
  flex: 1;
}

.greeting-emoji {
  font-size: 20px;
  margin-bottom: 4px;
  animation: bounce-gentle 2s ease-in-out infinite;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.greeting-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-top: 2px;
}

.user-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:active {
    transform: scale(0.92);
  }

  .van-icon {
    font-size: 20px;
    color: white;
  }
}

.notification .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  background: #ff6b6b;
  border-radius: 9px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-size: 10px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  animation: badge-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes badge-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* ========== 搜索框 ========== */
.search-wrapper {
  position: relative;
  z-index: 2;
  padding: 16px 16px 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 12px 48px rgba(102, 126, 234, 0.2);
    transform: translateY(-2px);
  }
}

.search-icon {
  font-size: 18px;
  color: #999;
  padding-left: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;

  &::placeholder {
    color: #999;
  }
}

.search-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

/* ========== 分类卡片区域 ========== */
.categories-section {
  padding: 24px 16px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 26px;
  font-weight: 800;
  color: #2d3748;
  margin: 0;

  .title-icon {
    font-size: 30px;
    animation: sparkle 2s ease-in-out infinite;
  }
}

@keyframes sparkle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(20deg) scale(1.2); }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-card {
  position: relative;
  height: 180px;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: none !important;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    transition: all 0.4s ease;
  }

  &:active {
    transform: scale(0.95) translateY(4px);
  }

  /* 统一的紫色主题背景 */
  &.food,
  &.drink,
  &.enjoy,
  &.fun {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #9b59b6 100%);
  }
}

/* ========== 卡片背景层 ========== */
.card-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* 复杂渐变叠加层 - 为每个分类添加独特的渐变效果 */
.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.1) 30%,
    rgba(255, 255, 255, 0) 50%,
    rgba(0, 0, 0, 0.05) 70%,
    rgba(0, 0, 0, 0.15) 100%
  );
}

/* 图案叠加层 - 为每个分类添加独特的纹理 */
.pattern-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image:
    repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px),
    repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
}

/* 分类特定的图案 */
.category-card.food .pattern-overlay {
  background-image: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 2px, transparent 2px),
                    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 2px, transparent 2px);
  background-size: 30px 30px, 40px 40px;
}

.category-card.drink .pattern-overlay {
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 3px, transparent 3px),
                    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.15) 4px, transparent 4px),
                    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 25px 25px, 35px 35px, 20px 20px;
  animation: bubble-rise 6s ease-in-out infinite;
}

.category-card.enjoy .pattern-overlay {
  background-image: linear-gradient(30deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%),
                    linear-gradient(150deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%),
                    linear-gradient(30deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%),
                    linear-gradient(150deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%);
  background-size: 40px 70px;
  background-position: 0 0, 0 0, 20px 35px, 20px 35px;
  animation: pattern-shift 8s linear infinite;
}

.category-card.fun .pattern-overlay {
  background-image: conic-gradient(from 0deg at 50% 50%, rgba(255, 255, 255, 0.15) 0deg, transparent 60deg, rgba(255, 255, 255, 0.1) 120deg, transparent 180deg, rgba(255, 255, 255, 0.15) 240deg, transparent 300deg);
  background-size: 60px 60px;
  animation: rotate-slow 20s linear infinite;
}

@keyframes bubble-rise {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pattern-shift {
  0% { background-position: 0 0, 0 0, 20px 35px, 20px 35px; }
  100% { background-position: 40px 0, 40px 0, 60px 35px, 60px 35px; }
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 浮动形状 - 更多样化的形状和动画 */
.floating-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .shape {
    position: absolute;
    animation: float-around 8s ease-in-out infinite;

    /* 圆形 */
    &.shape-1 {
      width: 80px;
      height: 80px;
      top: -20px;
      right: -20px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-radius: 50%;
      animation-delay: 0s;
      animation-name: float-circle;
    }

    /* 三角形 */
    &.shape-2 {
      width: 0;
      height: 0;
      bottom: 30px;
      left: -15px;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 50px solid rgba(255, 255, 255, 0.2);
      background: transparent;
      animation-delay: -2s;
      animation-name: float-triangle;
      filter: blur(2px);
    }

    /* 正方形 */
    &.shape-3 {
      width: 35px;
      height: 35px;
      top: 50%;
      right: 15px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      animation-delay: -4s;
      animation-name: float-square;
      transform: rotate(45deg);
    }

    /* 椭圆形 */
    &.shape-4 {
      width: 60px;
      height: 25px;
      top: 20px;
      left: 20px;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
      border-radius: 50%;
      animation-delay: -6s;
      animation-name: float-oval;
    }

    /* 星形 (使用clip-path) */
    &.shape-5 {
      width: 40px;
      height: 40px;
      bottom: -10px;
      right: 30px;
      background: rgba(255, 255, 255, 0.18);
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      animation-delay: -3s;
      animation-name: float-star;
    }
  }
}

@keyframes float-circle {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  33% {
    transform: translate(15px, -10px) scale(1.15);
    opacity: 0.8;
  }
  66% {
    transform: translate(-10px, 15px) scale(0.85);
    opacity: 0.4;
  }
}

@keyframes float-triangle {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.5;
  }
  33% {
    transform: translate(-10px, 10px) rotate(120deg);
    opacity: 0.7;
  }
  66% {
    transform: translate(15px, -5px) rotate(240deg);
    opacity: 0.3;
  }
}

@keyframes float-square {
  0%, 100% {
    transform: rotate(45deg) scale(1) translate(0, 0);
    opacity: 0.4;
  }
  50% {
    transform: rotate(225deg) scale(1.2) translate(5px, -5px);
    opacity: 0.7;
  }
}

@keyframes float-oval {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: translateX(10px) rotate(180deg);
    opacity: 0.8;
  }
}

@keyframes float-star {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(8px, -8px) rotate(180deg) scale(1.3);
    opacity: 0.6;
  }
}

/* 动画背景层 - 为卡片添加动态颜色效果 */
.animated-bg-layer {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  mix-blend-mode: overlay;
  animation: bg-pulse 4s ease-in-out infinite;
}

.category-card.food .animated-bg-layer {
  background: radial-gradient(circle at 30% 30%, rgba(255, 200, 100, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255, 150, 50, 0.3) 0%, transparent 50%);
  animation: bg-shift-food 6s ease-in-out infinite;
}

.category-card.drink .animated-bg-layer {
  background: radial-gradient(circle at 50% 20%, rgba(100, 255, 200, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 30% 80%, rgba(80, 200, 255, 0.3) 0%, transparent 50%);
  animation: bg-shift-drink 7s ease-in-out infinite;
}

.category-card.enjoy .animated-bg-layer {
  background: radial-gradient(circle at 80% 30%, rgba(100, 220, 255, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 20% 70%, rgba(50, 200, 150, 0.3) 0%, transparent 50%);
  animation: bg-shift-enjoy 5s ease-in-out infinite;
}

.category-card.fun .animated-bg-layer {
  background: radial-gradient(circle at 40% 60%, rgba(255, 150, 255, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 70% 20%, rgba(150, 50, 200, 0.3) 0%, transparent 50%);
  animation: bg-shift-fun 8s ease-in-out infinite;
}

@keyframes bg-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

@keyframes bg-shift-food {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(10px, -5px) scale(1.1);
  }
}

@keyframes bg-shift-drink {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-5px, 10px) rotate(5deg);
  }
}

@keyframes bg-shift-enjoy {
  0%, 100% {
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  50% {
    transform: scale(1.15);
    filter: hue-rotate(15deg);
  }
}

@keyframes bg-shift-fun {
  0%, 100% {
    transform: translate(0, 0);
    filter: brightness(1);
  }
  50% {
    transform: translate(-8px, 8px);
    filter: brightness(1.2);
  }
}

/* ========== 卡片玻璃效果 ========== */
.card-glass-effect {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  pointer-events: none;
}

/* ========== 卡片徽章 ========== */
.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 3;
  animation: badge-appear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  .badge-icon {
    font-size: 12px;
    animation: badge-icon-bounce 1s ease-in-out infinite;
  }

  .badge-text {
    font-size: 11px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
}

@keyframes badge-appear {
  0% {
    transform: scale(0) translateY(-10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes badge-icon-bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(10deg); }
}

/* ========== 3D图标容器 ========== */
.icon-3d-container {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 200px;

  .van-icon {
    font-size: 36px;
    color: white;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
    transition: all 0.3s ease;
  }

  .icon-shadow {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 8px;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(4px);
    animation: shadow-pulse 2s ease-in-out infinite;
  }

  .icon-sparkle {
    position: absolute;
    inset: 0;
    pointer-events: none;

    span {
      position: absolute;
      width: 4px;
      height: 4px;
      background: white;
      border-radius: 50%;
      animation: sparkle-float 3s ease-in-out infinite;

      &:nth-child(1) {
        top: 0;
        right: 0;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        bottom: 5px;
        left: 5px;
        animation-delay: -1s;
      }

      &:nth-child(3) {
        top: 50%;
        right: -5px;
        animation-delay: -2s;
      }
    }
  }
}

.category-card:active .icon-3d-container .van-icon {
  transform: scale(0.9) rotate(-5deg);
}

@keyframes shadow-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
  50% { transform: translateX(-50%) scale(1.2); opacity: 0.3; }
}

@keyframes sparkle-float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  50% {
    transform: translateY(-10px) scale(1.5);
    opacity: 1;
  }
}

/* ========== 卡片统计 ========== */
.card-stats {
  display: flex;
  gap: 8px;
  margin-top: 8px;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    .van-icon {
      font-size: 10px;
      color: white;
    }

    span {
      font-size: 10px;
      font-weight: 700;
      color: white;
    }
  }
}

/* ========== 卡片光泽效果 ========== */
.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 45%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.3) 55%,
    transparent 60%
  );
  border-radius: 24px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.category-card:hover .card-shine {
  animation: shine-effect 1.5s ease-in-out;
}

@keyframes shine-effect {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-icon-wrapper {
  margin-bottom: 8px;
}

.card-title {
  font-size: 36px;
  font-weight: 900;
  color: white;
  margin: 0 0 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: 2px;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin: 0 0 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* ========== 底部装饰 ========== */
.bottom-decoration {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 1;
  pointer-events: none;
}

.decoration-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  animation: float 6s ease-in-out infinite;

  &:last-child {
    width: 60px;
    height: 60px;
    animation-delay: -3s;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}
</style>
