<script setup lang="ts">
import {UserOutlined, LogoutOutlined} from '@ant-design/icons-vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../stores/auth'
import {theme} from 'ant-design-vue'

const {token} = theme.useToken()
const router = useRouter()
const authStore = useAuthStore()

function handleMenuClick({key}: { key: string }) {
  if (key === 'profile') {
    router.push('/profile')
  } else if (key === 'logout') {
    authStore.logout()
    router.push('/')
  }
}
</script>

<template>
  <div class="header-bar" :style="{
      '--header-hover': token.colorBorderSecondary,
    }">
    <div class="header-left">
      <!-- 预留位置 -->
    </div>
    <div class="header-right">
      <a-dropdown>
        <span class="user-dropdown">
          <UserOutlined style="font-size: 18px;"/>
        </span>
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="profile">
              <template #icon>
                <UserOutlined/>
              </template>
              个人中心
            </a-menu-item>
            <a-menu-item key="logout">
              <template #icon>
                <LogoutOutlined/>
              </template>
              退出登录
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 18px;
  width: 100%;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  transition: background-color 0.3s;
}

/* noinspection CssUnresolvedCustomProperty */
.user-dropdown:hover {
  background-color: var(--header-hover);
}
</style>