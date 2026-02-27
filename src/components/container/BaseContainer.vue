<template>
  <a-config-provider :theme="themeMap[themeState.mode]">
    <a-layout class="root">
      <!-- top -->
      <a-layout-header class="top" :style="{ backgroundColor: token.colorBgLayout }">
        <slot name="top-side-bar"/>
      </a-layout-header>

      <a-layout class="body" :style="{ backgroundColor: token.colorBgLayout }">
        <!-- left -->
        <a-layout-sider class="left" :style="{ backgroundColor: token.colorBgLayout }">
          <slot name="left-side-bar"/>
        </a-layout-sider>
        <!-- center -->
        <a-layout-content class="center" :style="{ backgroundColor: token.colorBgContainer }">
          <slot name="ui-center"/>
        </a-layout-content>
        <!-- right -->
        <a-layout-sider class="right" :style="{ backgroundColor: token.colorBgLayout }">
          <slot name="right-side-bar"/>
        </a-layout-sider>
      </a-layout>

      <!-- bottom -->
      <a-layout-footer class="bottom" :style="{ backgroundColor: token.colorBgLayout }"/>
      <slot name="bottom-side-bar"/>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import {theme} from 'ant-design-vue'
import {themeState} from '../../theme'
import {themeMap} from '../../theme/theme'

const {token} = theme.useToken()
</script>

<style scoped>
.root {
  width: 100vw;
  height: 100vh;
}

/* top bar */
.top {
  height: 35px;
  line-height: 35px;
  display: flex;
  align-items: center;
}

/* bottom bar */
.bottom {
  height: 35px;
  padding: 0;
}

/* middle layout */
.body {
  flex: 1;
  min-height: 0;
}

/* side bars */
.left,
.right {
  width: 35px !important;
  min-width: 35px !important;
  max-width: 35px !important;
}

/* center content */
.center {
  padding: 0;
  margin: 0;
  overflow: auto;
}
</style>
