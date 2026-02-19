<template>
  <AppLayout>
    <template #header>
      <HeaderBar/>
    </template>
    <template #main>
      <router-view/>
    </template>
    <template #left-sidebar>
      <LeftMenuBar/>
    </template>
    <template #footer>
      <Bottom/>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">

import AppLayout from "../components/layout/AppLayout.vue";
import LeftMenuBar from "../components/LeftMenuBar.vue";
import Bottom from "../components/Bottom.vue";
import HeaderBar from "../components/HeaderBar.vue";
</script>

<style scoped>

</style>
