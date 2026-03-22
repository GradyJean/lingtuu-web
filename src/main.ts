import {createApp} from 'vue'
import {createPinia} from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './assets/base.css'
import App from './App.vue'
import router from './router'
import {useAuthStore} from './stores/auth'
import {setTheme} from "./theme";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
authStore.loadFromStorage()

app.use(router)
app.use(Antd)

app.mount('#app')

// 设置主题
setTheme('system')
