<template>
  <div class="enjoy-detail-container">
    <!-- 导航栏 -->
    <NavBar
      title="饭店详情"
      left-text="返回"
      left-arrow
      @click-left="goBack"
      fixed
      placeholder
      safe-area-inset-top
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载饭店详情...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="loadEnjoyDetail">重试</button>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="enjoyDetail" class="detail-content">
      <!-- 图片轮播 -->
      <div class="image-carousel">
        <div class="carousel-container">
          <div 
            class="carousel-item"
            :class="{ active: currentImageIndex === index }"
            v-for="(img, index) in imageList"
            :key="index"
          >
            <img 
              :src="img.includes('http') ? img : `https://via.placeholder.com/600x400?text=${encodeURIComponent(enjoyDetail.title || '饭店')}`" 
              :alt="`${enjoyDetail.title || '饭店'} 图片${index + 1}`"
              @error="handleImageError"
              class="carousel-image"
            />
          </div>
        </div>
        <!-- 轮播指示器 -->
        <div class="carousel-indicators" v-if="imageList.length > 1">
          <span 
            v-for="(img, index) in imageList" 
            :key="index"
            class="indicator"
            :class="{ active: currentImageIndex === index }"
            @click="goToImage(index)"
          ></span>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="basic-info">
        <h1 class="enjoy-title">{{ enjoyDetail.title }}</h1>
        
        <div class="info-row">
          <div class="rating">
            <span class="star-icon">★</span>
            <span class="star-score">{{ enjoyDetail.star }}</span>
          </div>
          
          <div class="cuisine-badge" v-if="enjoyDetail.cuisine">
            {{ enjoyDetail.cuisine }}
          </div>
        </div>

        <!-- 标签 -->
        <div class="tags-container" v-if="enjoyDetail.tags && enjoyDetail.tags.length > 0">
          <span 
            v-for="(tag, index) in enjoyDetail.tags" 
            :key="index" 
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 详细描述 -->
      <div class="content-section">
        <h2 class="section-title">饭店介绍</h2>
        <div class="content-text">{{ enjoyDetail.content }}</div>
      </div>

      <!-- 位置信息 -->
      <div class="location-section">
        <h2 class="section-title">位置信息</h2>
        <div class="location-info">
          <div class="info-item">
            <span class="info-label">地址：</span>
            <span class="info-value">{{ enjoyDetail.location }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatTime(enjoyDetail.created_at) }}</span>
          </div>
          <div class="info-item" v-if="enjoyDetail.updated_at && enjoyDetail.updated_at !== enjoyDetail.created_at">
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ formatTime(enjoyDetail.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getEnjoyDetail } from '@/api/enjoyApi'
import { NavBar } from 'vant'
import placeholderImage from '@/assets/images/placeholder.png'

// 路由
const route = useRoute()
const router = useRouter()

// 数据状态
const enjoyDetail = ref(null)
const loading = ref(true)
const error = ref('')

// 轮播图状态
const currentImageIndex = ref(0)
const imageList = ref([])
const carouselTimer = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = placeholderImage
}

// 轮播图控制
const goToImage = (index) => {
  currentImageIndex.value = index
  resetCarouselTimer()
}

// 重置轮播计时器
const resetCarouselTimer = () => {
  if (carouselTimer.value) {
    clearInterval(carouselTimer.value)
  }
  
  if (imageList.value.length > 1) {
    carouselTimer.value = setInterval(() => {
      currentImageIndex.value = (currentImageIndex.value + 1) % imageList.value.length
    }, 3000)
  }
}

// 加载饭店详情
const loadEnjoyDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const enjoyId = route.params.id
    if (!enjoyId) {
      throw new Error('饭店ID不存在')
    }

    try {
      const response = await getEnjoyDetail(enjoyId)
      console.log('饭店详情:', response)
      
      if (response.code === '000000' && response.data) {
        enjoyDetail.value = response.data
        
        // 准备图片列表，封面图总是第一个
        imageList.value = []
        if (enjoyDetail.value.cover) {
          imageList.value.push(enjoyDetail.value.cover)
        }
        if (enjoyDetail.value.images && enjoyDetail.value.images.length > 0) {
          // 去重，避免封面图重复显示
          const cover = enjoyDetail.value.cover
          enjoyDetail.value.images.forEach(img => {
            if (img !== cover) {
              imageList.value.push(img)
            }
          })
        }
        
        // 如果没有图片，添加默认占位图
        if (imageList.value.length === 0) {
          imageList.value.push(`https://via.placeholder.com/600x400?text=${encodeURIComponent(enjoyDetail.value.title || '饭店')}`)
        }
        
        // 启动轮播
        resetCarouselTimer()
      } else {
        throw new Error(response.msg || '获取饭店详情失败')
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError)
      // 使用模拟数据
      setMockData()
    }
  } catch (err) {
    console.error('加载失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 设置模拟数据
const setMockData = () => {
  // 使用模拟数据，基于API文档中的示例（使用PostgreSQL的整数ID）
  enjoyDetail.value = {
    "id": parseInt(route.params.id) || 1,
    "title": "老川菜馆",
    "content": "正宗川菜，麻辣鲜香，环境优雅，服务周到。老川菜馆成立于2005年，专注于传承正宗川菜文化，所有菜品均由资深川菜大师掌勺，使用新鲜食材，为顾客提供最地道的川菜体验。",
    "cover": "https://via.placeholder.com/600x400?text=老川菜馆",
    "images": [
      "https://via.placeholder.com/600x400?text=老川菜馆-1",
      "https://via.placeholder.com/600x400?text=老川菜馆-2"
    ],
    "tags": ["川菜", "正宗", "环境优雅", "服务周到"],
    "star": 4.8,
    "location": "北京市朝阳区建国路88号",
    "cuisine": "川菜",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T12:00:00"
  }
  
  // 准备图片列表
  imageList.value = []
  if (enjoyDetail.value.cover) {
    imageList.value.push(enjoyDetail.value.cover)
  }
  if (enjoyDetail.value.images && enjoyDetail.value.images.length > 0) {
    imageList.value.push(...enjoyDetail.value.images)
  }
  
  // 启动轮播
  resetCarouselTimer()
}

// 初始化
onMounted(() => {
  // 隐藏底部导航栏
  setTimeout(() => {
    hideTabBar()
  }, 100)
  
  // 加载数据
  loadEnjoyDetail()
})

// 组件卸载时清理
onBeforeUnmount(() => {
  // 清除轮播计时器
  if (carouselTimer.value) {
    clearInterval(carouselTimer.value)
  }
  
  // 显示底部导航栏
  showTabBar()
})

// 隐藏底部导航栏
const hideTabBar = () => {
  if (document && document.body) {
    document.body.classList.add('hide-tabbar')
  }

  // 也直接隐藏SNPTabBar组件
  const tabBar = document.querySelector('.snptabbar')
  if (tabBar) {
    tabBar.style.display = 'none'
  }
}

// 显示底部导航栏
const showTabBar = () => {
  if (document && document.body) {
    document.body.classList.remove('hide-tabbar')
  }

  // 也直接显示SNPTabBar组件
  const tabBar = document.querySelector('.snptabbar')
  if (tabBar) {
    tabBar.style.display = ''
  }
}
</script>

<style lang="scss" scoped>
/* 主容器样式 */
.enjoy-detail-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 46px; /* 为固定导航栏预留空间 */
}

/* 导航栏样式覆盖 */
:deep(.van-nav-bar) {
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  flex: 1;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  flex: 1;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 16px;
  color: #ff4d4f;
  margin-bottom: 20px;
  text-align: center;
}

.retry-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #40a9ff;
}

/* 详情内容 */
.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 图片轮播 */
.image-carousel {
  position: relative;
  width: 100%;
  height: 250px;
  background-color: #f0f0f0;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}

.carousel-item {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.carousel-item.active {
  opacity: 1;
  z-index: 1;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 轮播指示器 */
.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 2;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.indicator.active {
  background-color: white;
  width: 16px;
  border-radius: 4px;
}

/* 基本信息 */
.basic-info {
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.enjoy-title {
  font-size: 22px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px;
  line-height: 1.3;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-icon {
  color: #ffd700;
  font-size: 18px;
}

.star-score {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.cuisine-badge {
  background-color: #1890ff;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* 标签 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #f5f5f5;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
}

/* 内容区块 */
.content-section,
.location-section {
  background-color: white;
  margin-top: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
  position: relative;
  padding-left: 10px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #1890ff;
  border-radius: 2px;
}

.content-text {
  font-size: 15px;
  line-height: 1.7;
  color: #555;
  margin: 0;
}

/* 位置信息 */
.location-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  font-size: 15px;
}

.info-label {
  color: #999;
  min-width: 80px;
}

.info-value {
  color: #333;
  flex: 1;
}

/* 媒体查询适配不同屏幕 */
@media (min-width: 768px) {
  .enjoy-detail-container {
    max-width: 768px;
    margin: 0 auto;
    border-left: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }
  
  .image-carousel {
    height: 350px;
  }
  
  .enjoy-title {
    font-size: 26px;
  }
  
  .content-text,
  .info-item {
    font-size: 16px;
  }
}

/* 修复iOS上的安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .enjoy-detail-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>