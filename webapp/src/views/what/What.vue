<template>
  <div class="pending-container">
    <van-nav-bar title="待定" />
    <div class="content-wrapper">
      <div class="empty-state">
        <van-empty description="功能开发中" image="search" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Empty } from 'vant'
</script>

<style lang="scss" scoped>
.pending-container {
  min-height: 100vh;
  background-color: $bg-secondary;

  .content-wrapper {
    padding: $spacing-lg;
    padding-bottom: calc(#{$spacing-lg} + 50px); // 为底部导航栏留出空间

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
    }
  }
}
</style>
