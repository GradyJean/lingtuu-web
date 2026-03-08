<script setup lang="ts">
import {theme} from 'ant-design-vue'

const {token} = theme.useToken()
</script>

<template>
  <div class="bottom-side" :style="{
      '--panel-bg': token.colorBgContainer,
      '--panel-border': token.colorBorderSecondary,
      '--panel-text': token.colorText,
      '--panel-text-secondary': token.colorTextSecondary,
      '--panel-scrollbar': token.colorTextQuaternary,
      '--panel-scrollbar-hover': token.colorTextTertiary
    }">
    <span>© 阡陌科创（北京）技术有限公司</span>
    <span class="separator">|</span>
    <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">
      京ICP备2025128148号
    </a>
  </div>
</template>

<style scoped>
/* noinspection CssUnresolvedCustomProperty */
.bottom-side {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--panel-text-secondary);
}

.separator {
  margin-left: 5px;
  margin-right: 5px;
}

/* noinspection CssUnresolvedCustomProperty */
a {
  color: var(--panel-text-secondary);
}
</style>
