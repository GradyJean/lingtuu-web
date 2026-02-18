<template>
  <div class="home">
    <h1>Home</h1>

    <div class="counter-section">
      <a-card title="Pinia Counter">
        <p>Count: {{ counterStore.count }}</p>
        <p>Double Count: {{ counterStore.doubleCount }}</p>
        <a-space>
          <a-button type="primary" @click="counterStore.increment">Increment</a-button>
          <a-button @click="counterStore.reset">Reset</a-button>
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCounterStore } from '../stores/counter'

const counterStore = useCounterStore()
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.counter-section {
  margin-top: 20px;
}
</style>
