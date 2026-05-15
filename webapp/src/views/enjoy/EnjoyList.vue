<template>
  <div class="enjoy-container">
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
      <h1 class="page-title">文化探索</h1>
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
          v-model="searchParams.title"
          type="text"
          placeholder="搜索饭店..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button v-if="searchParams.title" @click="clearSearch" class="clear-btn">
          <i class="van-icon van-icon-clear"></i>
        </button>
      </div>

      <!-- Cuisine Filter -->
      <div class="filter-section">
        <div class="filter-label">菜系</div>
        <div class="filter-options">
          <span
            v-for="option in cuisineOptions"
            :key="option.value"
            class="filter-tag"
            :class="{ active: searchParams.cuisine === option.value }"
            @click="selectCuisine(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
      </div>

      <!-- Rating Filter -->
      <div class="filter-section">
        <div class="filter-label">评分</div>
        <div class="filter-options">
          <span
            v-for="score in ratingOptions"
            :key="score"
            class="filter-tag"
            :class="{ active: searchParams.min_star === score }"
            @click="selectMinRating(score)"
          >
            {{ score }}星+
          </span>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Result Header -->
      <div v-if="enjoyList.length > 0" class="result-header">
        <span class="result-count">共 {{ totalCount }} 家饭店</span>
        <div v-if="hasActiveFilters" class="active-filters">
          <span
            v-if="searchParams.cuisine"
            class="filter-chip"
            @click="selectCuisine('')"
          >
            {{ getCuisineText(searchParams.cuisine) }}
            <i class="van-icon van-icon-cross"></i>
          </span>
          <span
            v-if="searchParams.min_star"
            class="filter-chip"
            @click="selectMinRating(0)"
          >
            {{ searchParams.min_star }}星+
            <i class="van-icon van-icon-cross"></i>
          </span>
        </div>
      </div>

      <!-- Card List -->
      <div v-if="enjoyList.length > 0" class="card-list">
        <div
          v-for="item in enjoyList"
          :key="item.id"
          class="enjoy-card"
          @click="navigateToDetail(item.id)"
        >
          <div class="card-image-wrapper">
            <img
              :src="item.cover"
              :alt="item.title"
              @error="handleImageError"
              class="card-image"
            />
            <div class="card-overlay"></div>
            <div class="rating-badge">
              <i class="van-icon van-icon-star"></i>
              <span>{{ item.star }}</span>
            </div>
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>

            <div class="card-tags">
              <span v-if="item.cuisine" class="tag cuisine-tag">{{ item.cuisine }}</span>
              <span v-for="(tag, idx) in item.tags" :key="idx" class="tag">
                {{ tag }}
              </span>
            </div>

            <p class="card-description">{{ item.content }}</p>

            <div class="card-footer">
              <div class="location">
                <i class="van-icon van-icon-location-o"></i>
                <span>{{ item.location }}</span>
              </div>
              <div class="time">{{ formatTime(item.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载精彩内容...</p>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎨</div>
        <h3>暂无内容</h3>
        <p>点击右上角添加您的第一家饭店</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderImage from '@/assets/images/placeholder.png'
import { getEnjoyList } from '@/api/enjoyApi.js'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.back()
}

const searchParams = ref({
  page: 1,
  count: 10,
  title: '',
  content: '',
  location: '',
  min_star: '',
  max_star: '',
  cuisine: '',
  tag: ''
})

const enjoyList = ref([])
const loading = ref(false)
const finished = ref(false)
const totalCount = ref(0)

const cuisineOptions = [
  { text: '全部', value: '' },
  { text: '川菜', value: '川菜' },
  { text: '粤菜', value: '粤菜' },
  { text: '湘菜', value: '湘菜' },
  { text: '江浙菜', value: '江浙菜' },
  { text: '西餐', value: '西餐' },
  { text: '日料', value: '日料' },
  { text: '韩料', value: '韩料' }
]

const ratingOptions = [0, 3, 4, 4.5, 5]

const hasActiveFilters = computed(() => {
  return !!(searchParams.value.cuisine || searchParams.value.min_star)
})

const getCuisineText = (cuisine) => {
  const option = cuisineOptions.find(opt => opt.value === cuisine)
  return option ? option.text : cuisine
}

const handleImageError = (event) => {
  event.target.src = placeholderImage
}

const clearSearch = () => {
  searchParams.value.title = ''
  handleSearch()
}

const selectCuisine = (cuisine) => {
  searchParams.value.cuisine = cuisine
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

const selectMinRating = (score) => {
  searchParams.value.min_star = score === 0 ? '' : score
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const loadData = async () => {
  try {
    loading.value = true

    const requestParams = { ...searchParams.value }
    requestParams.page = 1
    requestParams.count = 10

    try {
      console.log("请求参数:", requestParams)
      const response = await getEnjoyList(requestParams)

      if (response.code === '000000') {
        processResponseData(response)
      }
    } catch (apiError) {
      console.log('API调用失败，使用模拟数据:', apiError)

      // Use mock data
      const mockData = {
        "code": "000000",
        "statusCode": 200,
        "msg": "获取饭店列表成功",
        "data": {
          "enjoys": [
            {
              "id": 1,
              "title": "老川菜馆",
              "content": "正宗川菜，麻辣鲜香，环境优雅，服务周到。",
              "cover": "https://via.placeholder.com/400x300?text=老川菜馆",
              "images": [],
              "tags": ["正宗", "环境优雅"],
              "star": 4.8,
              "location": "北京市朝阳区建国路88号",
              "cuisine": "川菜",
              "created_by": 1,
              "created_at": "2024-01-01T00:00:00",
              "updated_at": "2024-01-01T00:00:00"
            },
            {
              "id": 2,
              "title": "粤式茶餐厅",
              "content": "正宗粤菜，点心精致，价格实惠。",
              "cover": "https://via.placeholder.com/400x300?text=粤式茶餐厅",
              "images": [],
              "tags": ["点心", "实惠"],
              "star": 4.7,
              "location": "上海市浦东新区陆家嘴环路168号",
              "cuisine": "粤菜",
              "created_by": 1,
              "created_at": "2024-01-01T12:00:00",
              "updated_at": "2024-01-01T12:00:00"
            },
            {
              "id": 3,
              "title": "日式料理店",
              "content": "新鲜食材，传统做法，环境清幽。",
              "cover": "https://via.placeholder.com/400x300?text=日式料理店",
              "images": [],
              "tags": ["新鲜", "传统"],
              "star": 4.9,
              "location": "广州市天河区天河路385号",
              "cuisine": "日料",
              "created_by": 1,
              "created_at": "2024-01-02T18:00:00",
              "updated_at": "2024-01-02T18:00:00"
            }
          ],
          "total": 25,
          "page": 1,
          "count": 10
        },
        "timestamp": "2025-11-27 13:44:02"
      }
      processResponseData(mockData)
    }
  } catch (error) {
    console.error('请求失败:', error)
    if (enjoyList.value.length === 0) {
      enjoyList.value = [{
        id: 'fallback-1',
        title: '示例饭店',
        content: '这是一家示例饭店，展示了基本信息。',
        cover: 'https://via.placeholder.com/400x300?text=示例饭店',
        tags: ['示例'],
        star: 4.5,
        location: '示例地址',
        cuisine: '示例菜系',
        created_at: new Date().toISOString()
      }]
      totalCount.value = 1
    }
  } finally {
    loading.value = false
  }
}

const processResponseData = (response) => {
  if (response.data && response.data.enjoys) {
    const newList = response.data.enjoys.map(item => ({
      ...item,
      cover: item.cover && item.cover.includes('http')
        ? item.cover
        : `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.title || '饭店')}`
    }))

    if (searchParams.value.page === 1) {
      enjoyList.value = newList
    } else {
      enjoyList.value.push(...newList)
    }

    totalCount.value = response.data.total || 0
    finished.value = enjoyList.value.length >= totalCount.value
  }
}

const handleSearch = () => {
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

const navigateToDetail = (enjoyId) => {
  router.push(`/enjoy/detail/${enjoyId}`)
}

const navigateToCreate = () => {
  router.push('/enjoy/create')
}

onMounted(() => {
  loadData()

  setTimeout(() => {
    hideTabBar()
  }, 100)
})

onBeforeUnmount(() => {
  showTabBar()
})

const hideTabBar = () => {
  if (document && document.body) {
    document.body.classList.add('hide-tabbar')
  }
  const tabBar = document.querySelector('.snptabbar')
  if (tabBar) {
    tabBar.style.display = 'none'
  }
}

const showTabBar = () => {
  if (document && document.body) {
    document.body.classList.remove('hide-tabbar')
  }
  const tabBar = document.querySelector('.snptabbar')
  if (tabBar) {
    tabBar.style.display = ''
  }
}
</script>

<style lang="scss" scoped>
.enjoy-container {
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
  background: linear-gradient(135deg, #ff9ff3 0%, #5f27cd 100%);
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
  box-shadow: 0 8px 32px rgba(255, 159, 243, 0.15);
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
  color: #5f27cd;
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
    background: linear-gradient(135deg, #ff9ff3 0%, #5f27cd 100%);
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(255, 159, 243, 0.3);
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

.active-filters {
  display: flex;
  gap: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(255, 159, 243, 0.1), rgba(95, 39, 205, 0.1));
  border: 1px solid rgba(255, 159, 243, 0.3);
  border-radius: 16px;
  font-size: 13px;
  color: #5f27cd;
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

.enjoy-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(255, 159, 243, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
}

.card-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.enjoy-card:active .card-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
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

  &.cuisine-tag {
    background: linear-gradient(135deg, #ff9ff3 0%, #5f27cd 100%);
    color: white;
  }

  &:not(.cuisine-tag) {
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

.location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  flex: 1;

  i {
    font-size: 14px;
  }

  span {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  border-top: 3px solid #5f27cd;
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

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* Responsive */
@media (min-width: 768px) {
  .enjoy-container {
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
