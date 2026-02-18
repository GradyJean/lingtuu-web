<template>
  <div class="works-page">
    <div class="page-header">
      <h1 class="page-title">我的作品</h1>
      
      <div class="header-actions">
        <!-- 分类标签 -->
        <a-tabs v-model:activeKey="activeCategory" class="category-tabs">
          <a-tab-pane key="all" tab="全部" />
          <a-tab-pane key="short" tab="短篇" />
          <a-tab-pane key="long" tab="长篇" />
          <a-tab-pane key="script" tab="剧本" />
          <a-tab-pane key="video" tab="视频" />
        </a-tabs>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <a-button type="primary" ghost>
            <template #icon><PlusOutlined /></template>
            创建作品
          </a-button>
          <a-button>
            <template #icon><ImportOutlined /></template>
            导入
          </a-button>
        </div>

        <!-- 视图切换 -->
        <a-radio-group v-model:value="viewMode" class="view-toggle">
          <a-radio-button value="grid">
            <AppstoreOutlined />
          </a-radio-button>
          <a-radio-button value="list">
            <UnorderedListOutlined />
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>

    <!-- 作品列表 -->
    <div class="works-list-wrapper">
      <div v-if="viewMode === 'grid'" class="works-grid">
        <a-card
        v-for="item in worksList"
        :key="item.id"
        class="work-card"
        hoverable
      >
        <template #title>
          <a-tag :color="item.type === 'long' ? 'green' : 'blue'" size="small">
            {{ item.typeLabel }}
          </a-tag>
          <span class="work-title">{{ item.title }}</span>
        </template>
        
        <div class="work-content">
          <!-- 内容区域 -->
        </div>
        
        <template #actions>
          <span>
            <ClockCircleOutlined />
            {{ item.updateTime }}
          </span>
        </template>
        
        <div class="work-footer">
          <a-space>
            <a-button size="small">
              <template #icon><VideoCameraOutlined /></template>
              生成视频
            </a-button>
            <a-button size="small">
              <template #icon><FileTextOutlined /></template>
              转为剧本
            </a-button>
            <a-dropdown>
              <a class="ant-dropdown-link" @click.prevent>
                <EllipsisOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit">编辑</a-menu-item>
                  <a-menu-item key="delete">删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-card>
    </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <a-pagination v-model:current="currentPage" :total="100" :page-size="20" show-size-changer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  PlusOutlined,
  ImportOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  EllipsisOutlined,
} from '@ant-design/icons-vue'

const activeCategory = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)

// 模拟数据
const worksList = ref([
  {
    id: 1,
    title: '示例作品 1',
    type: 'long',
    typeLabel: '长篇',
    updateTime: '2024-02-16 15:42:41',
  },
  {
    id: 2,
    title: '示例作品 2',
    type: 'short',
    typeLabel: '短篇',
    updateTime: '2024-02-15 20:26:35',
  },
])
</script>

<style scoped>
.works-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.category-tabs {
  flex: 1;
  min-width: 300px;
}

.category-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}

.category-tabs :deep(.ant-tabs-tab) {
  padding: 8px 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.view-toggle {
  margin-left: auto;
}

.works-list-wrapper {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 作品列表 */
.works-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.work-card {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.work-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.work-card :deep(.ant-card-head) {
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  min-height: 48px;
  padding: 12px 16px;
}

.work-title {
  margin-left: 8px;
  font-weight: 500;
  font-size: 15px;
}

.work-content {
  height: 240px;
  background: #f5f5f5;
  border-radius: 4px;
  margin: 12px 0;
}

.work-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-footer .ant-space {
  display: flex;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 24px;
}
</style>
