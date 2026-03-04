<script setup lang="ts">
import {computed, useAttrs} from 'vue'
import {theme} from 'ant-design-vue'
import icons, {type IconName} from '../../assets/icons/iconMapping'

const attrs = useAttrs()

const props = defineProps<{
  name: IconName
}>()

const svg = computed(() => icons[props.name] || '')

const {token} = theme.useToken()

const defaultStyle = computed(() => {
  // 只要外部传了 style，就认为外部完全接管
  if (attrs.style) {
    return {}
  }
  return {
    '--icon-color': token.value.colorTextSecondary,
    '--icon-hover-bg': token.value.colorBgTextHover,
    color: 'var(--icon-color)'
  }
})
</script>

<template>
  <span
      class="icon"
      role="img"
      aria-hidden="true"
      v-bind="attrs"
      :style="defaultStyle"
      v-html="svg"
  />
</template>

<style scoped>
.icon {
  width: 1em;
  height: 1em;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  border-radius: 4px;
  cursor: pointer;

  transition: background-color 0.15s ease;
}

/* noinspection CssUnresolvedCustomProperty */
.icon:hover {
  background-color: var(--icon-hover-bg);
}

/* SVG 永远跟随 currentColor */
.icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
  stroke: currentColor;
}
</style>
