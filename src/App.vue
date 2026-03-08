<script setup lang="ts">
import LoginModal from './components/auth/LoginModal.vue'
import {themeMap} from "./theme/theme.ts";
import {themeState} from "./theme";
</script>

<template>
  <LoginModal/>
  <main>
    <a-config-provider :theme="themeMap[themeState.mode]">
      <router-view/>
    </a-config-provider>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
}
:deep(.ant-menu-item),
:deep(.ant-btn ) {
  border-radius: 5px;
}
</style>
