<script setup lang="ts">
import AppLayout from "../components/layout/AppLayout.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id as string | undefined;
</script>

<template>
  <AppLayout>
    <template #header>
      {{ id ?? '未传入章节ID' }}
    </template>
    <template #left-sidebar>
      2
    </template>
    <template #main>
      3
    </template>
  </AppLayout>
</template>

<style scoped>

</style>
