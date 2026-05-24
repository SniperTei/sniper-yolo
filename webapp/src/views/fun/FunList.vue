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
          v-model="searchParams.title"
          type="text"
          placeholder="搜索娱乐活动..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button v-if="searchParams.title" @click="clearSearch" class="clear-btn">
          <i class="van-icon van-icon-clear"></i>
        </button>
      </div>

      <!-- Flavor Filter -->
      <div class="filter-section">
        <div class="filter-label">风格</div>
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
      <div v-if="funList.length > 0" class="result-header">
        <span class="result-count">共 {{ totalCount }} 个娱乐活动</span>
        <div v-if="hasActiveFilters" class="active-filters">
          <span
            v-if="searchParams.flavor"
            class="filter-chip"
            @click="selectFlavor('')"
          >
            {{ getFlavorText(searchParams.flavor) }}
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
      <div v-if="funList.length > 0" class="card-list">
        <div
          v-for="item in funList"
          :key="item.id"
          class="fun-card"
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
              <span v-if="item.flavor" class="tag flavor-tag">{{ item.flavor }}</span>
              <span v-for="(tag, idx) in item.tags" :key="idx" class="tag">
                {{ tag }}
              </span>
            </div>

            <p class="card-description">{{ item.content }}</p>

            <div class="card-footer">
              <div class="maker">
                <span>{{ item.maker }}</span>
              </div>
              <div class="time">{{ formatTime(item.create_time) }}</div>
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
        <p>点击右上角添加您发现的精彩活动</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderImage from '@/assets/images/placeholder.png'
import { getFunList } from '@/api/funApi.js'

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
  title: '',
  flavor: '',
  min_star: '',
  max_star: '',
  tag: ''
})

const funList = ref([])
const loading = ref(false)
const finished = ref(false)
const totalCount = ref(0)

const flavorOptions = [
  { text: '全部', value: '' },
  { text: '电影', value: '电影' },
  { text: '游戏', value: '游戏' },
  { text: 'KTV', value: 'KTV' },
  { text: '密室逃脱', value: '密室逃脱' },
  { text: '桌游', value: '桌游' },
  { text: '运动', value: '运动' },
  { text: '展览', value: '展览' }
]

const ratingOptions = [0, 3, 4, 5]

const hasActiveFilters = computed(() => {
  return !!(searchParams.value.flavor || searchParams.value.min_star)
})

const getFlavorText = (flavor) => {
  const option = flavorOptions.find(opt => opt.value === flavor)
  return option ? option.text : flavor
}

const handleImageError = (event) => {
  event.target.src = placeholderImage
}

const clearSearch = () => {
  searchParams.value.title = ''
  handleSearch()
}

const selectFlavor = (flavor) => {
  searchParams.value.flavor = flavor
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

    try {
      console.log("请求参数:", requestParams)
      const response = await getFunList(requestParams)

      if (response.code === '000000') {
        processResponseData(response)
      }
    } catch (apiError) {
      console.log('API调用失败:', apiError)
    }
  } catch (error) {
    console.error('请求失败:', error)
  } finally {
    loading.value = false
  }
}

const processResponseData = (response) => {
  if (response.data && response.data.funs) {
    const newList = response.data.funs.map(item => ({
      ...item,
      cover: item.cover && item.cover.includes('http')
        ? item.cover
        : `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.title || '娱乐')}`
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

  &.flavor-tag {
    background: linear-gradient(135deg, #48dbfb 0%, #1dd1a1 100%);
    color: white;
  }

  &:not(.flavor-tag) {
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
