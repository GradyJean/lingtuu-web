<script setup lang="ts">
import {useRouter, useRoute} from 'vue-router'
import { HomeOutlined, FileTextOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="left-menu-bar">
    <a-menu mode="inline" :selected-keys="[route.path]">
      <a-menu-item key="/" @click="navigateTo('/')">
        <template #icon>
          <HomeOutlined />
        </template>
        首页
      </a-menu-item>
      <a-menu-item key="/story" @click="navigateTo('/story')">
        <template #icon>
          <FileTextOutlined />
        </template>
        Story
      </a-menu-item>
    </a-menu>
  </div>
</template>

<style scoped>
.left-menu-bar {
  padding: 16px 0;
}

:deep(.ant-menu) {
  border-inline-end: none !important;
}

:deep(.ant-menu-item) {
  margin-inline: 0;
}
</style>
