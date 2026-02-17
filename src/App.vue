<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <HelloWorld />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
main {
  padding: 20px;
}
</style>
