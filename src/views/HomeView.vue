<template>
  <BaseLayout>
    <template #header>
      <HeaderBar/>
    </template>
    <template #left-side>
      <LeftMenuBar/>
    </template>
    <template #main>
      <RouterView/>
    </template>
    <template #footer>
      <Bottom/>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">


import HeaderBar from "../components/HeaderBar.vue";
import BaseLayout from "../components/layout/BaseLayout.vue";
import Bottom from "../components/Bottom.vue";
import LeftMenuBar from "../components/LeftMenuBar.vue";
</script>

<style scoped>

</style>
