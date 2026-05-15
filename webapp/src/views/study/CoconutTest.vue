<template>
  <div class="coconut-test">
    <van-nav-bar
      title="Coconut Bridge 测试"
      left-arrow
      @click-left="router.back()"
    />

    <div class="content">
      <!-- 环境信息 -->
      <van-cell-group inset title="环境信息">
        <van-cell title="平台" :value="envInfo.platform" />
        <van-cell title="Coconut版本" :value="envInfo.version" />
        <van-cell title="是否原生环境" :value="envInfo.isNative ? '是' : '否'" />
      </van-cell-group>

      <!-- 设备信息 -->
      <van-cell-group inset title="设备信息">
        <van-button size="small" type="primary" @click="callApi('device.getInfo')">getInfo</van-button>
        <van-button size="small" type="primary" @click="callApi('device.getSystemInfo')">getSystemInfo</van-button>
        <van-button size="small" type="primary" @click="callApi('device.getAppInfo')">getAppInfo</van-button>
      </van-cell-group>

      <!-- 网络 -->
      <van-cell-group inset title="网络">
        <van-button size="small" type="success" @click="callApi('network.getState')">getState</van-button>
        <van-button size="small" type="success" @click="callApi('network.isConnected')">isConnected</van-button>
      </van-cell-group>

      <!-- 存储 -->
      <van-cell-group inset title="存储">
        <van-button size="small" type="warning" @click="callApi('storage.setItem', { key: 'test_key', value: 'hello_coconut_' + Date.now() })">setItem</van-button>
        <van-button size="small" type="warning" @click="callApi('storage.getItem', { key: 'test_key' })">getItem</van-button>
        <van-button size="small" type="warning" @click="callApi('storage.getAllKeys')">getAllKeys</van-button>
      </van-cell-group>

      <!-- 剪贴板 -->
      <van-cell-group inset title="剪贴板">
        <van-button size="small" type="danger" @click="callApi('clipboard.setText', { text: 'Copied from Coconut ' + new Date().toLocaleTimeString() })">setText</van-button>
        <van-button size="small" type="danger" @click="callApi('clipboard.getText')">getText</van-button>
      </van-cell-group>

      <!-- 系统 -->
      <van-cell-group inset title="系统">
        <van-button size="small" type="primary" @click="callApi('system.getVersion')">getVersion</van-button>
        <van-button size="small" type="primary" @click="callApi('system.getAllComponents')">getAllComponents</van-button>
      </van-cell-group>

      <!-- 对话框 -->
      <van-cell-group inset title="对话框">
        <van-button size="small" type="success" @click="callApi('dialog.toast', { message: 'Hello from Coconut!', duration: 2000 })">toast</van-button>
        <van-button size="small" type="success" @click="callApi('dialog.alert', { title: '提示', message: '这是一条 Coconut Bridge 测试弹窗' })">alert</van-button>
      </van-cell-group>

      <!-- 日志区域 -->
      <van-cell-group inset title="调用日志">
        <div class="log-actions">
          <van-button size="mini" plain @click="logs = []">清空日志</van-button>
        </div>
        <div class="log-area" ref="logArea">
          <div v-if="logs.length === 0" class="log-empty">暂无日志</div>
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="['log-item', log.type]"
          >
            <div class="log-header">
              <span class="log-method">{{ log.method }}</span>
              <span class="log-time">{{ log.time }}</span>
            </div>
            <div v-if="log.request" class="log-section">
              <span class="log-label">请求:</span>
              <pre class="log-json">{{ log.request }}</pre>
            </div>
            <div v-if="log.response" class="log-section">
              <span class="log-label">响应:</span>
              <pre class="log-json">{{ log.response }}</pre>
            </div>
          </div>
        </div>
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logs = ref([])
const logArea = ref(null)

const envInfo = ref({
  platform: 'unknown',
  version: 'unknown',
  isNative: false
})

onMounted(() => {
  if (typeof Coconut !== 'undefined') {
    envInfo.value = {
      platform: Coconut.env.platform,
      version: Coconut.version,
      isNative: Coconut.env.isNative
    }
  }
})

const callApi = async (method, params = {}) => {
  const time = new Date().toLocaleTimeString()
  const logEntry = {
    type: 'pending',
    method,
    time,
    request: JSON.stringify(params, null, 2),
    response: null
  }
  logs.value.unshift(logEntry)
  const logIndex = 0

  try {
    if (typeof Coconut === 'undefined') {
      logEntry.type = 'error'
      logEntry.response = 'Coconut SDK 未加载'
      return
    }

    const response = await Coconut.callAsync(method, params)
    logEntry.type = response.error ? 'error' : 'success'
    logEntry.response = JSON.stringify(response, null, 2)
  } catch (err) {
    logEntry.type = 'error'
    logEntry.response = JSON.stringify(err, null, 2)
  }

  // 触发响应式更新
  logs.value = [...logs.value]

  await nextTick()
  if (logArea.value) {
    logArea.value.scrollTop = 0
  }
}
</script>

<style lang="scss" scoped>
.coconut-test {
  min-height: 100vh;
  background-color: $bg-secondary;
}

.content {
  padding-bottom: calc(#{$spacing-lg} + 50px);
}

.van-cell-group {
  margin-bottom: $spacing-md;

  :deep(.van-cell-group__title) {
    text-align: left;
    font-weight: bold;
  }
}

.van-cell-group .van-button {
  margin: $spacing-xs $spacing-xs;
}

.log-actions {
  padding: $spacing-xs $spacing-md;
  text-align: right;
}

.log-area {
  max-height: 400px;
  overflow-y: auto;
  padding: $spacing-small $spacing-md;
  background: #1a1a2e;
  color: #e0e0e0;
  font-size: 12px;
  font-family: 'Menlo', 'Courier New', monospace;
}

.log-empty {
  text-align: center;
  padding: $spacing-xxl 0;
  color: #666;
}

.log-item {
  padding: $spacing-small 0;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
  }

  &.success .log-method {
    color: #4caf50;
  }

  &.error .log-method {
    color: #f44336;
  }

  &.pending .log-method {
    color: #ff9800;
  }
}

.log-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-xs;
}

.log-method {
  font-weight: bold;
}

.log-time {
  color: #888;
}

.log-section {
  margin-top: $spacing-xs;
}

.log-label {
  color: #aaa;
  font-size: 11px;
}

.log-json {
  margin: 2px 0 0;
  padding: $spacing-xs;
  background: #0d0d1a;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
  color: #b0bec5;
  font-size: 11px;
}
</style>
