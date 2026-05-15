<template>
  <div class="drink-container">
    <!-- Hero Background with Gradient -->
    <div class="hero-bg">
      <div class="gradient-layer"></div>
      <div class="pattern-layer"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <!-- Header Section -->
    <div class="header-section">
      <button class="back-btn" @click="goBack">
        <i class="van-icon van-icon-arrow-left"></i>
      </button>
      <h1 class="page-title">饮品世界</h1>
      <div class="header-actions">
        <button class="action-btn" @click="navigateToCreate">
          <i class="van-icon van-icon-plus"></i>
        </button>
      </div>
    </div>

    <!-- Floating Filter Card -->
    <div class="filter-card">
      <!-- Search Bar -->
      <div class="search-bar">
        <i class="van-icon van-icon-search search-icon"></i>
        <input
          v-model="searchParams.name"
          type="text"
          placeholder="搜索饮品..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button v-if="searchParams.name" @click="clearSearch" class="clear-btn">
          <i class="van-icon van-icon-clear"></i>
        </button>
      </div>

      <!-- Type Filter -->
      <div class="filter-section">
        <div class="filter-label">类型</div>
        <div class="filter-options">
          <span
            v-for="option in typeOptions"
            :key="option.value"
            class="filter-tag"
            :class="{ active: searchParams.type === option.value }"
            @click="selectType(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
      </div>

      <!-- Flavor Filter -->
      <div class="filter-section">
        <div class="filter-label">口味</div>
        <div class="filter-options">
          <span
            v-for="option in flavorOptions"
            :key="option.value"
            class="filter-tag"
            :class="{ active: searchParams.flavor === option.value }"
            @click="selectFlavor(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Result Header -->
      <div v-if="drinkList.length > 0" class="result-header">
        <span class="result-count">找到 {{ totalCount }} 种饮品</span>
        <button v-if="searchParams.type || searchParams.flavor" @click="clearFilters" class="clear-filter-btn">
          <i class="van-icon van-icon-cross"></i>
          清除筛选
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载饮品中...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="drinkList.length === 0" class="empty-state">
        <div class="empty-icon">🍹</div>
        <p class="empty-text">暂无饮品记录</p>
        <p class="empty-hint">去探索更多美味饮品吧</p>
      </div>

      <!-- Card List -->
      <div v-else class="card-list">
        <div
          v-for="item in drinkList"
          :key="item.id"
          class="drink-card"
          @click="navigateToDetail(item.id)"
        >
          <!-- Card Image -->
          <div class="card-image">
            <img
              :src="item.image"
              :alt="item.name"
              @error="handleImageError"
              class="image"
            />
            <div class="rating-badge">
              <i class="van-icon van-icon-star"></i>
              <span>{{ item.star }}</span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <h3 class="card-title">{{ item.name }}</h3>

            <div class="card-tags">
              <span v-if="item.type" class="tag type-tag">{{ item.type }}</span>
              <span v-for="(tag, index) in item.tags" :key="index" class="tag">{{ tag }}</span>
            </div>

            <p class="card-description">{{ item.description || item.content }}</p>

            <div class="card-footer">
              <span class="maker">
                <i class="van-icon van-icon-user-o"></i>
                {{ item.maker || '未知' }}
              </span>
              <span class="time">{{ formatTime(item.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderImage from '@/assets/images/placeholder.png'
import { getDrinkList } from '@/api/drinkApi.js'

// 路由
const route = useRoute()
const router = useRouter()

// 返回上一页
const goBack = () => {
  router.back()
}

// 搜索参数
const searchParams = ref({
  page: 1,
  count: 10,
  name: '',
  type: '',
  flavor: ''
})

// 列表数据
const drinkList = ref([])
const loading = ref(false)
const finished = ref(false)
const totalCount = ref(0)

// 类型筛选选项
const typeOptions = [
  { text: '全部', value: '' },
  { text: '咖啡', value: '咖啡' },
  { text: '茶', value: '茶' },
  { text: '果汁', value: '果汁' },
  { text: '奶茶', value: '奶茶' },
  { text: '酒类', value: '酒类' },
  { text: '其他', value: '其他' }
]

// 口味筛选选项
const flavorOptions = [
  { text: '全部', value: '' },
  { text: '甜', value: '甜' },
  { text: '酸', value: '酸' },
  { text: '苦', value: '苦' },
  { text: '辣', value: '辣' },
  { text: '咸', value: '咸' }
]

// 获取类型文本
const getTypeText = (type) => {
  const option = typeOptions.find(opt => opt.value === type)
  return option ? option.text : type
}

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = placeholderImage
}

// 选择类型
const selectType = (type) => {
  searchParams.value.type = type
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

// 选择口味
const selectFlavor = (flavor) => {
  searchParams.value.flavor = flavor
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true

    const requestParams = { ...searchParams.value }
    requestParams.page = 1
    requestParams.count = 10

    try {
      console.log("请求参数:", requestParams)
      const response = await getDrinkList(requestParams)

      if (response.code === '000000') {
        processResponseData(response)
      }
    } catch (apiError) {
      console.log('API调用失败，使用模拟数据:', apiError)
    }
  } catch (error) {
    console.error('请求失败:', error)
    if (drinkList.value.length === 0) {
      drinkList.value = [{
        id: 'fallback-1',
        name: '示例饮品',
        description: '这是一道美味的示例饮品，展示了基本信息。',
        image: 'https://via.placeholder.com/400x300?text=示例饮品',
        tags: ['示例', '饮品'],
        star: 4.5,
        maker: '示例制作者',
        type: '示例类型',
        created_at: new Date().toISOString()
      }]
      totalCount.value = 1
    }
  } finally {
    loading.value = false
  }
}

// 处理响应数据
const processResponseData = (response) => {
  if (response.data && response.data.drinks) {
    const newList = response.data.drinks.map(item => ({
      ...item,
      image: item.image && item.image.includes('http')
        ? item.image
        : `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name || '饮品')}`
    }))

    if (searchParams.value.page === 1) {
      drinkList.value = newList
    } else {
      drinkList.value.push(...newList)
    }

    totalCount.value = response.data.total || 0
    finished.value = drinkList.value.length >= totalCount.value
  }
}

// 搜索
const handleSearch = () => {
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

// 清空搜索
const clearSearch = () => {
  searchParams.value.name = ''
  handleSearch()
}

// 清除筛选
const clearFilters = () => {
  searchParams.value.type = ''
  searchParams.value.flavor = ''
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

// 初始化
onMounted(() => {
  const categoryFromRoute = route.query.category
  if (categoryFromRoute && categoryFromRoute === 'eat') {
    console.log('从饮品分类进入')
  }

  loadData()

  setTimeout(() => {
    hideTabBar()
  }, 100)
})

// 监听路由参数变化
watch(() => route.query.category, (newCategory) => {
  if (newCategory && newCategory === 'eat') {
    searchParams.value.page = 1
    finished.value = false
    loadData()
  }
})

// 组件卸载时恢复tabbar显示
onBeforeUnmount(() => {
  showTabBar()
})

// 隐藏底部导航栏
const hideTabBar = () => {
  if (document && document.body) {
    document.body.classList.add('hide-tabbar')
  }

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

  const tabBar = document.querySelector('.snptabbar')
  if (tabBar) {
    tabBar.style.display = ''
  }
}

// 跳转到详情页
const navigateToDetail = (drinkId) => {
  router.push(`/drink/detail/${drinkId}`)
}

// 跳转到新增页面
const navigateToCreate = () => {
  router.push('/drink/create')
}
</script>

<style lang="scss" scoped>
.drink-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  overflow-x: hidden;
}

/* Hero Background */
.hero-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  z-index: 0;
  overflow: hidden;
}

.gradient-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.pattern-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  opacity: 0.6;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 50px;
  height: 50px;
  top: 40%;
  right: 25%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Header Section */
.header-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  background: transparent;
}

.back-btn,
.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Filter Card */
.filter-card {
  position: relative;
  margin: 72px 16px 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15);
  z-index: 10;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.search-icon {
  font-size: 18px;
  color: #4ecdc4;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  outline: none;

  &::placeholder {
    color: #999;
  }
}

.clear-btn {
  background: transparent;
  border: none;
  color: #999;
  font-size: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.filter-section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &.active {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

/* Content Section */
.content-section {
  position: relative;
  padding: 0 16px 80px;
  z-index: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.result-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.clear-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 16px;
  font-size: 13px;
  color: #4ecdc4;
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
  }

  i {
    font-size: 12px;
  }
}

/* Card List */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drink-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.drink-card:active .image {
  transform: scale(1.05);
}

.rating-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  i {
    font-size: 14px;
    color: #ffc107;
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
}

.card-content {
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
  line-height: 1.4;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.type-tag {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    color: white;
  }

  &:not(.type-tag) {
    background: #f5f5f5;
    color: #666;
  }
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.maker {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  flex: 1;

  i {
    font-size: 14px;
  }
}

.time {
  font-size: 12px;
  color: #999;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4ecdc4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Responsive */
@media (min-width: 768px) {
  .drink-container {
    max-width: 768px;
    margin: 0 auto;
  }
}

/* iOS Safe Area */
@supports (padding-top: env(safe-area-inset-top)) {
  .header-section {
    padding-top: calc(16px + env(safe-area-inset-top));
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .content-section {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
</style>
