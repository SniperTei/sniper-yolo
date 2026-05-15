<template>
  <div class="fun-container">
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
      <h1 class="page-title">娱乐探索</h1>
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
          placeholder="搜索娱乐活动..."
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

      <!-- People Filter -->
      <div class="filter-section">
        <div class="filter-label">人数</div>
        <div class="filter-options">
          <span
            v-for="option in peopleOptions"
            :key="option.value"
            class="filter-tag"
            :class="{ active: searchParams.people === option.value }"
            @click="selectPeople(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Result Header -->
      <div v-if="funList.length > 0" class="result-header">
        <span class="result-count">共 {{ totalCount }} 个娱乐活动</span>
        <div v-if="hasActiveFilters" class="active-filters">
          <span
            v-if="searchParams.type"
            class="filter-chip"
            @click="selectType('')"
          >
            {{ getTypeText(searchParams.type) }}
            <i class="van-icon van-icon-cross"></i>
          </span>
          <span
            v-if="searchParams.people"
            class="filter-chip"
            @click="selectPeople('')"
          >
            {{ getPeopleText(searchParams.people) }}
            <i class="van-icon van-icon-cross"></i>
          </span>
        </div>
      </div>

      <!-- Card List -->
      <div v-if="funList.length > 0" class="card-list">
        <div
          v-for="item in funList"
          :key="item.id"
          class="fun-card"
          @click="goToDetail(item.id)"
        >
          <div class="card-image-wrapper">
            <img
              :src="item.image"
              :alt="item.name"
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
            <h3 class="card-title">{{ item.name }}</h3>

            <div class="card-tags">
              <span v-if="item.type" class="tag type-tag">{{ item.type }}</span>
              <span v-if="item.people" class="tag people-tag">{{ item.people }}人</span>
              <span v-for="(tag, idx) in item.tags" :key="idx" class="tag">
                {{ tag }}
              </span>
            </div>

            <p class="card-description">{{ item.description }}</p>

            <div class="card-footer">
              <div class="location">
                <i class="van-icon van-icon-location-o"></i>
                <span>{{ item.location }}</span>
              </div>
              <div class="price">¥{{ item.price }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载精彩活动...</p>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎮</div>
        <h3>暂无娱乐活动</h3>
        <p>发现更多有趣的活动吧</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderImage from '@/assets/images/placeholder.png'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.back()
}

const navigateToCreate = () => {
  router.push('/fun/create')
}

const searchParams = ref({
  page: 1,
  count: 10,
  name: '',
  type: '',
  people: ''
})

const funList = ref([])
const loading = ref(false)
const finished = ref(false)
const totalCount = ref(0)

const typeOptions = [
  { text: '全部', value: '' },
  { text: '电影', value: '电影' },
  { text: '游戏', value: '游戏' },
  { text: 'KTV', value: 'KTV' },
  { text: '密室逃脱', value: '密室逃脱' },
  { text: '桌游', value: '桌游' },
  { text: '运动', value: '运动' },
  { text: '展览', value: '展览' }
]

const peopleOptions = [
  { text: '不限', value: '' },
  { text: '1-2人', value: '2' },
  { text: '3-5人', value: '5' },
  { text: '6-10人', value: '10' },
  { text: '10人+', value: '10+' }
]

const mockData = {
  "code": "000000",
  "statusCode": 200,
  "msg": "获取娱乐项目列表成功",
  "data": {
    "funItems": [
      {
        "id": "1",
        "name": "星际影城",
        "description": "豪华IMAX影城，提供最新电影放映，舒适的观影环境",
        "image": "https://via.placeholder.com/400x300?text=星际影城",
        "tags": ["IMAX", "休闲"],
        "star": 4.7,
        "type": "电影",
        "people": "不限",
        "location": "市中心",
        "price": 45.00,
        "create_time": "2024-01-01T00:00:00"
      },
      {
        "id": "2",
        "name": "欢乐桌游吧",
        "description": "提供百余种桌游，专业的游戏指导，适合朋友聚会",
        "image": "https://via.placeholder.com/400x300?text=欢乐桌游吧",
        "tags": ["聚会", "社交"],
        "star": 4.5,
        "type": "桌游",
        "people": "3-5人",
        "location": "大学城",
        "price": 68.00,
        "create_time": "2024-01-01T12:00:00"
      },
      {
        "id": "3",
        "name": "星际密室逃脱",
        "description": "高科技密室逃脱，多种主题场景，挑战你的智商",
        "image": "https://via.placeholder.com/400x300?text=星际密室逃脱",
        "tags": ["解谜", "刺激"],
        "star": 4.8,
        "type": "密室逃脱",
        "people": "4-6人",
        "location": "商业广场",
        "price": 128.00,
        "create_time": "2024-01-02T18:00:00"
      },
      {
        "id": "4",
        "name": "乐动KTV",
        "description": "专业音响设备，海量曲库，私人包厢设计",
        "image": "https://via.placeholder.com/400x300?text=乐动KTV",
        "tags": ["K歌", "音乐"],
        "star": 4.6,
        "type": "KTV",
        "people": "5-10人",
        "location": "娱乐中心",
        "price": 298.00,
        "create_time": "2024-01-03T10:00:00"
      },
      {
        "id": "5",
        "name": "未来游戏体验馆",
        "description": "VR游戏、体感游戏、主机游戏一站式体验",
        "image": "https://via.placeholder.com/400x300?text=未来游戏体验馆",
        "tags": ["VR", "科技"],
        "star": 4.9,
        "type": "游戏",
        "people": "不限",
        "location": "科技园区",
        "price": 88.00,
        "create_time": "2024-01-04T09:00:00"
      },
      {
        "id": "6",
        "name": "现代艺术展",
        "description": "当代艺术家作品展览，沉浸式艺术体验",
        "image": "https://via.placeholder.com/400x300?text=现代艺术展",
        "tags": ["艺术", "文化"],
        "star": 4.4,
        "type": "展览",
        "people": "不限",
        "location": "美术馆",
        "price": 50.00,
        "create_time": "2024-01-05T14:00:00"
      }
    ],
    "total": 32,
    "page": 1,
    "count": 10
  },
  "timestamp": "2025-11-27 13:44:02"
}

const hasActiveFilters = computed(() => {
  return !!(searchParams.value.type || searchParams.value.people)
})

const getTypeText = (type) => {
  const option = typeOptions.find(opt => opt.value === type)
  return option ? option.text : type
}

const getPeopleText = (people) => {
  const option = peopleOptions.find(opt => opt.value === people)
  return option ? option.text : people
}

const handleImageError = (event) => {
  event.target.src = placeholderImage
}

const clearSearch = () => {
  searchParams.value.name = ''
  handleSearch()
}

const selectType = (type) => {
  searchParams.value.type = type
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

const selectPeople = (people) => {
  searchParams.value.people = people
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

const loadData = async () => {
  try {
    loading.value = true

    const requestParams = { ...searchParams.value }

    try {
      console.log("请求参数:", requestParams)
      const response = JSON.parse(JSON.stringify(mockData))
      console.log('模拟数据响应:', response)

      if (response.code === '000000') {
        processResponseData(response)
      }
    } catch (apiError) {
      console.log('数据获取失败，使用默认模拟数据:', apiError)
      const response = JSON.parse(JSON.stringify(mockData))
      processResponseData(response)
    }
  } catch (error) {
    console.error('请求失败:', error)
    if (funList.value.length === 0) {
      funList.value = [{
        id: 'fallback-1',
        name: '示例娱乐活动',
        description: '这是一个示例娱乐活动，展示了基本信息。',
        image: 'https://via.placeholder.com/400x300?text=示例娱乐',
        tags: ['示例'],
        star: 4.5,
        type: '示例类型',
        people: '不限',
        location: '示例地点',
        price: 88.00
      }]
      totalCount.value = 1
    }
  } finally {
    loading.value = false
  }
}

const processResponseData = (response) => {
  if (response.data && response.data.funItems) {
    const newList = response.data.funItems.map(item => ({
      ...item,
      image: item.image && item.image.includes('http')
        ? item.image
        : `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name || '娱乐')}`
    }))

    if (searchParams.value.page === 1) {
      funList.value = newList
    } else {
      funList.value.push(...newList)
    }

    totalCount.value = response.data.total || 0
    finished.value = funList.value.length >= totalCount.value
  }
}

const handleSearch = () => {
  searchParams.value.page = 1
  finished.value = false
  loadData()
}

const goToDetail = (id) => {
  console.log('查看详情:', id)
}

onMounted(() => {
  const categoryFromRoute = route.query.category
  if (categoryFromRoute && categoryFromRoute === 'fun') {
    console.log('从娱乐分类进入')
  }

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
.fun-container {
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
  background: linear-gradient(135deg, #48dbfb 0%, #1dd1a1 100%);
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
  box-shadow: 0 8px 32px rgba(72, 219, 251, 0.15);
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
  color: #1dd1a1;
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
    background: linear-gradient(135deg, #48dbfb 0%, #1dd1a1 100%);
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(72, 219, 251, 0.3);
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
  background: linear-gradient(135deg, rgba(72, 219, 251, 0.1), rgba(29, 209, 161, 0.1));
  border: 1px solid rgba(72, 219, 251, 0.3);
  border-radius: 16px;
  font-size: 13px;
  color: #1dd1a1;
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

.fun-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(72, 219, 251, 0.1);
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

.fun-card:active .card-image {
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

  &.type-tag {
    background: linear-gradient(135deg, #48dbfb 0%, #1dd1a1 100%);
    color: white;
  }

  &.people-tag {
    background: rgba(29, 209, 161, 0.1);
    color: #1dd1a1;
  }

  &:not(.type-tag):not(.people-tag) {
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

.price {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #48dbfb 0%, #1dd1a1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  border-top: 3px solid #1dd1a1;
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
  .fun-container {
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
