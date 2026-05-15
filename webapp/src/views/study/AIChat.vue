<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="header-left">
        <van-icon name="arrow-left" class="back-icon" @click="handleBack" />
        <div class="ai-info">
          <div class="ai-name">AI助手</div>
          <div class="ai-status">在线</div>
        </div>
      </div>
      <van-icon name="ellipsis" class="more-icon" />
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div class="message-item" v-for="(message, index) in messages" :key="index" :class="message.type">
        <div class="message-avatar">
          <img :src="message.avatar" :alt="message.type === 'user' ? '用户' : 'AI'" />
        </div>
        <div class="message-content">
          <div class="message-bubble">
            {{ message.text }}
          </div>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <van-icon name="add-o" class="input-icon" />
      <div class="input-wrapper">
        <input
          type="text"
          v-model="inputText"
          placeholder="输入消息..."
          class="message-input"
          @keyup.enter="handleSend"
          :disabled="isLoading"
        />
      </div>
      <van-icon name="smile-o" class="input-icon" />
      <div class="send-button" :class="{ active: inputText.trim() && !isLoading, loading: isLoading }" @click="handleSend">
        <span v-if="!isLoading">发送</span>
        <span v-else>发送中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { chat } from '@/api/llmApi'

const router = useRouter()

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

const messages = ref([
  {
    type: 'ai',
    text: '你好！我是AI助手，有什么可以帮助你的吗？',
    avatar: 'https://via.placeholder.com/40/4ECDC4/ffffff?text=AI',
    time: '10:00'
  }
])

const inputText = ref('')
const messagesContainer = ref(null)
const isLoading = ref(false)

const handleBack = () => {
  router.back()
}

const handleSend = async () => {
  if (!inputText.value.trim() || isLoading.value) return

  const userMessage = {
    type: 'user',
    text: inputText.value,
    avatar: 'https://via.placeholder.com/40/FF6B6B/ffffff?text=U',
    time: getCurrentTime()
  }

  messages.value.push(userMessage)
  const userText = inputText.value
  inputText.value = ''
  scrollToBottom()

  isLoading.value = true

  try {
    const chatMessages = [
      {
        role: 'system',
        content: '你是一个专业的AI助手，能够帮助用户解答问题和提供建议。'
      },
      ...messages.value
        .filter(msg => msg.type !== 'user' || msg.text !== userText)
        .slice(-10)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
      {
        role: 'user',
        content: userText
      }
    ]

    const response = await chat({
      model: 'glm-5.1',
      messages: chatMessages,
      stream: false,
      temperature: 0.8,
      top_p: 0.9,
      max_tokens: 500,
      num_ctx: 2048
    })

    const aiMessage = {
      type: 'ai',
      text: response.data.message.content,
      avatar: 'https://via.placeholder.com/40/4ECDC4/ffffff?text=AI',
      time: getCurrentTime()
    }
    messages.value.push(aiMessage)
    scrollToBottom()
  } catch (error) {
    console.error('调用AI接口失败:', error)
    showToast(error.message || 'AI回复失败，请稍后重试')

    const errorMessage = {
      type: 'ai',
      text: '抱歉，我遇到了一些问题，请稍后再试。',
      avatar: 'https://via.placeholder.com/40/4ECDC4/ffffff?text=AI',
      time: getCurrentTime()
    }
    messages.value.push(errorMessage)
    scrollToBottom()
  } finally {
    isLoading.value = false
  }
}

const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  scrollToBottom()
  hideTabBar()
})

onUnmounted(() => {
  showTabBar()
})
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.chat-header {
  background: linear-gradient(135deg, #4ECDC4, #44a08d);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .back-icon {
      font-size: 20px;
      color: white;
    }

    .ai-info {
      .ai-name {
        font-size: 16px;
        font-weight: 600;
        color: white;
      }

      .ai-status {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 4px;

        &::before {
          content: '';
          width: 6px;
          height: 6px;
          background-color: #4cd964;
          border-radius: 50%;
          display: inline-block;
        }
      }
    }
  }

  .more-icon {
    font-size: 20px;
    color: white;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f5f5;

  .message-item {
    display: flex;
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        align-items: flex-end;
        margin-right: 12px;
      }

      .message-bubble {
        background: linear-gradient(135deg, #4ECDC4, #44a08d);
        color: white;
        border-radius: 18px 18px 4px 18px;
      }

      .message-time {
        text-align: right;
      }
    }

    &.ai {
      .message-content {
        align-items: flex-start;
        margin-left: 12px;
      }

      .message-bubble {
        background: white;
        color: #333;
        border-radius: 18px 18px 18px 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .message-content {
      display: flex;
      flex-direction: column;
      max-width: 70%;
    }

    .message-bubble {
      padding: 12px 16px;
      font-size: 15px;
      line-height: 1.5;
      word-wrap: break-word;
      word-break: break-all;
    }

    .message-time {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.chat-input-area {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);

  .input-icon {
    font-size: 24px;
    color: #999;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #4ECDC4;
    }
  }

  .input-wrapper {
    flex: 1;
    background: #f5f5f5;
    border-radius: 24px;
    padding: 0 16px;
    display: flex;
    align-items: center;

    .message-input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 12px 0;
      font-size: 15px;
      outline: none;

      &::placeholder {
        color: #999;
      }
    }
  }

  .send-button {
    background: linear-gradient(135deg, #4ECDC4, #44a08d);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    opacity: 0.5;

    &.active {
      opacity: 1;
    }

    &.loading {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
