<template>
  <a-layout class="root" :style="{
      '--layout-bg': token.colorBgLayout,
      '--layout-bg-container': token.colorBgContainer,
      '--layout-border': token.colorBorderSecondary,
      '--layout-text': token.colorText,
      '--layout-scrollbar': token.colorTextQuaternary,
      '--layout-scrollbar-hover': token.colorTextTertiary
    }">
    <!-- top -->
    <a-layout-header class="header">
      <slot name="header"/>
    </a-layout-header>

    <a-layout class="main">
      <!-- left -->
      <a-layout-sider class="left">
        <PanelContainer>
          <slot name="left-side"/>
        </PanelContainer>
      </a-layout-sider>
      <!-- center -->
      <a-layout-content class="center">
        <PanelContainer>
          <slot name="main"/>
        </PanelContainer>
      </a-layout-content>
    </a-layout>

    <!-- bottom -->
    <a-layout-footer class="footer">
      <slot name="footer"/>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import PanelContainer from "../container/PanelContainer.vue";
import {theme} from 'ant-design-vue'
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
  background: var(--layout-bg);
}

/* top bar */
.header {
  height: 70px;
  line-height: 70px;
  display: flex;
  align-items: center;
  padding: 0;
  position: relative;
  z-index: 10;
  /* noinspection CssUnresolvedCustomProperty */
  background: var(--layout-bg);
}

.left {
  padding: 0 5px 0 10px;
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;
  /* noinspection CssUnresolvedCustomProperty */
  background: var(--layout-bg);
}

/* bottom bar */
.bottom {
  height: 35px;
  padding: 0;
  /* noinspection CssUnresolvedCustomProperty */
  background: var(--layout-bg);
}

/* middle layout */
.main {
  flex: 1;
  min-height: 0;
  /* noinspection CssUnresolvedCustomProperty */
  background: var(--layout-bg-container);
}

/* center content */
.center {
  padding: 0 10px 0 5px;
  margin: 0;
  /* noinspection CssUnresolvedCustomProperty */
  background: var(--layout-bg);
}
</style>
