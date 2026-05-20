<template>
  <div class="what-container">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <h1 class="page-title">今天吃什么？</h1>
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
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import CategoryFilter from './components/CategoryFilter.vue'
import SlotMachine from './components/SlotMachine.vue'
import RandomResult from './components/RandomResult.vue'
import AIRecommendCard from './components/AIRecommendCard.vue'
import ConfettiEffect from './components/ConfettiEffect.vue'
import { getFoodList } from '@/api/foodApi.js'
import { aiSuggest } from '@/api/aiApi.js'

const router = useRouter()

// 状态
const currentCategory = ref('')
const foodPool = ref([])
const spinning = ref(false)
const targetFood = ref(null)
const resultFood = ref(null)
const showConfetti = ref(false)
const aiResult = ref('')
const aiLoading = ref(false)

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
  aiResult.value = ''
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

// AI推荐
const handleAIRecommend = async () => {
  aiLoading.value = true
  aiResult.value = ''

  try {
    const params = { category: 'food' }
    if (currentCategory.value) {
      params.extra_prompt = `我想吃${currentCategory.value}`
    }
    const res = await aiSuggest(params)
    if (res.code === '000000' && res.data?.suggestion) {
      aiResult.value = res.data.suggestion
    } else if (res.data?.suggestion) {
      aiResult.value = res.data.suggestion
    } else {
      aiResult.value = 'AI大厨暂时无法给出建议，请稍后再试~'
    }
  } catch (e) {
    console.error('AI推荐失败:', e)
    aiResult.value = '网络异常，AI大厨正在休息中~'
  } finally {
    aiLoading.value = false
  }
}

// 跳转详情
const goToDetail = (food) => {
  if (food?.id) {
    router.push(`/food/detail/${food.id}`)
  }
}

onMounted(() => {
  loadFoodPool()
})
</script>

<style lang="scss" scoped>
.what-container {
  min-height: 100vh;
  background: #f8f9fe;
  padding-bottom: 60px;
}

.top-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 16px 16px;
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin: 0;
  text-align: center;
  letter-spacing: 1px;
}

.content-scroll {
  padding-top: 16px;
}

.ai-action {
  padding: 16px 16px 0;
  text-align: center;
}

.ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 32px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);

  &:active:not(:disabled) {
    transform: scale(0.96);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.secondary {
    background: white;
    color: #667eea;
    border: 1px solid rgba(102, 126, 234, 0.3);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    font-size: 14px;
    padding: 10px 24px;
  }
}
</style>
