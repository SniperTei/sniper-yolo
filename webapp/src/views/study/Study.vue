<template>
  <div class="study-container">
    <van-nav-bar title="学习列表" />

    <!-- 搜索框 -->
    <div class="search-wrapper">
      <van-search
        v-model="searchValue"
        placeholder="搜索功能名称或描述"
        shape="round"
        @input="handleSearch"
      />
    </div>

    <!-- 标签筛选 -->
    <div class="tags-wrapper">
      <div
        v-for="tag in tags"
        :key="tag"
        :class="['tag', { active: activeTag === tag }]"
        @click="handleTagClick(tag)"
      >
        {{ tag }}
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="content-wrapper">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多数据了"
        @load="onLoad"
      >
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="function-item"
          @click="handleItemClick(item)"
        >
          <div class="item-header">
            <h3 class="item-title">{{ item.name }}</h3>
            <span :class="['item-tag', `tag-${item.type}`]">{{ getTypeLabel(item.type) }}</span>
          </div>
          <p class="item-description">{{ item.description }}</p>
          <div class="item-footer">
            <div class="item-categories">
              <span
                v-for="category in item.categories"
                :key="category"
                class="category-tag"
              >
                {{ category }}
              </span>
            </div>
            <van-icon name="arrow" class="arrow-icon" />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredItems.length === 0 && !loading" class="empty-state">
          <van-empty description="暂无匹配的功能" image="search" />
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, List, Empty, Icon } from 'vant'
import deviceBridge from '@/utils/device.js'

const router = useRouter()
const searchValue = ref('')
const activeTag = ref('全部')
const loading = ref(false)
const finished = ref(false)

// 标签列表
const tags = ref(['全部', 'AI技术', 'OCR识别', '图像处理', '人脸识别', '二维码扫描', 'coconut测试', '趣味'])

// 功能列表数据
const functionItems = ref([
  {
    id: '1',
    name: '大语言模型',
    description: '调用自己部署的大语言模型，实现文本生成、问答等功能',
    type: 'page',
    functionName: 'largeLanguageModel',
    url: '/large-language-model',
    categories: ['AI技术']
  },
  {
    id: '2',
    name: 'OCR文字识别',
    description: '探索Tesseract、PaddleOCR技术，实现高精度的图片文字识别和结构化提取',
    type: 'app',
    functionName: 'ocrRecognition',
    appMethod: 'ocr.recognize',
    categories: ['OCR识别']
  },
  {
    id: '3',
    name: '二维码扫描',
    description: '研究ZXing、QRCode.js等库，实现稳定的二维码识别、解析功能',
    type: 'app',
    functionName: 'qrcodeScan',
    appMethod: 'qrcode.scan',
    categories: ['二维码扫描']
  },
  {
    id: '4',
    name: '图像增强技术',
    description: '深入学习图像降噪、去雾、色彩还原等技术和算法，提升图片质量',
    type: 'api',
    functionName: 'imageEnhance',
    apiEndpoint: '/api/image/enhance',
    categories: ['图像处理']
  },
  {
    id: '5',
    name: '人脸识别系统',
    description: '研究OpenCV、ArcFace算法，构建高精度的人脸识别、身份验证系统',
    type: 'app',

    appMethod: 'face.detect',
    categories: ['人脸识别', 'AI技术']
  },
  {
    id: '6',
    name: 'AI抠图技术',
    description: '探索Deep-Lab、MODNet模型，实现精确的图像分割和智能背景替换',
    type: 'api',
    functionName: 'imageSegment',
    apiEndpoint: '/api/image/segment',
    categories: ['AI技术', '图像处理']
  },
  {
    id: '7',
    name: '文本分析',
    description: '自然语言处理入门，包括情感分析、关键词提取和文本分类技术',
    type: 'page',
    functionName: 'textAnalysis',
    url: '/text-analysis',
    categories: ['AI技术']
  },
  {
    id: '8',
    name: '语音识别',
    description: '研究Speech Recognition和DeepSpeech等库，实现语音转文字功能',
    type: 'app',
    functionName: 'speechRecognition',
    appMethod: 'speech.recognize',
    categories: ['AI技术']
  },
  {
    id: '9',
    name: 'Coconut Bridge 测试',
    description: '验证 H5 与 Android 原生 Coconut SDK Bridge 通信链路，测试设备、网络、存储、剪贴板等原生 API',
    type: 'page',
    functionName: 'coconutTest',
    url: '/coconut-test',
    categories: ['coconut测试']
  },
  {
    id: '10',
    name: '今天吃什么',
    description: '老虎机随机选餐 + AI大厨推荐，帮你解决今天吃什么的世纪难题',
    type: 'page',
    functionName: 'whatToEat',
    url: '/what',
    categories: ['AI技术', '趣味']
  }
])

// 计算过滤后的功能列表
const filteredItems = computed(() => {
  let items = [...functionItems.value]

  // 标签过滤
  if (activeTag.value !== '全部') {
    items = items.filter(item =>
      item.categories.includes(activeTag.value)
    )
  }

  // 搜索过滤
  if (searchValue.value.trim()) {
    const searchLower = searchValue.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    )
  }

  return items
})

// 处理标签点击
const handleTagClick = (tag) => {
  activeTag.value = tag
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

// 处理功能项点击
const handleItemClick = (item) => {
  switch (item.type) {
    case 'page':
      // 跳转到页面
      router.push(item.url)
      break
    case 'app':
      // 调用壳子app
      callAppMethod(item.appMethod, item)
      break
    case 'api':
      // 调用后端接口
      callApiEndpoint(item.apiEndpoint, item)
      break
    default:
      console.warn('未知的功能类型:', item.type)
  }
}

// 调用壳子app方法
const callAppMethod = (method, item) => {
  console.log('调用壳子app方法:', method, '参数:', item)

  deviceBridge.callNative(method, {
    name: item.name,
    description: item.description
  }, (result) => {
    console.log('收到app回调结果:', result)
    if (result.success) {
      showToast(`成功调用${item.name}`)
    } else {
      showToast('调用失败: ' + (result.message || '未知错误'))
    }
  })
}

// 调用后端接口
const callApiEndpoint = (endpoint, item) => {
  console.log('调用后端接口:', endpoint, '参数:', item)

  // 这里应该使用实际的API请求方法，这里只是示例
  // 假设使用axios或项目中的request工具
  showToast(`正在调用${item.name}接口...`)

  // 模拟API调用
  setTimeout(() => {
    showToast(`${item.name}接口调用成功`)
  }, 1000)
}

// 获取类型标签文本
const getTypeLabel = (type) => {
  const typeMap = {
    page: '页面',
    app: '原生',
    api: '接口'
  }
  return typeMap[type] || '未知'
}

// 显示提示
const showToast = (message) => {
  deviceBridge.showToast(message)
}

// 列表加载更多（模拟）
const onLoad = () => {
  // 这里只是模拟，实际项目中可能需要加载更多数据
  setTimeout(() => {
    loading.value = false
    finished.value = true // 标记没有更多数据
  }, 500)
}
</script>

<style lang="scss" scoped>
.study-container {
  min-height: 100vh;
  background-color: $bg-secondary;

  .search-wrapper {
    padding: $spacing-md $spacing-lg 0;
    background-color: $bg-primary;
  }

  .tags-wrapper {
    padding: $spacing-md $spacing-lg;
    background-color: $bg-primary;
    display: flex;
    gap: $spacing-small;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;

    .tag {
      padding: $spacing-xs $spacing-small;
      border-radius: $border-radius-full;
      background-color: $bg-secondary;
      color: $text-secondary;
      font-size: $font-size-sm;
      cursor: pointer;
      transition: all 0.3s;

      &.active {
        background-color: $primary-color;
        color: $bg-primary;
      }
    }
  }

  .content-wrapper {
    padding: $spacing-md $spacing-lg;
    padding-bottom: calc(#{$spacing-lg} + 50px); // 为底部导航栏留出空间
  }

  .function-item {
    padding: $spacing-md;
    background-color: $bg-primary;
    border-radius: $border-radius;
    margin-bottom: $spacing-md;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;

    &:active {
      transform: scale(0.98);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-xs;

      .item-title {
        font-size: $font-size-lg;
        font-weight: bold;
        color: $text-primary;
        margin: 0;
      }

      .item-tag {
        padding: $spacing-xs $spacing-small;
        border-radius: $border-radius-small;
        font-size: $font-size-xs;
        color: $bg-primary;
      }

      .tag-page {
        background-color: $primary-color;
      }

      .tag-app {
        background-color: $theme-orange;
      }

      .tag-api {
        background-color: $theme-green;
      }
    }

    .item-description {
      font-size: $font-size-sm;
      color: $text-secondary;
      margin: $spacing-xs 0 $spacing-md;
      line-height: 1.5;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-categories {
        display: flex;
        gap: $spacing-xs;
        flex-wrap: wrap;

        .category-tag {
          padding: 2px $spacing-xs;
          background-color: $bg-info;
          color: $primary-color;
          font-size: $font-size-xs;
          border-radius: $border-radius-small;
        }
      }

      .arrow-icon {
        color: $text-secondary;
      }
    }
  }

  .empty-state {
    padding: $spacing-xxl 0;
  }
}

// 覆盖Vant样式
:deep(.van-search) {
  --van-search-left-icon-color: $primary-color;
  --van-search-background: $bg-secondary;
}

:deep(.van-list__finished-text) {
  color: $text-secondary;
  font-size: $font-size-sm;
}
</style>
