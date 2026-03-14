<script setup lang="ts">
import {theme} from 'ant-design-vue'

const {token} = theme.useToken()
</script>

<template>
  <div class="bottom-side">
    <span>© 阡陌科创（北京）技术有限公司</span>
    <span class="separator">|</span>
    <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank">
      京ICP备2025128148号
    </a>
  </div>
</template>

<style scoped>

.bottom-side {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: v-bind('token.colorTextSecondary');
}

.separator {
  margin-left: 5px;
  margin-right: 5px;
}


a {
  color: v-bind('token.colorTextSecondary');
}
</style>
