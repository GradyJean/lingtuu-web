<template>
  <div class="wechat-callback">
    <a-result :status="status" :title="title" :sub-title="subtitle">
      <template #extra>
        <a-button v-if="status === 'success'" type="primary" @click="handleClose">
          关闭页面
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@stores/auth.ts'
import {loginWithWechat} from '@api/auth/auth.ts'

const route = useRoute()
const authStore = useAuthStore()

const status = ref<'success' | 'error'>('success')
const title = ref('登录中...')
const subtitle = ref('请稍候')
const isProcessing = ref(false)

onMounted(async () => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    const { code, state } = route.query

    if (!code) {
      status.value = 'error'
      title.value = '登录失败'
      subtitle.value = '未获取到授权码'
      return
    }

    // 防止重复处理同一个 code
    const processedCode = sessionStorage.getItem('wechat_processed_code')
    if (processedCode === code) {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: 'wechat_login_success' }, '*')
      }
      status.value = 'success'
      title.value = '登录成功'
      subtitle.value = '正在关闭...'
      setTimeout(() => handleClose(), 2000)
      return
    }

    sessionStorage.setItem('wechat_processed_code', String(code))

    const { access_token, refresh_token } = await loginWithWechat(String(code), state ? String(state) : undefined)

    authStore.setLoginInfo({
      access_token: {
        token: access_token.token,
        expire_at: access_token.expire_at,
      },
      refresh_token: {
        token: refresh_token.token,
        expire_at: refresh_token.expire_at,
      },
    })

    // 通知主窗口
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'wechat_login_success' }, '*')
    }

    status.value = 'success'
    title.value = '登录成功'
    subtitle.value = '即将关闭页面'
    setTimeout(() => handleClose(), 3000)
  } catch (error: unknown) {
    console.error('微信登录回调失败:', error)
    status.value = 'error'
    title.value = '登录失败'
    subtitle.value = error instanceof Error ? error.message : '网络错误，请稍后重试'
  }
})

function handleClose() {
  window.close()
}
</script>

<style scoped>
.wechat-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
