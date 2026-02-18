<template>
  <div class="app-layout">
    <!-- 左侧边栏 -->
    <aside class="left-sidebar">
      <slot name="left-sidebar">
        <!-- 默认内容，可被覆盖 -->
        <div class="sidebar-content">
          <div class="logo">
            <h2>Logo</h2>
          </div>
          <nav class="sidebar-menu">
            <a-menu mode="vertical" :selected-keys="[currentRoute]">
              <a-menu-item key="/">
                <template #icon><HomeOutlined /></template>
                <router-link to="/">首页</router-link>
              </a-menu-item>
              <a-menu-item key="/works">
                <template #icon><FileOutlined /></template>
                <router-link to="/works">我的作品</router-link>
              </a-menu-item>
            </a-menu>
          </nav>
        </div>
      </slot>
    </aside>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部 Header -->
      <header class="top-header">
        <slot name="header">
          <!-- 默认内容，可被覆盖 -->
          <div class="header-content">
            <div class="header-left">
              <!-- 左侧操作区 -->
            </div>
            <div class="header-right">
              <!-- 右侧用户区 -->
              <a-space>
                <a-badge count="5">
                  <BellOutlined class="header-icon" />
                </a-badge>
                <a-dropdown>
                  <a class="user-info" @click.prevent>
                    <a-avatar :size="32" icon="user" />
                    <span class="username">用户名</span>
                  </a>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="profile">个人中心</a-menu-item>
                      <a-menu-item key="settings">设置</a-menu-item>
                      <a-menu-divider />
                      <a-menu-item key="logout" @click="handleLogout">退出登录</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </a-space>
            </div>
          </div>
        </slot>
      </header>

      <!-- 主内容区域 -->
      <main class="main-content">
        <slot name="main">
          <!-- 默认内容，可被覆盖 -->
          <div class="content-wrapper">
            <router-view />
          </div>
        </slot>
      </main>

      <!-- 底部 -->
      <footer class="bottom-footer">
        <slot name="footer">
          <!-- 默认内容，可被覆盖 -->
          <div class="footer-content">
            <p>© 2024 公司名称 - 京 ICP 备 XXXXXXXX 号</p>
          </div>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeOutlined, FileOutlined, BellOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentRoute = computed(() => route.path)

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

/* 左侧边栏 */
.left-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  padding: 20px 0;
  flex: 1;
}

.logo {
  padding: 0 24px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
  text-align: center;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  color: #52c41a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu :deep(.ant-menu-item) {
  margin: 4px 8px;
  padding: 0 16px !important;
  border-radius: 8px;
}

.sidebar-menu :deep(.ant-menu-item-selected) {
  background: #e6f7ff;
}

.sidebar-menu :deep(.ant-menu-item a) {
  color: #333;
  text-decoration: none;
}

/* 主内容容器 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #f5f7fa;
}

/* 顶部 Header */
.top-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.header-icon {
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.header-icon:hover {
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  text-decoration: none;
}

.username {
  font-size: 14px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  min-height: 0;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 底部 */
.bottom-footer {
  height: 48px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 0 24px;
  flex-shrink: 0;
  text-align: center;
}

.footer-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.footer-content p {
  margin: 0;
}
</style>
