<template>
  <div
      v-if="shouldShowLogin"
      class="login-modal"
  >
    <div class="modal-mask"></div>
    <div class="modal-container">
      <a-card :title="cardTitle" class="login-card">
        <!-- 登录表单 -->
        <div v-if="currentView === 'login' && !showWechat" class="form-container">
          <a-form :model="loginForm" layout="vertical" @finish="handleLogin">
            <a-form-item
                name="identifier"
                label="手机号/邮箱"
                :rules="[{ required: true, message: '请输入手机号或邮箱' }]"
            >
              <a-input
                  v-model:value="loginForm.identifier"
                  placeholder="请输入手机号或邮箱"
                  size="large"
              >
                <template #prefix>
                  <UserOutlined/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
                v-if="!loginForm.verify_code_login"
                name="credential"
                label="密码"
                :rules="[
                { required: !loginForm.verify_code_login, message: '请输入密码' }
              ]"
            >
              <a-input-password
                  v-model:value="loginForm.credential"
                  placeholder="请输入密码"
                  size="large"
              >
                <template #prefix>
                  <LockOutlined/>
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item v-if="loginForm.verify_code_login">
              <a-row :gutter="8">
                <a-col :span="16">
                  <a-form-item
                      name="verify_code"
                      :rules="[{ required: true, message: '请输入验证码' }]"
                  >
                    <a-input
                        v-model:value="loginForm.verify_code"
                        placeholder="验证码"
                        size="large"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-button
                      :loading="sendingCode"
                      :disabled="!canSendCode || countdown > 0"
                      @click="sendverify_code"
                      size="large"
                      block
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item>
              <a-checkbox v-model:checked="loginForm.verify_code_login">
                验证码登录
              </a-checkbox>
              <a class="forgot-password" @click="switchView('forgot')">
                忘记密码？
              </a>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="loggingIn" block size="large">
                登录
              </a-button>
            </a-form-item>

            <div class="form-footer">
              <span>还没有账号？</span>
              <a @click="switchView('register')">立即注册</a>
            </div>
          </a-form>

          <!-- 第三方登录 -->
          <div v-if="thirdPlatforms.length > 0" class="third-login">
            <a-divider>其他登录方式</a-divider>
            <div class="third-icons">
              <div
                  v-for="platform in thirdPlatforms"
                  :key="platform.platform"
                  class="third-icon-wrapper"
                  @click="handleShowWechat"
              >
                <a class="third-icon">
                  <component :is="getPlatformIcon(platform.platform)" :style="{ fontSize: '24px' }"/>
                </a>
                <span class="platform-name">{{ platform.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 微信登录 -->
        <WechatLogin v-else-if="showWechat" @back="closeWechat"/>

        <!-- 注册表单 -->
        <div v-else-if="currentView === 'register'" class="form-container">
          <a-form :model="registerForm" layout="vertical" @finish="handleRegister">
            <a-form-item
                name="identifier"
                label="手机号/邮箱"
                :rules="[{ required: true, message: '请输入手机号或邮箱' }]"
            >
              <a-input
                  v-model:value="registerForm.identifier"
                  placeholder="请输入手机号或邮箱"
                  size="large"
                  @blur="checkIdentifierExists"
              >
                <template #prefix>
                  <UserOutlined/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
                name="credential"
                label="密码"
                :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 位' }
              ]"
            >
              <a-input-password
                  v-model:value="registerForm.credential"
                  placeholder="请输入密码"
                  size="large"
              >
                <template #prefix>
                  <LockOutlined/>
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item
                name="confirmPassword"
                label="确认密码"
                :rules="[
                { required: true, message: '请确认密码' },
                { validator: validateConfirmPassword }
              ]"
            >
              <a-input-password
                  v-model:value="registerForm.confirmPassword"
                  placeholder="请确认密码"
                  size="large"
              >
                <template #prefix>
                  <LockOutlined/>
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-row :gutter="8">
                <a-col :span="16">
                  <a-form-item
                      name="verify_code"
                      :rules="[{ required: true, message: '请输入验证码' }]"
                  >
                    <a-input
                        v-model:value="registerForm.verify_code"
                        placeholder="验证码"
                        size="large"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-button
                      :loading="sendingCode"
                      :disabled="!canSendCode || countdown > 0"
                      @click="sendverify_code"
                      size="large"
                      block
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="registering" block size="large">
                注册
              </a-button>
            </a-form-item>

            <div class="form-footer">
              <span>已有账号？</span>
              <a @click="switchView('login')">立即登录</a>
            </div>
          </a-form>
        </div>

        <!-- 找回密码表单 -->
        <div v-else-if="currentView === 'forgot'" class="form-container">
          <a-form :model="forgotForm" layout="vertical" @finish="handleForgotPassword">
            <a-form-item
                name="identifier"
                label="手机号/邮箱"
                :rules="[{ required: true, message: '请输入手机号或邮箱' }]"
            >
              <a-input
                  v-model:value="forgotForm.identifier"
                  placeholder="请输入绑定的手机号或邮箱"
                  size="large"
              >
                <template #prefix>
                  <UserOutlined/>
                </template>
              </a-input>
            </a-form-item>

            <a-form-item
                name="credential"
                label="新密码"
                :rules="[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少 6 位' }
              ]"
            >
              <a-input-password
                  v-model:value="forgotForm.credential"
                  placeholder="请输入新密码"
                  size="large"
              >
                <template #prefix>
                  <LockOutlined/>
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item>
              <a-row :gutter="8">
                <a-col :span="16">
                  <a-form-item
                      name="verify_code"
                      :rules="[{ required: true, message: '请输入验证码' }]"
                  >
                    <a-input
                        v-model:value="forgotForm.verify_code"
                        placeholder="验证码"
                        size="large"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-button
                      :loading="sendingCode"
                      :disabled="!canSendCode || countdown > 0"
                      @click="sendverify_code"
                      size="large"
                      block
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="resetting" block size="large">
                重置密码
              </a-button>
            </a-form-item>

            <div class="form-footer">
              <a @click="switchView('login')">返回登录</a>
            </div>
          </a-form>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted, watch} from 'vue'
import {message, theme} from 'ant-design-vue'
import {UserOutlined, LockOutlined, WechatOutlined, AlipayOutlined} from '@ant-design/icons-vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuthStore} from '../../stores/auth.ts'
import request from '../../utils/request.ts'
import WechatLogin from './wechat/WechatLogin.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const {token} = theme.useToken()

// 判断是否显示登录框：未登录 且 当前路由需要认证
const shouldShowLogin = computed(() => {
  return !authStore.isLoggedIn && route.meta.requiresAuth !== false
})

// 当前视图：login | register | forgot
const currentView = ref<'login' | 'register' | 'forgot'>('login')
// 是否显示微信登录
const showWechat = ref(false)

// 表单数据
const loginForm = reactive({
  identifier: '',
  credential: '',
  verify_code_login: false,
  verify_code: '',
})

const registerForm = reactive({
  identifier: '',
  credential: '',
  confirmPassword: '',
  verify_code: '',
})

const forgotForm = reactive({
  identifier: '',
  credential: '',
  verify_code: '',
})

// 状态
const loggingIn = ref(false)
const registering = ref(false)
const resetting = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const canSendCode = ref(false)
const thirdPlatforms = ref<Array<{ name: string; platform: string }>>([])

// 卡片标题
const cardTitle = computed(() => {
  if (currentView.value === 'login' && !showWechat.value) return '用户登录'
  if (currentView.value === 'register') return '用户注册'
  if (currentView.value === 'forgot') return '找回密码'
  return ''
})

// 加载第三方平台列表
async function loadThirdPlatforms() {
  try {
    const res = await request.get('/auth/third/platforms')
    if (res.data.success) {
      thirdPlatforms.value = res.data.data || []
    }
  } catch (error) {
    console.error('加载第三方平台失败:', error)
  }
}

// 切换视图
function switchView(view: 'login' | 'register' | 'forgot') {
  currentView.value = view
  showWechat.value = false
  // 清空表单
  Object.assign(loginForm, {identifier: '', credential: '', verify_code_login: false, verify_code: ''})
  Object.assign(registerForm, {identifier: '', credential: '', confirmPassword: '', verify_code: ''})
  Object.assign(forgotForm, {identifier: '', credential: '', verify_code: ''})
}

// 显示微信登录
function handleShowWechat() {
  showWechat.value = true
  // 保存当前路径，登录成功后跳转回去
  sessionStorage.setItem('login_redirect_from', route.fullPath)
}

// 关闭微信登录
function closeWechat() {
  showWechat.value = false
}

// 检查标识符格式（手机号/邮箱）
function checkIdentifierFormat(identifier: string): 'PHONE_NUMBER' | 'EMAIL' | null {
  const phoneRegex = /^1[3-9]\d{9}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (phoneRegex.test(identifier)) return 'PHONE_NUMBER'
  if (emailRegex.test(identifier)) return 'EMAIL'
  return null
}

// 检查是否可以发送验证码
watch(() => [loginForm.identifier, registerForm.identifier, forgotForm.identifier], () => {
  const identifier = loginForm.identifier || registerForm.identifier || forgotForm.identifier
  canSendCode.value = !!checkIdentifierFormat(identifier)
}, {immediate: true})

// 发送验证码
async function sendverify_code() {
  const identifier = loginForm.identifier || registerForm.identifier || forgotForm.identifier
  const identifierType = checkIdentifierFormat(identifier)

  if (!identifierType) {
    message.warning('请输入正确的手机号或邮箱')
    return
  }

  sendingCode.value = true
  try {
    const res = await request.post('/auth/verifyCode/send', {
      identifier,
      identifierType,
    })

    if (res.data.success) {
      message.success('验证码已发送')
      // 倒计时
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      message.error(res.data.message || '发送失败')
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '发送失败')
  } finally {
    sendingCode.value = false
  }
}

// 检查标识符是否存在（注册用）
async function checkIdentifierExists() {
  const identifier = registerForm.identifier
  if (!identifier) return

  const identifierType = checkIdentifierFormat(identifier)
  if (!identifierType) return

  try {
    const res = await request.get('/auth/identifier/exists', {
      params: {identifier},
    })

    if (res.data.success && res.data.data) {
      message.warning('该账号已注册')
    }
  } catch (error) {
    console.error('检查标识符失败:', error)
  }
}

// 验证确认密码
function validateConfirmPassword(_rule: any, value: string) {
  if (value && value !== registerForm.credential) {
    return Promise.reject('两次密码不一致')
  }
  return Promise.resolve()
}

// 登录
async function handleLogin() {
  loggingIn.value = true
  try {
    const identifierType = checkIdentifierFormat(loginForm.identifier)

    const res = await request.post('/auth/login', {
      identifier: loginForm.identifier,
      credential: loginForm.credential,
      verify_code_login: loginForm.verify_code_login,
      verify_code: loginForm.verify_code_login ? loginForm.verify_code : undefined,
      identifierType,
    })
    if (res.data.success) {
      const tokenData = res.data.data
      authStore.setLoginInfo({
        access_token: {
          token: tokenData.access_token.token,
          expire_at: tokenData.access_token.expire_at,
        },
        refresh_token: {
          token: tokenData.refresh_token.token,
          expire_at: tokenData.refresh_token.expire_at,
        },
      })
      message.success('登录成功')
    } else {
      message.error(res.data.message || '登录失败')
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '登录失败')
  } finally {
    loggingIn.value = false
  }
}

// 注册
async function handleRegister() {
  registering.value = true
  try {
    const identifierType = checkIdentifierFormat(registerForm.identifier)

    const res = await request.post('/auth/register', {
      identifier: registerForm.identifier,
      credential: registerForm.credential,
      verify_code: registerForm.verify_code,
      identifierType,
    })

    if (res.data.success) {
      message.success('注册成功')
      switchView('login')
    } else {
      message.error(res.data.message || '注册失败')
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '注册失败')
  } finally {
    registering.value = false
  }
}

// 找回密码
async function handleForgotPassword() {
  resetting.value = true
  try {
    const identifierType = checkIdentifierFormat(forgotForm.identifier)

    const res = await request.post('/auth/credential/reset', {
      identifier: forgotForm.identifier,
      credential: forgotForm.credential,
      verify_code: forgotForm.verify_code,
      identifierType,
    })

    if (res.data.success) {
      message.success('密码重置成功')
      switchView('login')
    } else {
      message.error(res.data.message || '重置失败')
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || '重置失败')
  } finally {
    resetting.value = false
  }
}

// 获取平台图标
function getPlatformIcon(platform: string) {
  const iconMap: Record<string, any> = {
    wechat: WechatOutlined,
    alipay: AlipayOutlined,
  }
  return iconMap[platform] || WechatOutlined
}

// 监听登录状态，已登录则关闭登录框并跳转
watch(() => authStore.isLoggedIn, (newVal) => {
  if (newVal) {
    const redirect = sessionStorage.getItem('login_redirect_from') || '/'
    sessionStorage.removeItem('login_redirect_from')

    showWechat.value = false
    currentView.value = 'login'

    // 跳转到原页面
    if (redirect !== route.fullPath) {
      router.push(redirect)
    }
  }
})

onMounted(() => {
  loadThirdPlatforms()
})
</script>

<style scoped>
/* noinspection CssUnresolvedCustomProperty */
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* noinspection CssUnresolvedCustomProperty */
.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: v-bind('token.colorBgMask');
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  z-index: 10000;
}

.login-card {
  border-radius: v-bind('`${token.borderRadiusSM}px`');
  width: 400px;
}

.login-card :deep(.ant-card-head) {
  border-top-left-radius: v-bind('`${token.borderRadiusSM}px`');
  border-top-right-radius: v-bind('`${token.borderRadiusSM}px`');
}

.login-card :deep(.ant-card-body) {
  border-bottom-left-radius: v-bind('`${token.borderRadiusSM}px`');
  border-bottom-right-radius: v-bind('`${token.borderRadiusSM}px`');
}

.login-card :deep(.ant-input),
.login-card :deep(.ant-input-affix-wrapper),
.login-card :deep(.ant-input-group-addon),
.login-card :deep(.ant-btn) {
  border-radius: v-bind('`${token.borderRadiusSM}px`');
}

.login-card :deep(.ant-input-search-button) {
  border-radius: v-bind('`${token.borderRadiusSM}px`');
}

.form-container {
  padding: 10px 0;
}

.forgot-password {
  float: right;
}

/* noinspection CssUnresolvedCustomProperty */
.form-footer {
  text-align: center;
  margin-top: 16px;
  color: v-bind('token.colorTextSecondary');
}

.form-footer a {
  margin-left: 8px;
}

.third-login {
  margin-top: 24px;
}

.third-icons {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.third-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

/* noinspection CssUnresolvedCustomProperty */
.third-icon {
  color: v-bind('token.colorTextSecondary');
  transition: color 0.3s;
}

/* noinspection CssUnresolvedCustomProperty */
.third-icon:hover {
  color: v-bind('token.colorPrimary');
}

/* noinspection CssUnresolvedCustomProperty */
.platform-name {
  margin-top: 8px;
  font-size: 12px;
  color: v-bind('token.colorTextSecondary');
}
</style>
