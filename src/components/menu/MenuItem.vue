<script setup lang="ts">
import {computed, type ComputedRef, inject, nextTick, onBeforeUnmount, onMounted} from 'vue'
import type {GlobalToken} from 'ant-design-vue/es/theme/interface'
import Icon from './Icon.vue'
import {type IconName} from '@assets/icons/iconMapping.ts'
import {menuStateStore} from '@stores/ui.ts'

const props = defineProps<{
  iconName: IconName
  menuKey: string
  defaultActive?: boolean
  tips?: string
}>()
const emit = defineEmits<{
  (e: 'active', menuKey: string, isActive: boolean): void
}>()

const uiStore = menuStateStore()

const ctx = inject<{
  token: ComputedRef<GlobalToken>
  register: (iconKey: string, defaultActive?: boolean) => void
  unregister: (iconKey: string) => void
  activate: (iconKey: string) => void
}>('menuBar')

if (!ctx) {
  throw new Error('MenuItem must be used inside MenuBar')
}

onMounted(() => {
  ctx.register(props.menuKey, props.defaultActive)
  if (props.defaultActive) {
    void nextTick(() => {
      if (uiStore.menuState[props.menuKey]) {
        emit('active', props.menuKey, true)
      }
    })
  }
})

onBeforeUnmount(() => {
  ctx.unregister(props.menuKey)
})

const isActive = computed(() => {
  return !!uiStore.menuState[props.menuKey]
})

const onActivate = (): void => {
  ctx.activate(props.menuKey)
  emit('active', props.menuKey, !!uiStore.menuState[props.menuKey])
}
</script>

<template>
  <a-tooltip
      :title="props.tips || ''"
      placement="right"
      overlay-class-name="menu-item-tooltip"
      :mouse-enter-delay="0.7"
      :mouse-leave-delay="0"
      :color="ctx.token.value.colorBgSpotlight"

  >
    <div class="menu-item" :class="{ active: isActive }" @click="onActivate">
      <Icon :name="iconName" class="menu-inner"/>
    </div>
  </a-tooltip>
</template>

<style scoped>
/* noinspection CssUnresolvedCustomProperty */
.menu-item {
  width: 30px;
  height: 30px;
  border-radius: v-bind('`${ctx.token.value.borderRadiusSM}px`');

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: v-bind('ctx.token.value.colorTextSecondary');
  background: transparent;

  transition: background-color 0.15s ease,
  color 0.15s ease;
}

/* noinspection CssUnresolvedCustomProperty */
.menu-item:hover {
  background: v-bind('ctx.token.value.colorBgTextHover');
}

/* noinspection CssUnresolvedCustomProperty */
.menu-item.active {
  background: v-bind('ctx.token.value.colorBgTextActive');
  color: v-bind('ctx.token.value.colorText');
}

.menu-inner {
  width: 18px;
  height: 18px;
  pointer-events: none;
}

:global(.menu-item-tooltip .ant-tooltip-inner) {
  min-height: auto;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1;
  color: #FFFFFF;
}

:global(.menu-item-tooltip .ant-tooltip-arrow::before) {
  box-shadow: none;
}
</style>
