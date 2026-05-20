<template>
  <div class="slot-machine">
    <div class="machine-frame">
      <div class="machine-header">
        <span class="machine-label">今天吃什么</span>
      </div>

      <div class="reels-container">
        <div
          v-for="(reel, ri) in reels"
          :key="ri"
          class="reel"
          :class="{ stopped: reel.stopped }"
        >
          <div class="reel-label">{{ reel.label }}</div>
          <div class="reel-window">
            <div class="reel-strip" :style="{ transform: `translateY(${reel.offset}px)` }">
              <div
                v-for="(item, idx) in reel.items"
                :key="idx"
                class="reel-item"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        class="spin-btn"
        :class="{ spinning: spinning }"
        :disabled="spinning"
        @click="$emit('spin')"
      >
        <span v-if="!spinning" class="btn-text">转一转!</span>
        <span v-else class="btn-text">转动中...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  foods: {
    type: Array,
    default: () => []
  },
  spinning: {
    type: Boolean,
    default: false
  },
  targetFood: {
    type: Object,
    default: null
  }
})

defineEmits(['spin'])

const ITEM_HEIGHT = 44
const VISIBLE_ITEMS = 1

const reels = ref([
  { label: '菜名', items: ['—'], offset: 0, stopped: true, timer: null },
  { label: '分类', items: ['—'], offset: 0, stopped: true, timer: null },
  { label: '口味', items: ['—'], offset: 0, stopped: true, timer: null },
])

watch(() => props.spinning, (val) => {
  if (val && props.targetFood && props.foods.length > 0) {
    startSpin(props.targetFood)
  }
})

watch(() => props.foods, (foods) => {
  if (foods.length > 0) {
    reels.value[0].items = foods.map(f => f.title || '未知')
    reels.value[1].items = foods.map(f => f.category || '其他')
    reels.value[2].items = foods.map(f => f.flavor || '未知')
  }
}, { immediate: true })

const startSpin = (target) => {
  reels.value.forEach(r => {
    r.stopped = false
    if (r.timer) clearInterval(r.timer)
  })

  // Build target display values
  const targets = [
    target.title || '未知',
    target.category || '其他',
    target.flavor || '未知'
  ]

  // Find target index in each reel
  const targetIndices = targets.map((t, i) => {
    const idx = reels.value[i].items.indexOf(t)
    return idx >= 0 ? idx : 0
  })

  // Spin each reel with staggered stop times
  const stopDelays = [800, 1400, 2000]
  const speeds = [50, 60, 70] // starting interval in ms

  reels.value.forEach((reel, i) => {
    let speed = speeds[i]
    let elapsed = 0
    const stopAt = stopDelays[i]

    reel.timer = setInterval(() => {
      elapsed += speed

      // Random offset for spinning effect
      const randomIdx = Math.floor(Math.random() * reel.items.length)
      reel.offset = -(randomIdx * ITEM_HEIGHT)

      // Start slowing down near stop time
      if (elapsed > stopAt * 0.6) {
        speed = Math.min(speed + 15, 400)
        clearInterval(reel.timer)
        reel.timer = setInterval(() => {
          elapsed += speed
          const randomIdx2 = Math.floor(Math.random() * reel.items.length)
          reel.offset = -(randomIdx2 * ITEM_HEIGHT)

          if (elapsed >= stopAt) {
            clearInterval(reel.timer)
            reel.timer = null
            // Land on target
            reel.offset = -(targetIndices[i] * ITEM_HEIGHT)
            reel.stopped = true
          }
        }, speed)
      }
    }, speed)
  })
}

onBeforeUnmount(() => {
  reels.value.forEach(r => {
    if (r.timer) clearInterval(r.timer)
  })
})
</script>

<style lang="scss" scoped>
.slot-machine {
  padding: 0 16px;
}

.machine-frame {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.machine-header {
  background: linear-gradient(135deg, #ff6b6b, #ffa502);
  padding: 12px 0;
  text-align: center;
}

.machine-label {
  font-size: 16px;
  font-weight: 700;
  color: white;
  letter-spacing: 3px;
}

.reels-container {
  display: flex;
  gap: 2px;
  padding: 16px 12px;
  background: #fafafa;
}

.reel {
  flex: 1;
  text-align: center;
}

.reel-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
  font-weight: 500;
}

.reel-window {
  height: 44px;
  overflow: hidden;
  border-radius: 10px;
  background: white;
  border: 2px solid #f0f0f0;
  position: relative;
  transition: border-color 0.3s ease;

  .stopped & {
    border-color: #ffa502;
  }
}

.reel-strip {
  transition: transform 0.1s linear;

  .stopped & {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.reel-item {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spin-btn {
  display: block;
  width: calc(100% - 32px);
  margin: 16px auto;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff6b6b, #ffa502);
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35);

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.spinning {
    background: linear-gradient(135deg, #ffa502, #ff6b6b);
    animation: pulse-btn 1s ease-in-out infinite;
  }
}

@keyframes pulse-btn {
  0%, 100% { box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35); }
  50% { box-shadow: 0 4px 24px rgba(255, 107, 107, 0.6); }
}
</style>
