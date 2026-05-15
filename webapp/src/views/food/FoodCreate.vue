<template>
  <div class="food-create-container">
    <!-- 导航栏 -->
    <NavBar
      :title="isEditMode ? '编辑美食' : '新增美食'"
      left-text=""
      left-arrow
      @click-left="goBack"
      right-text="保存"
      @click-right="handleSubmit"
      fixed
      placeholder
    />

    <!-- 表单内容 -->
    <div class="form-container">
      <!-- 封面图选择 -->
      <div class="form-section">
        <label class="form-label">封面图 *</label>
        <div class="cover-upload" @click="handleCoverUpload">
          <img
            v-if="formData.cover"
            :src="formData.cover"
            alt="封面图预览"
            class="cover-preview"
            @error="handleCoverImageError"
            @load="handleCoverImageLoad"
            @click.stop="previewImage(formData.cover)"
          />
          <div v-else class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <p class="upload-text">点击选择封面图</p>
          </div>
        </div>
        <p class="form-hint">支持 JPG、PNG、GIF 格式，文件大小不超过10MB</p>
        <div v-if="formData.cover" class="debug-info" style="background: #f0f0f0; padding: 8px; margin-top: 8px; font-size: 12px; word-break: break-all;">
          <strong>图片URL:</strong> {{ formData.cover }}
        </div>
        <span v-if="errors.cover" class="error-message">{{ errors.cover }}</span>
      </div>

      <!-- 图片上传 -->
      <div class="form-section">
        <label class="form-label">图片（选填）</label>
        <div class="images-container">
          <div
            v-for="(image, index) in formData.images"
            :key="index"
            class="image-item"
          >
            <img
              :src="image"
              alt="食品图片"
              class="image-preview"
              @click="previewImages(index)"
            />
            <span class="image-remove" @click="removeImage(index)">×</span>
          </div>
          <div v-if="formData.images.length < 5" class="image-upload" @click="handleImageUpload">
            <div class="upload-icon">+</div>
            <p class="upload-text">添加图片</p>
          </div>
        </div>
        <p class="form-hint">最多添加5张图片</p>
      </div>

      <!-- 标题 -->
      <div class="form-section">
        <label class="form-label">美食名称 *</label>
        <input
          type="text"
          v-model="formData.title"
          placeholder="请输入美食名称"
          class="form-input"
        />
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
      </div>

      <!-- 描述 -->
      <div class="form-section">
        <label class="form-label">美食描述 *</label>
        <textarea
          v-model="formData.content"
          placeholder="请输入美食描述"
          rows="4"
          class="form-textarea"
        ></textarea>
        <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
      </div>

      <!-- 口味 -->
      <div class="form-section">
        <label class="form-label">口味 *</label>
        <div class="flavor-options">
          <span
            v-for="option in flavorOptions"
            :key="option.value"
            class="flavor-option"
            :class="{ active: formData.flavor === option.value }"
            @click="selectFlavor(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
        <span v-if="errors.flavor" class="error-message">{{ errors.flavor }}</span>
      </div>

      <!-- 分类 -->
      <div class="form-section">
        <label class="form-label">菜品分类（选填）</label>
        <div class="flavor-options">
          <span
            v-for="option in categoryOptions"
            :key="option.value"
            class="flavor-option"
            :class="{ active: formData.category === option.value }"
            @click="selectCategory(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
        <p class="form-hint">选择菜品分类（素菜、荤菜、凉菜等）</p>
      </div>

      <!-- 评分 -->
      <div class="form-section">
        <label class="form-label">评分 *</label>
        <div class="rating-selector">
          <span
            v-for="star in 5"
            :key="star"
            class="star-item"
            :class="{ active: formData.star >= star }"
            @click="setRating(star)"
          >★</span>
          <span class="rating-text">{{ formData.star }}星</span>
        </div>
      </div>

      <!-- 制作者 -->
      <div class="form-section">
        <label class="form-label">制作者 *</label>
        <input
          type="text"
          v-model="formData.maker"
          placeholder="请输入制作者名称"
          class="form-input"
        />
        <span v-if="errors.maker" class="error-message">{{ errors.maker }}</span>
      </div>

      <!-- 标签 -->
      <div class="form-section">
        <label class="form-label">标签（选填）</label>
        <div class="tags-input-container">
          <div
            v-for="(tag, index) in formData.tags"
            :key="index"
            class="tag-item"
          >
            <span class="tag-text">{{ tag }}</span>
            <span class="tag-remove" @click="removeTag(index)">×</span>
          </div>
          <input
            type="text"
            v-model="tagInput"
            placeholder="输入标签后按回车添加"
            @keyup.enter="addTag"
            class="tags-input"
          />
        </div>
        <p class="form-hint">最多添加5个标签，每个标签不超过8个字符</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NavBar, showToast, showLoadingToast, closeToast, showImagePreview } from 'vant'
import { createFood, getFoodDetail, updateFood } from '@/api/foodApi'
import { uploadBase64Image } from '@/api/uploadApi'
import deviceBridge from '@/utils/device'

// 路由
const router = useRouter()
const route = useRoute()

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)
const foodId = computed(() => route.params.id)

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  cover: '',
  images: [], // 暂时用默认空数组
  tags: [],
  star: 0,
  maker: '',
  flavor: '',
  category: '', // 菜品分类
  created_by: 1 // PostgreSQL使用整数ID和created_by字段名
})

// 标签输入
const tagInput = ref('')

// 错误提示
const errors = reactive({})

// 口味选项
const flavorOptions = [
  { text: '麻辣', value: '麻辣' },
  { text: '酸甜', value: '酸甜' },
  { text: '咸鲜', value: '咸鲜' },
  { text: '清淡', value: '清淡' },
  { text: '香辣', value: '香辣' },
  { text: '其他', value: '其他' }
]

// 分类选项
const categoryOptions = [
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

// 返回上一页
const goBack = () => {
  router.back()
}

// 选择口味
const selectFlavor = (flavor) => {
  formData.flavor = flavor
  delete errors.flavor
}

// 选择分类
const selectCategory = (category) => {
  formData.category = formData.category === category ? '' : category
}

// 设置评分
const setRating = (rating) => {
  formData.star = rating
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag) {
    if (formData.tags.length >= 5) {
      showToast('最多添加5个标签')
      return
    }
    if (tag.length > 8) {
      showToast('每个标签不超过8个字符')
      return
    }
    if (!formData.tags.includes(tag)) {
      formData.tags.push(tag)
      tagInput.value = ''
    }
  }
}

// 移除标签
const removeTag = (index) => {
  formData.tags.splice(index, 1)
}

// 处理封面图选择
const handleCoverUpload = async () => {
  try {
    // 调用app方法显示选择对话框（拍照或相册）
    const result = await deviceBridge.showImagePickerDialog()
    if (result.code === '000000' && result.data && result.data.length > 0) {
      // 选择第一张图片作为封面
      const base64Image = ensureBase64Prefix(result.data[0])

      // 显示加载提示
      showLoadingToast({
        message: '正在上传...',
        forbidClick: true,
        duration: 0
      })

      // 上传图片到服务器
      const uploadResponse = await uploadBase64Image(base64Image)

      // 关闭加载提示
      closeToast()

      if (uploadResponse.code === '000000' && uploadResponse.data) {
        // 使用服务器返回的图片URL
        const imageUrl = uploadResponse.data.url || uploadResponse.data
        console.log('设置封面图URL:', imageUrl)
        formData.cover = imageUrl
        delete errors.cover
        console.log('formData.cover:', formData.cover)
        showToast('封面图上传成功')
      } else {
        showToast('上传失败')
      }
    } else {
      showToast('未选择图片')
    }
  } catch (error) {
    closeToast()
    console.error('选择封面图失败:', error)
    showToast('选择封面图失败')
  }
}

// 处理图片上传
const handleImageUpload = async () => {
  try {
    if (formData.images.length >= 5) {
      showToast('最多添加5张图片')
      return
    }

    // 调用app方法显示选择对话框（拍照或相册）
    const result = await deviceBridge.showImagePickerDialog()
    if (result.code === '000000' && result.data && result.data.length > 0) {
      console.log('选择了', result.data.length, '张图片')

      // 显示加载提示
      showLoadingToast({
        message: `正在上传${result.data.length}张图片...`,
        forbidClick: true,
        duration: 0
      })

      // 逐个上传图片
      const uploadPromises = result.data.map(async (img, index) => {
        const base64Image = ensureBase64Prefix(img)
        console.log(`开始上传第${index + 1}张图片`)
        try {
          const response = await uploadBase64Image(base64Image)
          console.log(`第${index + 1}张图片上传成功:`, response)
          return response
        } catch (error) {
          console.error(`第${index + 1}张图片上传失败:`, error)
          throw error
        }
      })

      const uploadResponses = await Promise.all(uploadPromises)

      // 关闭加载提示
      closeToast()

      // 提取上传成功后的URL
      const successUrls = []
      const failedCount = []

      uploadResponses.forEach((res, index) => {
        if (res.code === '000000' && res.data) {
          const url = res.data.url || res.data
          successUrls.push(url)
          console.log(`图片${index + 1} URL:`, url)
        } else {
          failedCount.push(index + 1)
        }
      })

      if (successUrls.length > 0) {
        // 将上传后的图片URL添加到数组中
        formData.images.push(...successUrls)
        console.log('当前图片数组:', formData.images)

        // 限制最多5张图片
        if (formData.images.length > 5) {
          formData.images = formData.images.slice(0, 5)
        }

        // 显示成功提示
        if (failedCount.length > 0) {
          showToast(`成功上传${successUrls.length}张，失败${failedCount.length}张（第${failedCount.join(',')}张）`)
        } else {
          showToast(`成功上传${successUrls.length}张图片`)
        }
      } else {
        showToast('图片上传失败，请重试')
      }
    } else {
      showToast('未选择图片')
    }
  } catch (error) {
    closeToast()
    console.error('选择图片失败:', error)
    showToast('选择图片失败，请重试')
  }
}

// 移除图片
const removeImage = (index) => {
  formData.images.splice(index, 1)
  showToast('已移除图片')
}

// 封面图加载成功
const handleCoverImageLoad = () => {
  console.log('封面图加载成功')
}

// 封面图加载失败
const handleCoverImageError = (event) => {
  console.error('封面图加载失败:', event)
  showToast('图片加载失败，请重试')
}

// 确保Base64图片字符串包含正确的前缀
const ensureBase64Prefix = (base64Str) => {
  if (!base64Str) return base64Str
  // 如果已经包含data:image前缀，则直接返回
  if (base64Str.startsWith('data:image/')) {
    return base64Str
  }
  // 否则添加默认的jpg前缀
  return `data:image/jpeg;base64,${base64Str}`
}

// 预览单张图片（封面图）
const previewImage = (imageUrl) => {
  showImagePreview({
    images: [imageUrl],
    closeable: true,
  })
}

// 预览多张图片（从指定位置开始）
const previewImages = (startIndex = 0) => {
  showImagePreview({
    images: formData.images,
    startPosition: startIndex,
    closeable: true,
  })
}

// 表单验证
const validateForm = () => {
  // 清空之前的错误
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // 验证必填字段
  if (!formData.title.trim()) {
    errors.title = '请输入美食名称'
    isValid = false
  }

  if (!formData.content.trim()) {
    errors.content = '请输入美食描述'
    isValid = false
  }

  if (!formData.cover) {
    errors.cover = '请上传封面图'
    isValid = false
  }

  if (!formData.flavor) {
    errors.flavor = '请选择口味'
    isValid = false
  }

  if (!formData.maker.trim()) {
    errors.maker = '请输入制作者名称'
    isValid = false
  }

  if (formData.star === 0) {
    errors.star = '请设置评分'
    isValid = false
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  if (!validateForm()) {
    showToast('请完善必填信息')
    return
  }

  try {
    showLoadingToast({
      message: isEditMode.value ? '正在保存...' : '正在创建...',
      forbidClick: true,
      duration: 0
    })

    // 准备提交数据
    const submitData = {
      ...formData,
      star: Number(formData.star)
    }

    let response
    if (isEditMode.value) {
      // 编辑模式：调用更新 API
      response = await updateFood(foodId.value, submitData)
      if (response.code === '000000') {
        closeToast()  // 关闭加载提示
        showToast({
          message: '保存成功',
          duration: 1500
        })
      }
    } else {
      // 创建模式：调用创建 API
      response = await createFood(submitData)
      if (response.code === '000000') {
        closeToast()  // 关闭加载提示
        showToast({
          message: '创建成功',
          duration: 1500
        })
      }
    }

    // closeToast()  // 移除这行，避免关闭成功提示

    if (response.code === '000000') {
      // 成功后统一返回列表页
      setTimeout(() => {
        router.push('/food')
      }, 1500)
    } else {
      showToast(response.msg || (isEditMode.value ? '保存失败' : '创建失败'))
    }
  } catch (error) {
    closeToast()
    console.error(isEditMode.value ? '更新美食失败:' : '创建美食失败:', error)
    showToast(isEditMode.value ? '保存失败，请稍后重试' : '创建失败，请稍后重试')
  }
}

// 加载美食详情（编辑模式）
const loadFoodDetail = async () => {
  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })

    const response = await getFoodDetail(foodId.value)
    closeToast()

    if (response.code === '000000' && response.data) {
      const data = response.data

      // 回填表单数据
      formData.title = data.title || ''
      formData.content = data.content || ''
      formData.cover = data.cover || ''
      formData.images = data.images || []
      formData.tags = data.tags || []
      formData.star = data.star || 0
      formData.maker = data.maker || ''
      formData.flavor = data.flavor || ''
      formData.category = data.category || ''
    } else {
      showToast('加载失败')
      router.back()
    }
  } catch (error) {
    closeToast()
    console.error('加载美食详情失败:', error)
    showToast('加载失败，请稍后重试')
    router.back()
  }
}

// 初始化
onMounted(async () => {
  // 隐藏底部导航栏
  setTimeout(() => {
    hideTabBar()
  }, 100)

  // 如果是编辑模式，加载现有数据
  if (isEditMode.value) {
    await loadFoodDetail()
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
.food-create-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  position: relative;
}

/* 表单容器 */
.form-container {
  padding: 16px;
  margin-top: 52px; /* 适配导航栏高度 */
}

/* 表单区块 */
.form-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 表单标签 */
.form-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

/* 表单输入框 */
.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  background-color: #fafafa;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #fa541c;
  background-color: white;
}

.form-textarea {
  resize: none;
  min-height: 100px;
}

/* 错误提示 */
.error-message {
  display: block;
  font-size: 13px;
  color: #ff4d4f;
  margin-top: 6px;
}

/* 提示文字 */
.form-hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
  margin-bottom: 0;
}

/* 封面图上传 */
.cover-upload {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f5f5f5;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  margin: 0;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图片上传区域 */
.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
}

.image-upload {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #fafafa;
  color: #999;
}

.image-upload:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* 口味选择 */
.flavor-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flavor-option {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 18px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.flavor-option:hover {
  border-color: #fa541c;
  color: #fa541c;
}

.flavor-option.active {
  background-color: #fa541c;
  border-color: #fa541c;
  color: white;
}

/* 评分选择器 */
.rating-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star-item {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.3s;
}

.star-item:hover,
.star-item.active {
  color: #ffd700;
}

.rating-text {
  font-size: 16px;
  color: #666;
  margin-left: 8px;
}

/* 标签输入 */
.tags-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  min-height: 80px;
  align-content: flex-start;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  background-color: #fff2e8;
  color: #fa541c;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 13px;
  gap: 4px;
}

.tag-remove {
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
}

.tags-input {
  flex: 1;
  min-width: 120px;
  padding: 6px 0;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

/* 媒体查询适配 */
@media (min-width: 768px) {
  .food-create-container {
    max-width: 768px;
    margin: 0 auto;
    border-left: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }

  .cover-upload {
    height: 240px;
  }
}

/* iOS安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .food-create-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
