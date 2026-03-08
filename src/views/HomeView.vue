<template>
  <PageLayout>
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
  </PageLayout>
</template>

<script setup lang="ts">


import PageLayout from "../components/layout/PageLayout.vue";
import Footer from "../components/Footer.vue";
import LeftMenuBar from "../components/LeftMenuBar.vue";
import Header from "../components/Header.vue";
</script>

<style scoped>

</style>
