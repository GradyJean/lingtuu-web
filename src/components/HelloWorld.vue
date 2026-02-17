<template>
  <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" :style="{ lineHeight: '64px' }">
    <a-menu-item key="/">
      <router-link to="/">Home</router-link>
    </a-menu-item>
    <a-menu-item key="/about">
      <router-link to="/about">About</router-link>
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedKeys = ref(['/'])
</script>

<style scoped>
a-menu {
  padding: 0 20px;
}

a-menu a {
  color: inherit;
  text-decoration: none;
}
</style>
