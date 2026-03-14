<template>
  <a-config-provider :theme="themeMap[themeState.mode]">
    <a-layout class="root">
      <!-- top -->
      <a-layout-header class="header">
        <slot name="header"/>
      </a-layout-header>

      <a-layout class="main">
        <!-- left -->
        <a-layout-sider class="left">
          <slot name="left-side"/>
        </a-layout-sider>
        <!-- center -->
        <a-layout-content class="center">
          <slot name="main"/>
        </a-layout-content>
        <!-- right -->
        <a-layout-sider class="right">
          <slot name="right-side"/>
        </a-layout-sider>
      </a-layout>

      <!-- bottom -->
      <a-layout-footer class="footer">
        <slot name="footer"/>
      </a-layout-footer>
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
:deep(.ant-layout-header),
:deep(.ant-layout-sider),
:deep(.ant-layout-content),
:deep(.ant-layout-footer),
:deep(.main) {
  background: transparent !important;
}

.root {
  width: 100vw;
  height: 100vh;
  /* noinspection CssUnresolvedCustomProperty */
  background: v-bind('token.colorBgLayout');
}

/* top bar */
/* noinspection CssUnresolvedCustomProperty */
.header {
  height: 70px;
  line-height: 70px;
  display: flex;
  align-items: center;
  padding: 0;
  position: relative;
  z-index: 10;
  background: v-bind('token.colorBgLayout');
}

/* bottom bar */
.footer {
  height: 35px;
  padding: 0;
  /* noinspection CssUnresolvedCustomProperty */
  background: v-bind('token.colorBgLayout');
}

/* middle layout */
.main {
  flex: 1;
  min-height: 0;
  /* noinspection CssUnresolvedCustomProperty */
  background: v-bind('token.colorBgContainer');
}

/* side bars */
.left,
.right {
  width: 35px !important;
  min-width: 35px !important;
  max-width: 35px !important;
  /* noinspection CssUnresolvedCustomProperty */
  background: v-bind('token.colorBgLayout');
}

/* center content */
.center {
  padding: 0;
  margin: 0;
  overflow: auto;
  /* noinspection CssUnresolvedCustomProperty */
  background: v-bind('token.colorBgLayout');
}
</style>
