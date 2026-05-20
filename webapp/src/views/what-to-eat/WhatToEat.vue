<template>
  <div class="what-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        <i class="van-icon van-icon-arrow-left"></i>
      </button>
      <h1 class="page-title">今天吃什么？</h1>
      <div class="back-btn" style="visibility: hidden;"></div>
    </div>

    <div class="content-scroll">
      <!-- 分类筛选 -->
      <CategoryFilter v-model="currentCategory" />

      <!-- 老虎机 -->
      <SlotMachine
        :foods="foodPool"
        :spinning="spinning"
        :target-food="targetFood"
        @spin="handleSpin"
      />

      <!-- 随机结果卡片 -->
      <RandomResult
        v-if="resultFood"
        :food="resultFood"
        @click="goToDetail(resultFood)"
      />

      <!-- AI推荐区域（暂时关闭） -->
      <!-- <AIRecommendCard
        :result="aiResult"
        :loading="aiLoading"
      />

      <div class="ai-action" v-if="!aiLoading && !aiResult">
        <button class="ai-btn" @click="handleAIRecommend" :disabled="aiLoading">
          🤖 问问AI大厨
        </button>
      </div>
      <div class="ai-action" v-if="aiResult">
        <button class="ai-btn secondary" @click="handleAIRecommend" :disabled="aiLoading">
          换个推荐
        </button>
      </div> -->

      <!-- 底部留白 -->
      <div style="height: 80px;"></div>
    </div>

    <!-- 五彩纸屑 -->
    <ConfettiEffect :active="showConfetti" @done="showConfetti = false" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import CategoryFilter from './components/CategoryFilter.vue'
import SlotMachine from './components/SlotMachine.vue'
import RandomResult from './components/RandomResult.vue'
import ConfettiEffect from './components/ConfettiEffect.vue'
import { getFoodList } from '@/api/foodApi.js'

const router = useRouter()

// 状态
const currentCategory = ref('')
const foodPool = ref([])
const spinning = ref(false)
const targetFood = ref(null)
const resultFood = ref(null)
const showConfetti = ref(false)

// 加载食物池
const loadFoodPool = async () => {
  try {
    const params = { page: 1, count: 200 }
    if (currentCategory.value) {
      params.category = currentCategory.value
    }
    const res = await getFoodList(params)
    if (res.code === '000000' && res.data?.foods) {
      foodPool.value = res.data.foods
    }
  } catch (e) {
    console.error('加载食物池失败:', e)
  }
}

// 分类变化时重新加载
watch(currentCategory, () => {
  resultFood.value = null
  loadFoodPool()
})

// 转一转
const handleSpin = () => {
  if (foodPool.value.length === 0) {
    showToast('暂无可选菜品')
    return
  }

  resultFood.value = null
  showConfetti.value = false

  // 随机选择目标
  const idx = Math.floor(Math.random() * foodPool.value.length)
  targetFood.value = foodPool.value[idx]
  spinning.value = true

  // 等待所有转轴停止（最慢的是2000ms + 缓冲）
  setTimeout(() => {
    spinning.value = false
    resultFood.value = targetFood.value
    showConfetti.value = true
  }, 2200)
}

// 跳转详情
const goToDetail = (food) => {
  if (food?.id) {
    router.push(`/food/detail/${food.id}`)
  }
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadFoodPool()
  // 隐藏底部tabbar
  setTimeout(() => {
    const tabBar = document.querySelector('.snptabbar')
    if (tabBar) tabBar.style.display = 'none'
  }, 100)
})

onBeforeUnmount(() => {
  const tabBar = document.querySelector('.snptabbar')
  if (tabBar) tabBar.style.display = ''
})
</script>

<style lang="scss" scoped>
.what-container {
  min-height: 100vh;
  background: #f8f9fe;
}

.top-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 16px 16px;
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
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
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin: 0;
  text-align: center;
  letter-spacing: 1px;
  flex: 1;
}

.content-scroll {
  padding-top: 16px;
}
</style>
