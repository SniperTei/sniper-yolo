<script setup>
import SNPTabBar from './components/tabbar/SNPTabBar.vue';
</script>

<template>
  <div class="app-container">
    <router-view />
    <SNPTabBar class="snptabbar" />
  </div>
</template>

<style scoped lang="scss">
.app-container {
  min-height: 100vh;
  padding-bottom: 100px; /* 为底部导航栏和备案号预留空间 */
}
</style>
