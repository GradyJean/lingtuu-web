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
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;

  background: v-bind('token.colorBgContainer');
  border-radius: v-bind('`${token.borderRadiusSM}px`');

  overflow: hidden;


  border: v-bind('token.colorBorderSecondary') solid 1px;
  color: v-bind('token.colorText');
}

.panel-viewport {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
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


.panel-viewport::-webkit-scrollbar-thumb {
  background-color: v-bind('token.colorTextQuaternary');
  border-radius: v-bind('`${token.borderRadiusSM}px`');
}


.panel-viewport::-webkit-scrollbar-thumb:hover {
  background-color: v-bind('token.colorTextTertiary');
}
</style>
