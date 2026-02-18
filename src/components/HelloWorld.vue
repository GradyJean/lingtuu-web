<template>
  <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" :style="{ lineHeight: '64px' }">
    <a-menu-item key="/">
      <router-link to="/">Home</router-link>
    </a-menu-item>
    <a-menu-item key="/about">
      <router-link to="/about">About</router-link>
    </a-menu-item>
    <a-menu-item key="/login" style="margin-left: auto">
      <a-button type="primary" v-if="!authStore.isLoggedIn" @click="showLogin = true">登录</a-button>
      <a-button v-else @click="handleLogout">退出</a-button>
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const selectedKeys = ref(['/'])
const authStore = useAuthStore()
const router = useRouter()

const showLogin = computed(() => !authStore.isLoggedIn)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
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
