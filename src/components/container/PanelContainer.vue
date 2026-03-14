<script setup lang="ts">
import {theme} from 'ant-design-vue'

const {token} = theme.useToken()
</script>

<template>
  <div class="panel-container">
    <div class="panel-viewport">
      <slot/>
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
  background: v-bind('token.colorBgContainer');
  border-radius: v-bind('`${token.borderRadiusSM}px`');

  overflow: hidden;

  /* noinspection CssUnresolvedCustomProperty */
  border: v-bind('token.colorBorderSecondary') solid 1px;
  color: v-bind('token.colorText');
}

.panel-viewport {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
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
  background-color: v-bind('token.colorTextQuaternary');
  border-radius: v-bind('`${token.borderRadiusSM}px`');
}

/* noinspection CssUnresolvedCustomProperty */
.panel-viewport::-webkit-scrollbar-thumb:hover {
  background-color: v-bind('token.colorTextTertiary');
}
</style>
