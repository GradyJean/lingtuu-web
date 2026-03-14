<template>
  <a-layout class="root">
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
import PanelContainer from "@components/container/PanelContainer.vue";
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

  background: v-bind('token.colorBgLayout');
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

  background: v-bind('token.colorBgLayout');
}

.left {
  padding: 0 5px 0 10px;
  width: 200px !important;
  min-width: 200px !important;
  max-width: 200px !important;

  background: v-bind('token.colorBgLayout');
}

/* bottom bar */
.footer {
  height: 35px;
  padding: 0;

  background: v-bind('token.colorBgLayout');
}

/* middle layout */
.main {
  flex: 1;
  min-height: 0;

  background: v-bind('token.colorBgContainer');
}

/* center content */
.center {
  padding: 0 10px 0 5px;
  margin: 0;

  background: v-bind('token.colorBgLayout');
}
</style>
