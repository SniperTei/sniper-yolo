<template>
  <div class="enjoy-create-container">
    <!-- 导航栏 -->
    <NavBar
      title="新增饭店"
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
          />
          <div v-else class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <p class="upload-text">点击选择封面图</p>
          </div>
        </div>
        <p class="form-hint">点击将随机选择一张预设图片</p>
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
            <img :src="image" alt="饭店图片" class="image-preview" />
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
        <label class="form-label">饭店名称 *</label>
        <input
          type="text"
          v-model="formData.title"
          placeholder="请输入饭店名称"
          class="form-input"
        />
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
      </div>

      <!-- 描述 -->
      <div class="form-section">
        <label class="form-label">饭店描述 *</label>
        <textarea
          v-model="formData.content"
          placeholder="请输入饭店描述"
          rows="4"
          class="form-textarea"
        ></textarea>
        <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
      </div>

      <!-- 菜系 -->
      <div class="form-section">
        <label class="form-label">菜系 *</label>
        <div class="cuisine-options">
          <span
            v-for="option in cuisineOptions"
            :key="option.value"
            class="cuisine-option"
            :class="{ active: formData.cuisine === option.value }"
            @click="selectCuisine(option.value)"
          >
            {{ option.text }}
          </span>
        </div>
        <span v-if="errors.cuisine" class="error-message">{{ errors.cuisine }}</span>
      </div>

      <!-- 位置 -->
      <div class="form-section">
        <label class="form-label">位置 *</label>
        <input
          type="text"
          v-model="formData.location"
          placeholder="请输入饭店地址"
          class="form-input"
        />
        <span v-if="errors.location" class="error-message">{{ errors.location }}</span>
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar, showToast } from 'vant'
import { createEnjoy } from '@/api/enjoyApi'
import deviceBridge from '@/utils/device'

// 路由
const router = useRouter()

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  cover: '',
  images: [], // 暂时用默认空数组
  tags: [],
  star: 0,
  location: '',
  cuisine: '',
  created_by: 1 // PostgreSQL使用整数ID和created_by字段名
})

// 标签输入
const tagInput = ref('')

// 错误提示
const errors = reactive({})

// 菜系选项
const cuisineOptions = [
  { text: '川菜', value: '川菜' },
  { text: '粤菜', value: '粤菜' },
  { text: '湘菜', value: '湘菜' },
  { text: '江浙菜', value: '江浙菜' },
  { text: '西餐', value: '西餐' },
  { text: '日料', value: '日料' },
  { text: '韩料', value: '韩料' },
  { text: '其他', value: '其他' }
]

// 返回上一页
const goBack = () => {
  router.back()
}

// 选择菜系
const selectCuisine = (cuisine) => {
  formData.cuisine = cuisine
  delete errors.cuisine
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

// 预设的mock图片URL列表
const mockImages = [
  'http://snpfiles.sniper14.online/paigupaigu/1.jpg',
  'http://snpfiles.sniper14.online/paigupaigu/2.jpg',
  'http://snpfiles.sniper14.online/paigupaigu/3.jpg',
  'http://snpfiles.sniper14.online/paigupaigu/4.jpg',
  'http://snpfiles.sniper14.online/paigupaigu/5.jpg'
]

// 处理封面图选择
const handleCoverUpload = async () => {
  try {
    // 调用app方法选择图片
    const result = await deviceBridge.selectImage()
    if (result.code === '000000' && result.data && result.data.length > 0) {
      // 选择第一张图片作为封面，并确保包含正确的Base64前缀
      formData.cover = ensureBase64Prefix(result.data[0])
      delete errors.cover
      showToast('已选择封面图')
    } else {
      showToast('未选择图片')
    }
  } catch (error) {
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
    // 调用app方法选择图片
    const result = await deviceBridge.selectImage()
    if (result.code === '000000' && result.data && result.data.length > 0) {
      // 将选择的图片添加到图片数组中，并确保包含正确的Base64前缀
      const newImages = result.data.map(img => ensureBase64Prefix(img))
      formData.images = [...formData.images, ...newImages]
      // 限制最多5张图片
      if (formData.images.length > 5) {
        formData.images = formData.images.slice(0, 5)
      }
      showToast('已添加图片')
    } else {
      showToast('未选择图片')
    }
  } catch (error) {
    console.error('选择图片失败:', error)
    showToast('选择图片失败')
  }
}

// 移除图片
const removeImage = (index) => {
  formData.images.splice(index, 1)
  showToast('已移除图片')
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

// 表单验证
const validateForm = () => {
  // 清空之前的错误
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true

  // 验证必填字段
  if (!formData.title.trim()) {
    errors.title = '请输入饭店名称'
    isValid = false
  }

  if (!formData.content.trim()) {
    errors.content = '请输入饭店描述'
    isValid = false
  }

  if (!formData.cover) {
    errors.cover = '请上传封面图'
    isValid = false
  }

  if (!formData.cuisine) {
    errors.cuisine = '请选择菜系'
    isValid = false
  }

  if (!formData.location.trim()) {
    errors.location = '请输入饭店地址'
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
    // 准备提交数据
    const submitData = {
      ...formData,
      // 格式化数据，确保与API期望格式一致
      star: Number(formData.star),
      // 这里可以添加更多数据处理逻辑，如图片上传等
    }

    // 调用API创建饭店
    const response = await createEnjoy(submitData)

    if (response.code === '000000') {
      showToast('创建成功')
      // 创建成功后返回列表页
      setTimeout(() => {
        router.push('/enjoy')
      }, 1500)
    } else {
      showToast(response.msg || '创建失败')
      // 失败时不跳转，停留在当前页面
    }
  } catch (error) {
    console.error('创建饭店失败:', error)
    showToast('创建失败，请稍后重试')
    // 错误时不跳转，停留在当前页面
  }
}

// 初始化
onMounted(() => {
  // 隐藏底部导航栏
  setTimeout(() => {
    hideTabBar()
  }, 100)
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
.enjoy-create-container {
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
  border-color: #1890ff;
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

/* 菜系选择 */
.cuisine-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cuisine-option {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 18px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.cuisine-option:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.cuisine-option.active {
  background-color: #1890ff;
  border-color: #1890ff;
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
  background-color: #e6f7ff;
  color: #1890ff;
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
  .enjoy-create-container {
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
  .enjoy-create-container {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>