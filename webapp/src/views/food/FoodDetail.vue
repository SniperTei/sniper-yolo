<template>
  <div class="food-detail-container">
    <!-- 导航栏 -->
    <NavBar
      title="美食详情"
      left-text="返回"
      left-arrow
      @click-left="goBack"
      right-text="编辑"
      @click-right="navigateToEdit"
      fixed
      placeholder
      safe-area-inset-top
    />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载美食详情...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="loadFoodDetail">重试</button>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="foodDetail" class="detail-content">
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
              :src="img.includes('http') ? img : `https://via.placeholder.com/600x400?text=${encodeURIComponent(foodDetail.title || '美食')}`"
              :alt="`${foodDetail.title || '美食'} 图片${index + 1}`"
              @error="handleImageError"
              class="carousel-image"
              @click="previewImages(index)"
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
        <h1 class="food-title">{{ foodDetail.title }}</h1>
        
        <div class="info-row">
          <div class="rating">
            <span class="star-icon">★</span>
            <span class="star-score">{{ foodDetail.star }}</span>
          </div>

          <div class="category-badge" v-if="foodDetail.category">
            {{ foodDetail.category }}
          </div>

          <div class="flavor-badge" v-if="foodDetail.flavor">
            {{ foodDetail.flavor }}
          </div>
        </div>

        <!-- 标签 -->
        <div class="tags-container" v-if="foodDetail.tags && foodDetail.tags.length > 0">
          <span 
            v-for="(tag, index) in foodDetail.tags" 
            :key="index" 
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 详细描述 -->
      <div class="content-section">
        <h2 class="section-title">美食介绍</h2>
        <div class="content-text">{{ foodDetail.content }}</div>
      </div>

      <!-- 制作信息 -->
      <div class="maker-section">
        <h2 class="section-title">制作信息</h2>
        <div class="maker-info">
          <div class="info-item">
            <span class="info-label">制作者：</span>
            <span class="info-value">{{ foodDetail.maker }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ formatTime(foodDetail.created_at) }}</span>
          </div>
          <div class="info-item" v-if="foodDetail.updated_at && foodDetail.updated_at !== foodDetail.created_at">
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ formatTime(foodDetail.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFoodDetail } from '@/api/foodApi'
import { NavBar, showImagePreview } from 'vant'
import placeholderImage from '@/assets/images/placeholder.png'

// 路由
const route = useRoute()
const router = useRouter()

// 数据状态
const foodDetail = ref(null)
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

// 跳转到编辑页面
const navigateToEdit = () => {
  const foodId = route.params.id
  router.push(`/food/edit/${foodId}`)
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

// 预览图片（从点击的位置开始）
const previewImages = (startIndex = 0) => {
  showImagePreview({
    images: imageList.value,
    startPosition: startIndex,
    closeable: true,
  })
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

// 加载美食详情
const loadFoodDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const foodId = route.params.id
    if (!foodId) {
      throw new Error('美食ID不存在')
    }

    try {
      const response = await getFoodDetail(foodId)
      console.log('美食详情:', response)
      
      if (response.code === '000000' && response.data) {
        foodDetail.value = response.data
        
        // 准备图片列表，封面图总是第一个
        imageList.value = []
        if (foodDetail.value.cover) {
          imageList.value.push(foodDetail.value.cover)
        }
        if (foodDetail.value.images && foodDetail.value.images.length > 0) {
          // 去重，避免封面图重复显示
          const cover = foodDetail.value.cover
          foodDetail.value.images.forEach(img => {
            if (img !== cover) {
              imageList.value.push(img)
            }
          })
        }
        
        // 如果没有图片，添加默认占位图
        if (imageList.value.length === 0) {
          imageList.value.push(`https://via.placeholder.com/600x400?text=${encodeURIComponent(foodDetail.value.title || '美食')}`)
        }
        
        // 启动轮播
        resetCarouselTimer()
      } else {
        throw new Error(response.msg || '获取美食详情失败')
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
  foodDetail.value = {
    "id": parseInt(route.params.id) || 1,
    "title": "宫保鸡丁",
    "content": "鸡肉嫩滑，花生酥脆，麻辣鲜香。宫保鸡丁是一道闻名中外的川菜，由鸡肉、花生米、干辣椒等材料烹制而成。这道菜以其独特的麻辣口味和丰富的口感而受到广泛喜爱。鸡肉经过腌制后口感更加嫩滑，花生米增加了脆爽的口感，干辣椒则带来了麻辣的风味。制作这道菜需要掌握好火候，确保鸡肉鲜嫩多汁，同时让调料充分渗入食材中。",
    "cover": "https://via.placeholder.com/600x400?text=宫保鸡丁",
    "images": [
      "https://via.placeholder.com/600x400?text=宫保鸡丁-1",
      "https://via.placeholder.com/600x400?text=宫保鸡丁-2"
    ],
    "tags": ["川菜", "鸡肉", "麻辣", "下饭菜"],
    "star": 4,
    "maker": "老川菜馆",
    "flavor": "麻辣",
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T12:00:00"
  }
  
  // 准备图片列表
  imageList.value = []
  if (foodDetail.value.cover) {
    imageList.value.push(foodDetail.value.cover)
  }
  if (foodDetail.value.images && foodDetail.value.images.length > 0) {
    imageList.value.push(...foodDetail.value.images)
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
  loadFoodDetail()
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
.food-detail-container {
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
  border-top: 3px solid #fa541c;
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
  background-color: #fa541c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #d4380d;
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

.food-title {
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

.flavor-badge {
  background-color: #fa541c;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.category-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
.maker-section {
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
  background-color: #fa541c;
  border-radius: 2px;
}

.content-text {
  font-size: 15px;
  line-height: 1.7;
  color: #555;
  margin: 0;
}

/* 制作者信息 */
.maker-info {
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
  .food-detail-container {
    max-width: 768px;
    margin: 0 auto;
    border-left: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }
  
  .image-carousel {
    height: 350px;
  }
  
  .food-title {
    font-size: 26px;
  }
  
  .content-text,
  .info-item {
    font-size: 16px;
  }
}

/* 修复iOS上的安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .food-detail-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>