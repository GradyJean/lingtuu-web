<script setup lang="ts">
import {provide, ref} from 'vue'
import {theme} from 'ant-design-vue'
import {uiStateStore} from '../../stores/ui'

const props = withDefaults(
    defineProps<{
      exclusive?: boolean
    }>(),
    {
      exclusive: true
    }
)

const {token} = theme.useToken()
const uiStore = uiStateStore()

const items = ref<string[]>([])

function register(menuKey: string): void {
  if (!items.value.includes(menuKey)) {
    items.value.push(menuKey)
  }
}

function unregister(menuKey: string): void {
  items.value = items.value.filter((k) => k !== menuKey)
}

function activate(menuKey: string): void {
  const isActive = !!uiStore.menuState[menuKey]

  if (props.exclusive) {
    for (const key of items.value) {
      uiStore.menuState[key] = false
    }

    if (!isActive) {
      uiStore.menuState[menuKey] = true
    }
  } else {
    uiStore.menuState[menuKey] = !isActive
  }
}

provide('menuBar', {
  token,
  register,
  unregister,
  activate
})
</script>

<template>
  <div class="menu-bar">
    <slot/>
  </div>
</template>

<style scoped>
.menu-bar {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
