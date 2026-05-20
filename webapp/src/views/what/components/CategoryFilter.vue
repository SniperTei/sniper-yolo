<template>
  <div class="category-filter">
    <div class="filter-scroll">
      <span
        v-for="option in options"
        :key="option.value"
        class="filter-tag"
        :class="{ active: modelValue === option.value }"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const options = [
  { label: '全部', value: '' },
  { label: '荤菜', value: '荤菜' },
  { label: '素菜', value: '素菜' },
  { label: '汤类', value: '汤类' },
  { label: '凉菜', value: '凉菜' },
  { label: '热菜', value: '热菜' },
  { label: '主食', value: '主食' },
  { label: '小吃', value: '小吃' },
  { label: '甜点', value: '甜点' }
]
</script>

<style lang="scss" scoped>
.category-filter {
  padding: 0 16px 12px;
}

.filter-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-tag {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
  user-select: none;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: linear-gradient(135deg, #ff6b6b, #ffa502);
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.35);
  }
}
</style>
