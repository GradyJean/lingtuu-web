import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

// 恢复登录状态 - 在 mount 之后调用，确保 Pinia 完全初始化
app.mount('#app')

// 在应用挂载后再加载登录状态
const authStore = useAuthStore()
authStore.loadFromStorage()
