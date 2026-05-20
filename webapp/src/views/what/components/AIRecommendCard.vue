<template>
  <div class="ai-recommend">
    <div class="divider">
      <span class="divider-text">AI 为你推荐</span>
    </div>

    <div v-if="loading" class="ai-loading">
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
      <p>AI 大厨正在思考...</p>
    </div>

    <transition name="card-fade">
      <div v-if="result && !loading" class="ai-card">
        <div class="ai-icon">🤖</div>
        <div class="ai-content">
          <p class="ai-text">{{ result }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  result: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.ai-recommend {
  padding: 0 16px;
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8e8e8;
  }
}

.divider-text {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  font-weight: 500;
}

.ai-loading {
  text-align: center;
  padding: 24px;

  p {
    font-size: 14px;
    color: #999;
    margin-top: 12px;
  }
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 6px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    animation: dot-bounce 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.ai-card {
  background: linear-gradient(135deg, #f8f9fe, #f0f0ff);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.ai-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.ai-content {
  .ai-text {
    font-size: 14px;
    color: #444;
    line-height: 1.7;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.card-fade-enter-active {
  animation: card-fade-in 0.5s ease;
}

@keyframes card-fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
