<template>
  <div class="wechat-login">
    <div class="qr-header">
      <ArrowLeftOutlined class="back-icon" @click="$emit('back')" />
      <span>微信扫码登录</span>
    </div>
    <div id="wechat_qr_container" class="qr-container">
      <div v-if="loading" class="qr-loading">
        <a-spin size="large" />
        <p>加载中...</p>
      </div>
    </div>
    <p class="qr-hint">请使用微信扫一扫登录</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { theme } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '../../../stores/auth'
import request from '../../../utils/request'
import { getDeviceId } from '../../../utils/device'

defineEmits(['back'])

const authStore = useAuthStore()
const { token } = theme.useToken()
const loading = ref(true)
const wechatConfig = ref<{ appId?: string; scope?: string }>({})
let pollTimer: number | null = null

// 加载微信配置
async function loadWechatConfig() {
  try {
    const res = await request.get('/auth/third/wechat/info')
    if (res.data.success) {
      wechatConfig.value = {
        appId: res.data.data?.appId,
        scope: res.data.data?.scope,
      }
    }
  } catch (error) {
    console.error('加载微信配置失败:', error)
    wechatConfig.value = {
      appId: 'wx2530a86caf4887b5',
      scope: 'snsapi_login',
    }
  }
}

// 加载微信 JS SDK
function loadWxLoginScript() {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).WxLogin) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('加载微信 JS SDK 失败'))
    document.head.appendChild(script)
  })
}

// 生成随机 state 参数（使用设备 ID）
function generateState() {
  return getDeviceId()
}

// 初始化微信二维码
async function initWechatLogin() {
  await loadWechatConfig()
  await loadWxLoginScript()
  
  const state = generateState()
  sessionStorage.setItem('wechat_login_state', state)
  
  // 销毁旧的二维码
  const container = document.getElementById('wechat_qr_container')
  if (container) {
    container.innerHTML = ''
  }
  
  setTimeout(() => {
    new (window as any).WxLogin({
      self_redirect: false,
      id: 'wechat_qr_container',
      appid: wechatConfig.value.appId || 'wx2530a86caf4887b5',
      scope: wechatConfig.value.scope || 'snsapi_login',
      redirect_uri: encodeURIComponent(window.location.origin + '/auth/wechat/callback'),
      state: state,
      style: 'black',
      href: '',
    })
    loading.value = false
    
    // 开始轮询登录状态
    startPollingLoginStatus()
  }, 100)
}

// 轮询检查登录状态
function startPollingLoginStatus() {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
  
  // 监听 postMessage（从回调窗口）
  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'wechat_login_success') {
      window.removeEventListener('message', handleMessage)
      stopPollingLoginStatus()
      // 重新加载登录状态（会触发 LoginModal 的 watch 跳转）
      authStore.loadFromStorage()
    }
  }
  
  window.addEventListener('message', handleMessage)
  
  // 同时轮询 localStorage（兼容情况）
  pollTimer = window.setInterval(() => {
    const loginSuccess = sessionStorage.getItem('wechat_login_success')
    if (loginSuccess === 'true') {
      sessionStorage.removeItem('wechat_login_success')
      stopPollingLoginStatus()
      authStore.loadFromStorage()
    }
  }, 1000)
}

function stopPollingLoginStatus() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  initWechatLogin()
})

onBeforeUnmount(() => {
  stopPollingLoginStatus()
  const container = document.getElementById('wechat_qr_container')
  if (container) {
    container.innerHTML = ''
  }
})
</script>

<style scoped>

.wechat-login {
  padding: 20px 0;
  text-align: center;
}

.qr-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  position: relative;
}


.back-icon {
  position: absolute;
  left: 0;
  cursor: pointer;
  font-size: 18px;
  color: v-bind('token.colorTextSecondary');
  transition: color 0.3s;
}


.back-icon:hover {
  color: v-bind('token.colorPrimary');
}

.qr-container {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.qr-loading {
  text-align: center;
}


.qr-loading p {
  margin-top: 16px;
  color: v-bind('token.colorTextSecondary');
}


.qr-hint {
  color: v-bind('token.colorTextTertiary');
  font-size: 14px;
}
</style>
