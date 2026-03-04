<script setup lang="ts">
import {computed, inject, onMounted, onBeforeUnmount} from 'vue'
import type {ComputedRef} from 'vue'
import type {GlobalToken} from 'ant-design-vue/es/theme/interface'
import Icon from './Icon.vue'
import {type IconName} from '../../assets/icons/iconMapping'
import {uiStateStore} from '../../stores/ui'

const props = defineProps<{
  name: IconName
  menuKey: string
  onClick?: (iconKey: string, isActive: boolean) => void
}>()

const uiStore = uiStateStore()

const ctx = inject<{
  token: ComputedRef<GlobalToken>
  register: (iconKey: string) => void
  unregister: (iconKey: string) => void
  activate: (iconKey: string) => void
}>('menuBar')

if (!ctx) {
  throw new Error('MenuItem must be used inside MenuBar')
}

onMounted(() => {
  ctx.register(props.menuKey)
})

onBeforeUnmount(() => {
  ctx.unregister(props.menuKey)
})

const isActive = computed(() => {
  return !!uiStore.menuState[props.menuKey]
})

const onClick = (): void => {
  ctx.activate(props.menuKey)
  props.onClick?.(props.menuKey, isActive.value)
}
</script>

<template>
  <div class="menu-item" :class="{ active: isActive }" @click="onClick">
    <Icon :name="name" class="menu-inner"/>
  </div>
</template>

<style scoped>
/* noinspection CssUnresolvedCustomProperty */
.menu-item {
  width: 30px;
  height: 30px;
  border-radius: 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: var(--menu-color);
  background: transparent;

  transition: background-color 0.15s ease,
  color 0.15s ease;
}

/* noinspection CssUnresolvedCustomProperty */
.menu-item:hover {
  background: var(--menu-hover-bg);
}

/* noinspection CssUnresolvedCustomProperty */
.menu-item.active {
  background: var(--menu-active-bg);
  color: var(--menu-active-color);
}

.menu-inner {
  width: 18px;
  height: 18px;
  pointer-events: none;
}
</style>
