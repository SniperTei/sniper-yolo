<template>
  <div class="confetti-container" v-if="active">
    <div
      v-for="piece in pieces"
      :key="piece.id"
      class="confetti-piece"
      :style="piece.style"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  active: Boolean
})

const emit = defineEmits(['done'])

const pieces = ref([])

const colors = ['#ff6b6b', '#ffa502', '#667eea', '#48dbfb', '#ff9ff3', '#07c160', '#feca57']

watch(() => props.active, (val) => {
  if (val) {
    createPieces()
    setTimeout(() => {
      emit('done')
    }, 2500)
  } else {
    pieces.value = []
  }
})

const createPieces = () => {
  const newPieces = []
  for (let i = 0; i < 50; i++) {
    newPieces.push({
      id: i,
      style: {
        left: Math.random() * 100 + '%',
        top: '-10px',
        width: (Math.random() * 8 + 4) + 'px',
        height: (Math.random() * 8 + 4) + 'px',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        animationDuration: (Math.random() * 1.5 + 1.5) + 's',
        animationDelay: (Math.random() * 0.8) + 's',
        transform: `rotate(${Math.random() * 360}deg)`,
      }
    })
  }
  pieces.value = newPieces
}
</script>

<style lang="scss" scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  animation: confetti-fall linear forwards;

  @keyframes confetti-fall {
    0% {
      transform: translateY(0) rotate(0deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg) scale(0.5);
      opacity: 0;
    }
  }
}
</style>
