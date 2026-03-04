<script setup lang="ts">
import { theme } from 'ant-design-vue'

const { token } = theme.useToken()
</script>

<template>
  <div
    class="panel-container"
    :style="{
      '--panel-bg': token.colorBgContainer,
      '--panel-border': token.colorBorderSecondary,
      '--panel-text': token.colorText,
      '--panel-scrollbar': token.colorTextQuaternary,
      '--panel-scrollbar-hover': token.colorTextTertiary
    }"
  >
    <div class="panel-viewport">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.panel-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  /* noinspection CssUnresolvedCustomProperty */
  background: var(--panel-bg);
  border-radius: 5px;

  overflow: hidden;

  /* noinspection CssUnresolvedCustomProperty */
  box-shadow: 0 0 10px 2px var(--panel-border);
  /* noinspection CssUnresolvedCustomProperty */
  color: var(--panel-text);
}

.panel-viewport {
  width: 100%;
  height: 100%;

  padding: 5px;
  box-sizing: border-box;

  overflow: auto;
  scrollbar-gutter: stable both-edges;
}
</style>

<style>
.panel-viewport::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.panel-viewport::-webkit-scrollbar-track {
  background: transparent;
}
/* noinspection CssUnresolvedCustomProperty */
.panel-viewport::-webkit-scrollbar-thumb {
  background-color: var(--panel-scrollbar);
  border-radius: 5px;
}
/* noinspection CssUnresolvedCustomProperty */
.panel-viewport::-webkit-scrollbar-thumb:hover {
  background-color: var(--panel-scrollbar-hover);
}
</style>
