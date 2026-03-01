<template>
  <BaseLayout>
    <template #header>
      <Header/>
    </template>
    <template #left-side>
      <LeftMenuBar/>
    </template>
    <template #main>
      <RouterView/>
    </template>
    <template #footer>
      <Footer/>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">


import BaseLayout from "../components/layout/BaseLayout.vue";
import Footer from "../components/Footer.vue";
import LeftMenuBar from "../components/LeftMenuBar.vue";
import Header from "../components/Header.vue";
</script>

<style scoped>

</style>
