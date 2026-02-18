<script setup lang="ts">
import LoginModal from './components/LoginModal.vue'
</script>

<template>
  <LoginModal />
  <main>
    <router-view />
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
}
</style>
