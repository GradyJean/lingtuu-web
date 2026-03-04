<template>
  <a-config-provider :theme="themeMap[themeState.mode]">
    <a-layout class="root"
              :style="{
      '--panel-bg': token.colorBgContainer,
      '--panel-border': token.colorBorderSecondary,
      '--panel-text': token.colorText,
      '--panel-scrollbar': token.colorTextQuaternary,
      '--panel-scrollbar-hover': token.colorTextTertiary
    }"
    >
      <!-- top -->
      <a-layout-header class="top">
        <slot name="top-side-bar"/>
      </a-layout-header>

      <a-layout class="body">
        <!-- left -->
        <a-layout-sider class="left">
          <slot name="left-side-bar"/>
        </a-layout-sider>
        <!-- center -->
        <a-layout-content class="center">
          <slot name="ui-center"/>
        </a-layout-content>
        <!-- right -->
        <a-layout-sider class="right">
          <slot name="right-side-bar"/>
        </a-layout-sider>
      </a-layout>

      <!-- bottom -->
      <a-layout-footer class="bottom"/>
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
  height: 70px;
  line-height: 70px;
  display: flex;
  align-items: center;
  padding: 0;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 2px rgba(120, 96, 72, 0.12);
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
