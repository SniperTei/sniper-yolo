<template>
  <transition name="result-pop">
    <div class="random-result" v-if="food" @click="$emit('click')">
      <div class="result-card">
        <div class="result-badge">今天吃这个!</div>
        <div class="result-body">
          <h3 class="food-name">{{ food.title }}</h3>
          <div class="food-tags">
            <span v-if="food.category" class="tag category">{{ food.category }}</span>
            <span v-if="food.flavor" class="tag flavor">{{ food.flavor }}</span>
          </div>
          <p v-if="food.content" class="food-desc">{{ food.content }}</p>
          <div v-if="food.star" class="food-star">
            <span class="star-score">{{ food.star }}</span>
            <span class="star-label">分</span>
          </div>
        </div>
        <div class="result-hint">点击查看详情</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  food: {
    type: Object,
    default: null
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.random-result {
  padding: 0 16px;
  margin-top: 16px;
}

.result-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
}

.result-badge {
  background: linear-gradient(135deg, #ff6b6b, #ffa502);
  color: white;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

.result-body {
  padding: 16px 20px;
}

.food-name {
  font-size: 22px;
  font-weight: 800;
  color: #333;
  margin: 0 0 10px;
  text-align: center;
}

.food-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;

  .tag {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    &.category {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    &.flavor {
      background: linear-gradient(135deg, #ff6b6b, #ffa502);
      color: white;
    }
  }
}

.food-desc {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin: 0 0 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.food-star {
  text-align: center;

  .star-score {
    font-size: 28px;
    font-weight: 800;
    color: #ffa502;
  }

  .star-label {
    font-size: 12px;
    color: #999;
    margin-left: 2px;
  }
}

.result-hint {
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
  color: #bbb;
  border-top: 1px solid #f5f5f5;
}

.result-pop-enter-active {
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-pop-leave-active {
  animation: pop-in 0.2s ease reverse;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
