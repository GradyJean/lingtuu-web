<template>
  <AppLayout>
    <!-- 左侧边栏 -->
    <template #left-sidebar>
      <div class="sidebar-content">
        <div class="logo">
          <h2>🐸 蛙蛙写作</h2>
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
            <a-menu-item key="/write">
              <template #icon><EditOutlined /></template>
              <span>小说写作</span>
            </a-menu-item>
            <a-menu-item key="/script">
              <template #icon><FileTextOutlined /></template>
              <span>剧本写作</span>
            </a-menu-item>
            <a-menu-item key="/video">
              <template #icon><VideoCameraOutlined /></template>
              <span>漫剧视频</span>
            </a-menu-item>
            <a-menu-item key="/course">
              <template #icon><RocketOutlined /></template>
              <span>蛙蛙课堂 <span class="new-tag">New</span></span>
            </a-menu-item>
          </a-menu>
        </nav>
      </div>
    </template>

    <!-- 顶部 Header -->
    <template #header>
      <div class="header-content">
        <div class="header-left">
          <!-- 可放置面包屑或其他导航 -->
        </div>
        <div class="header-right">
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
    </template>

    <!-- 主内容区域 -->
    <template #main>
      <div class="content-wrapper">
        <router-view />
      </div>
    </template>

    <!-- 底部 -->
    <template #footer>
      <div class="footer-content">
        <p>© 2024 公司名称 - 京 ICP 备 XXXXXXXX 号</p>
      </div>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeOutlined,
  FileOutlined,
  EditOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  RocketOutlined,
  BellOutlined,
} from '@ant-design/icons-vue'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'

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
.sidebar-content {
  padding: 20px 0;
}

.logo {
  padding: 0 24px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  color: #52c41a;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu :deep(.ant-menu-item) {
  margin: 4px 16px;
  padding: 0 12px !important;
  border-radius: 4px;
}

.sidebar-menu :deep(.ant-menu-item-selected) {
  background: #f6ffed;
}

.sidebar-menu :deep(.ant-menu-item a) {
  color: #333;
  text-decoration: none;
}

.sidebar-menu :deep(.ant-menu-item .anticon) {
  font-size: 16px;
  color: #666;
}

.sidebar-menu :deep(.ant-menu-item-selected .anticon) {
  color: #52c41a;
}

.new-tag {
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 12px;
  color: #fff;
  background: #52c41a;
  border-radius: 4px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 18px;
  cursor: pointer;
  color: #666;
  position: relative;
}

.header-icon:hover {
  color: #52c41a;
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

.content-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 100%;
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
