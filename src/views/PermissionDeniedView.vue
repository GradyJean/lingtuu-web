<script setup lang="ts">
import {theme} from 'ant-design-vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const {token} = theme.useToken()

function handleBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/')
}

function handleHome() {
  void router.push('/')
}
</script>

<template>
  <div class="permission-denied">
    <h1 class="permission-denied__title">无权限访问</h1>
    <p class="permission-denied__description">
      当前账号没有访问该页面的权限, 如需继续，请联系管理员开通对应权限。
    </p>
    <div class="permission-denied__actions">
      <a-button @click="handleBack">返回上一页</a-button>
      <a-button type="primary" @click="handleHome">回到首页</a-button>
    </div>
  </div>
</template>

<style scoped>
.permission-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px;
  text-align: center;
  color: v-bind('token.colorText');
}

.permission-denied__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.permission-denied__description {
  margin: 12px 0 0;
  color: v-bind('token.colorTextSecondary');
}

.permission-denied__path {
  margin: 8px 0 0;
  color: v-bind('token.colorTextTertiary');
  word-break: break-all;
}

.permission-denied__actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
</style>
