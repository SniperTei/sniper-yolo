<template>
  <div class="food-page">
    <!-- 固定顶部 Header -->
    <div class="fixed-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">
          <i class="van-icon van-icon-arrow-left"></i>
        </button>
        <h1 class="page-title">美食探索</h1>
        <button class="action-btn" @click="navigateToCreate">
          <i class="van-icon van-icon-plus"></i>
        </button>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <i class="van-icon van-icon-search search-icon"></i>
        <input
          v-model="searchParams.title"
          type="text"
          placeholder="搜索美食..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button v-if="searchParams.title" @click="clearSearch" class="clear-btn">
          <i class="van-icon van-icon-clear"></i>
        </button>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-group">
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
        <div class="filter-group">
          <span
            v-for="option in categoryOptions"
            :key="option.value"
            class="filter-tag"
            :class="{ active: searchParams.category === option.value }"
            @click="selectCategory(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
        <div class="filter-group">
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

    <!-- 全屏滚动列表 -->
    <div class="scroll-content">
      <van-pull-refresh
        v-model="refreshing"
        @refresh="onRefresh"
        :success-text="refreshSuccessText"
        success-duration="1500"
      >
        <van-list
          v-model:loading="listLoading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          :immediate-check="false"
        >
          <!-- 结果统计 -->
          <div v-if="foodList.length > 0" class="result-info">
            <span class="result-count">找到 {{ totalCount }} 道美食</span>
            <button v-if="searchParams.flavor || searchParams.min_star || searchParams.category" @click="clearFilters" class="clear-filter-btn">
              清除筛选
            </button>
          </div>

          <!-- 空状态 -->
          <div v-if="foodList.length === 0 && !loading" class="empty-state">
            <div class="empty-icon">🍽️</div>
            <p class="empty-text">暂无美食记录</p>
          </div>

          <!-- 列表 -->
          <div v-else class="card-list">
            <div
              v-for="item in foodList"
              :key="item.id"
              class="food-card"
              @click="navigateToDetail(item.id)"
            >
              <img
                :src="item.cover"
                :alt="item.title"
                @error="handleImageError"
                class="card-image"
                loading="lazy"
              />
              <div class="rating-badge">{{ item.star }}★</div>
              <div class="card-content">
                <h3 class="card-title">{{ item.title }}</h3>
                <div class="card-tags">
                  <span v-if="item.category" class="tag category-tag">{{ item.category }}</span>
                  <span v-if="item.flavor" class="tag flavor-tag">{{ item.flavor }}</span>
                  <span v-for="(tag, index) in item.tags" :key="index" class="tag">{{ tag }}</span>
                </div>
                <p class="card-desc">{{ item.content }}</p>
                <div class="card-footer">
                  <span class="maker">{{ item.maker }}</span>
                  <span class="time">{{ formatTime(item.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import placeholderImage from '@/assets/images/placeholder.png'
import { getFoodList } from '@/api/foodApi.js'

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
  title: '',
  content: '',
  maker: '',
  min_star: '',
  max_star: '',
  flavor: '',
  tag: '',
  category: '' // 菜品分类
})

// 列表数据
const foodList = ref([])
const loading = ref(false)
const finished = ref(false)
const totalCount = ref(0)

// 下拉刷新和上拉加载状态
const refreshing = ref(false)
const listLoading = ref(false)
const refreshSuccessText = ref('刷新成功')

// 口味筛选选项
const flavorOptions = [
  { text: '全部', value: '' },
  { text: '麻辣', value: '麻辣' },
  { text: '酸甜', value: '酸甜' },
  { text: '咸鲜', value: '咸鲜' },
  { text: '清淡', value: '清淡' },
  { text: '香辣', value: '香辣' }
]

// 分类筛选选项
const categoryOptions = [
  { text: '全部分类', value: '' },
  { text: '素菜', value: '素菜' },
  { text: '荤菜', value: '荤菜' },
  { text: '凉菜', value: '凉菜' },
  { text: '热菜', value: '热菜' },
  { text: '汤类', value: '汤类' },
  { text: '下酒菜', value: '下酒菜' },
  { text: '主食', value: '主食' },
  { text: '甜点', value: '甜点' },
  { text: '小吃', value: '小吃' }
]

// 评分筛选选项
const ratingOptions = [0, 3, 4, 4.5]

// 处理图片加载失败
const handleImageError = (event) => {
  event.target.src = placeholderImage
}

// 选择口味
const selectFlavor = (flavor) => {
  searchParams.value.flavor = flavor
  searchParams.value.page = 1
  finished.value = false
  foodList.value = []
  loadData()
}

// 选择分类
const selectCategory = (category) => {
  searchParams.value.category = category
  searchParams.value.page = 1
  finished.value = false
  foodList.value = []
  loadData()
}

// 选择最低评分
const selectMinRating = (score) => {
  searchParams.value.min_star = score === 0 ? '' : score
  searchParams.value.page = 1
  finished.value = false
  foodList.value = []
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
      const response = await getFoodList(requestParams)

      if (response.code === '000000') {
        processResponseData(response)
      }
    } catch (apiError) {
      console.log('API调用失败，使用模拟数据:', apiError)
    }
  } catch (error) {
    console.error('请求失败:', error)
    if (foodList.value.length === 0) {
      foodList.value = [{
        id: 'fallback-1',
        title: '示例美食',
        content: '这是一道美味的示例菜品，展示了基本信息。',
        cover: 'https://via.placeholder.com/400x300?text=示例美食',
        tags: ['示例', '美食'],
        star: 4.5,
        maker: '示例厨师',
        flavor: '示例口味',
        create_time: new Date().toISOString()
      }]
      totalCount.value = 1
    }
  } finally {
    loading.value = false
  }
}

// 处理响应数据
const processResponseData = (response, append = false) => {
  if (response.data && response.data.foods) {
    const newList = response.data.foods.map(item => ({
      ...item,
      cover: item.cover && item.cover.includes('http')
        ? item.cover
        : `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.title || '美食')}`
    }))

    // 如果是第一页或者是刷新，直接替换；否则追加
    if (searchParams.value.page === 1 || !append) {
      foodList.value = newList
    } else {
      foodList.value.push(...newList)
    }

    totalCount.value = response.data.total || 0
    finished.value = foodList.value.length >= totalCount.value

    console.log(`分页信息: 第${searchParams.value.page}页, 已加载${foodList.value.length}条, 总共${totalCount.value}条`)
  }
}

// 下拉刷新
const onRefresh = async () => {
  try {
    // 重置到第一页
    searchParams.value.page = 1
    finished.value = false

    const requestParams = { ...searchParams.value }
    requestParams.page = 1
    requestParams.count = 10

    const response = await getFoodList(requestParams)

    if (response.code === '000000') {
      processResponseData(response)
      refreshSuccessText.value = `刷新成功，共 ${totalCount.value} 道美食`
    } else {
      refreshSuccessText.value = '刷新失败'
    }
  } catch (error) {
    console.error('刷新失败:', error)
    refreshSuccessText.value = '刷新失败'
  } finally {
    refreshing.value = false
  }
}

// 上拉加载
const onLoad = async () => {
  try {
    // 如果已经没有更多数据，直接返回
    if (finished.value) {
      listLoading.value = false
      return
    }

    // 当前页加1（加载下一页）
    const currentPage = searchParams.value.page
    const nextPage = currentPage + 1

    const requestParams = { ...searchParams.value }
    requestParams.page = nextPage
    requestParams.count = 10

    const response = await getFoodList(requestParams)

    if (response.code === '000000') {
      // 只有成功后才更新页码
      searchParams.value.page = nextPage
      processResponseData(response, true)  // 追加模式
    } else {
      // 加载失败，不更新页码
      listLoading.value = false
    }
  } catch (error) {
    console.error('加载失败:', error)
    // 加载失败，不更新页码
    listLoading.value = false
  } finally {
    // 确保加载状态被重置
    listLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchParams.value.page = 1
  finished.value = false
  foodList.value = []
  loadData()
}

// 清空搜索
const clearSearch = () => {
  searchParams.value.title = ''
  handleSearch()
}

// 清除筛选
const clearFilters = () => {
  searchParams.value.flavor = ''
  searchParams.value.min_star = ''
  searchParams.value.category = ''
  searchParams.value.page = 1
  finished.value = false
  foodList.value = []
  loadData()
}

// 初始化
onMounted(() => {
  const categoryFromRoute = route.query.category
  if (categoryFromRoute && categoryFromRoute === 'eat') {
    console.log('从美食分类进入')
  }

  loadData()

  setTimeout(() => {
    hideTabBar()
  }, 100)

  // 禁用 body 和 html 的滚动
  if (document.body) {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100%'
  }
  if (document.documentElement) {
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100%'
  }
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

  // 恢复 body 和 html 的滚动
  if (document.body) {
    document.body.style.overflow = ''
    document.body.style.height = ''
  }
  if (document.documentElement) {
    document.documentElement.style.overflow = ''
    document.documentElement.style.height = ''
  }
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
const navigateToDetail = (foodId) => {
  router.push(`/food/detail/${foodId}`)
}

// 跳转到新增页面
const navigateToCreate = () => {
  router.push('/food/create')
}
</script>

<style lang="scss" scoped>
.food-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 禁用外层滚动 */
:deep(body),
:deep(html) {
  overflow: hidden !important;
  height: 100% !important;
}

/* 固定顶部 */
.fixed-header {
  flex-shrink: 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.back-btn,
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}

.back-btn:active,
.action-btn:active {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0.95);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  flex: 1;
}

/* 搜索栏 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20px;
  padding: 8px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.search-icon {
  font-size: 16px;
  color: #ff6b6b;
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
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
  flex-shrink: 0;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-group {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.filter-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  font-size: 13px;
  color: white;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: white;
    color: #ff6b6b;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
}

/* 滚动内容区域 */
.scroll-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 让 pull-refresh 处理滚动 */
.scroll-content :deep(.van-pull-refresh) {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
  box-sizing: border-box;
}

/* 修复 iOS 安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .scroll-content :deep(.van-pull-refresh) {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
}

/* 列表 */
.card-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.food-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  position: relative;
}

.card-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
  line-height: 1.4;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;

  &.flavor-tag {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa502 100%);
    color: white;
  }

  &.category-tag {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &:not(.flavor-tag):not(.category-tag) {
    background: #f5f5f5;
    color: #666;
  }
}

.card-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 8px;
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
  font-size: 12px;
  color: #999;
}

.maker {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  flex-shrink: 0;
  margin-left: 8px;
}

/* 结果信息 */
.result-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
}

.result-count {
  font-size: 13px;
  color: #666;
}

.clear-filter-btn {
  padding: 4px 10px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  font-size: 12px;
  color: #ff6b6b;
  cursor: pointer;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* iOS Safe Area */
@supports (padding-top: env(safe-area-inset-top)) {
  .fixed-header {
    padding-top: calc(12px + env(safe-area-inset-top));
  }
}
</style>
