<template>
  <div class="story-page">
    <!-- 顶部区域 -->
    <div class="story-header">
      <div>
        <h1 class="page-title">我的作品</h1>
      </div>
      <div class="header-right">
        <!-- 右侧预留：用户信息等 -->
      </div>
    </div>

    <!-- 分类标签和操作按钮 -->
    <div class="story-toolbar">
      <div class="category-tabs">
        <span
            class="tab"
            :class="{ active: activeTab === 'ALL' }"
            @click="handleTabClick('ALL')"
        >
          全部
        </span>
        <span
            v-for="(label, key) in StoryType"
            :key="key"
            class="tab"
            :class="{ active: activeTab === key }"
            @click="handleTabClick(key)"
        >
          {{ label }}
        </span>
      </div>
      <div class="action-buttons">
        <a-input-search
            v-model:value="searchTitle"
            placeholder="搜索作品标题"
            class="search-input"
            @search="handleSearch"
            @pressEnter="handleSearch"
        />
        <a-dropdown>
          <a-button type="primary" class="btn-primary">
            <PlusOutlined/>
            创建作品
            <DownOutlined/>
          </a-button>
          <template #overlay>
            <a-menu @click="handleCreate">
              <a-menu-item
                  v-for="(label, key) in StoryType"
                  :key="key"
              >
                {{ label }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button type="primary" class="btn-primary">
          <BookOutlined/>
          拆书
        </a-button>
        <a-button type="primary" class="btn-primary">
          <PlusOutlined/>
          导入
        </a-button>
        <a-button-group class="view-toggle">
          <a-button>
            <AppstoreOutlined/>
          </a-button>
          <a-button>
            <UnorderedListOutlined/>
          </a-button>
        </a-button-group>
      </div>
    </div>

    <!-- 作品列表 -->
    <div class="story-list">
      <div v-for="story in storyList" :key="story.id" class="story-card" @click="handleCardClick(story.id)">
        <div class="card-header">
          <span class="card-tag card-tag--type">{{
              StoryType[story.type as keyof typeof StoryType] || story.type
            }}</span>
          <span class="card-title">{{ story.title }}</span>
        </div>
        <div class="card-body">
          <!-- 内容区域 -->
        </div>
        <div class="card-footer">
          <span class="card-tag card-tag--status">{{
              StoryStatus[story.status as keyof typeof StoryStatus] || story.status
            }}</span>
          <span class="card-date">{{ formatDate(story.created_at) }}</span>
          <div class="card-actions">
            <a-popconfirm
                title="确定要删除这个作品吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(story.id)"
            >
              <a-button size="small" danger>
                <template #icon>
                  <DeleteOutlined/>
                </template>
                删除
              </a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部分页 -->
    <div class="story-pagination">
      <a-pagination
          v-model:current="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          show-size-changer
          @change="fetchStoryList"
          @showSizeChange="fetchStoryList"
      />
    </div>

    <!-- 创建作品弹窗 -->
    <a-modal
        v-model:open="createModalVisible"
        title="创建作品"
        ok-text="确定"
        cancel-text="取消"
        :confirm-loading="submitting"
        @ok="handleCreateSubmit"
    >
      <a-form :model="createForm" layout="vertical">
        <a-form-item label="作品标题" required>
          <a-input v-model:value="createForm.title" placeholder="请输入作品标题"/>
        </a-form-item>
        <a-form-item label="视角" required>
          <a-radio-group v-model:value="createForm.perspective">
            <a-radio value="FIRST">第一人称</a-radio>
            <a-radio value="THIRD">第三人称</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="目标读者" required>
          <a-radio-group v-model:value="createForm.target_reader">
            <a-radio value="FEMALE">女频</a-radio>
            <a-radio value="MALE">男频</a-radio>
            <a-radio value="ALL">通用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {theme} from 'ant-design-vue'
import {
  PlusOutlined,
  BookOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DownOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import {getStoryList, type StoryItem, deleteStory, createStory} from '../api/story'
import router from "../router";

const {token} = theme.useToken()

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const StoryType = {
  SHORT: '短篇',
  LONG: '长篇',
  SCRIPT: '剧本',
  VIDEO: '视频',
}

const StoryStatus = {
  DRAFT: '草稿',
  WRITING: '连载中',
  COMPLETED: '已完结',
}

type StoryTypeKey = keyof typeof StoryType | 'ALL'
const activeTab = ref<StoryTypeKey>('ALL')
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(20)
const storyList = ref<StoryItem[]>([])
const searchTitle = ref('')

// 创建作品弹窗
const createModalVisible = ref(false)
const submitting = ref(false)
const createForm = ref({
  title: '',
  type: '' as 'SHORT' | 'LONG' | 'SCRIPT' | 'VIDEO',
  perspective: 'THIRD' as 'FIRST' | 'THIRD',
  target_reader: 'ALL' as 'FEMALE' | 'MALE' | 'ALL',
})

function handleCardClick(id: string) {
  router.push({name: 'chapter', params: {id}})
}

function openCreateModal(type: 'SHORT' | 'LONG' | 'SCRIPT' | 'VIDEO') {
  createForm.value = {
    title: '',
    type,
    perspective: 'THIRD',
    target_reader: 'ALL',
  }
  createModalVisible.value = true
}

function handleCreateSubmit() {
  if (submitting.value) return

  submitting.value = true

  createStory(createForm.value)
      .then(() => {
        createModalVisible.value = false
        fetchStoryList()
      })
      .catch((error) => {
        console.error('创建作品失败:', error)
      })
      .finally(() => {
        submitting.value = false
      })
}

async function fetchStoryList() {
  try {
    const res = await getStoryList({
      page_num: currentPage.value,
      page_size: pageSize.value,
      title: searchTitle.value,
      type: activeTab.value,
    })
    storyList.value = res.data.data.list
    total.value = res.data.data.total
  } catch (error) {
    console.error('获取故事列表失败:', error)
  }
}

function handleTabClick(key: StoryTypeKey) {
  activeTab.value = key
  currentPage.value = 1
  fetchStoryList()
}

function handleSearch() {
  currentPage.value = 1
  fetchStoryList()
}

async function handleDelete(id: string) {
  try {
    await deleteStory(id)
    // 删除成功后刷新列表
    fetchStoryList()
  } catch (error) {
    console.error('删除故事失败:', error)
  }
}

function handleCreate({key}: { key: string }) {
  openCreateModal(key as 'SHORT' | 'LONG' | 'SCRIPT' | 'VIDEO')
}

onMounted(() => {
  fetchStoryList()
})
</script>

<style scoped>
.story-page {
  padding: 24px;
  min-height: 100%;
}

/* 顶部标题区域 */
.story-header,
.story-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.story-header {
  margin-bottom: 24px;
}

/* noinspection CssUnresolvedCustomProperty */
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: v-bind('token.colorText');
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 工具栏：分类 + 按钮 */
/* noinspection CssUnresolvedCustomProperty */
.story-toolbar {
  padding-bottom: 16px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
  margin-bottom: 24px;
}

.category-tabs {
  display: flex;
  gap: 32px;
}

/* noinspection CssUnresolvedCustomProperty */
.tab {
  font-size: 16px;
  color: v-bind('token.colorTextSecondary');
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

/* noinspection CssUnresolvedCustomProperty */
.tab:hover,
.tab.active {
  color: v-bind('token.colorPrimary');
}

/* noinspection CssUnresolvedCustomProperty */
.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: v-bind('token.colorPrimary');
  border-radius: v-bind('`${token.borderRadiusSM}px`') v-bind('`${token.borderRadiusSM}px`') 0 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 200px;
}

/* noinspection CssUnresolvedCustomProperty */
.btn-primary {
  background: v-bind('token.colorPrimary');
  color: v-bind('token.colorTextLightSolid');
  border-color: v-bind('token.colorPrimary');
}

/* noinspection CssUnresolvedCustomProperty */
.btn-primary:hover {
  background: v-bind('token.colorPrimaryHover') !important;
  border-color: v-bind('token.colorPrimaryHover') !important;
}

.view-toggle :deep(.ant-btn) {
  padding: 4px 8px;
}

/* 作品列表 */
.story-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* noinspection CssUnresolvedCustomProperty */
.story-card {
  background: v-bind('token.colorBgContainer');
  border-radius: v-bind('`${token.borderRadiusSM}px`');
  border: 1px solid v-bind('token.colorBorderSecondary');
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.3s;
  cursor: pointer;
}

/* noinspection CssUnresolvedCustomProperty */
.story-card:hover {
  box-shadow: 0 4px 12px v-bind('token.colorBorderSecondary');
  transform: translateY(-2px);
}

/* noinspection CssUnresolvedCustomProperty */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
}

/* noinspection CssUnresolvedCustomProperty */
.card-tag {
  color: v-bind('token.colorTextLightSolid');
  font-size: 12px;
  padding: 2px 3px;
  border-radius: v-bind('`${token.borderRadiusSM}px`');
}

/* noinspection CssUnresolvedCustomProperty */
.card-tag--status {
  background: v-bind('token.colorPrimary');
}

/* noinspection CssUnresolvedCustomProperty */
.card-tag--type {
  background: v-bind('token.colorWarning');
}

/* noinspection CssUnresolvedCustomProperty */
.card-title {
  font-size: 14px;
  font-weight: 500;
  color: v-bind('token.colorText');
}

/* noinspection CssUnresolvedCustomProperty */
.card-body {
  height: 160px;
  background: v-bind('token.colorBgTextHover');
}

/* noinspection CssUnresolvedCustomProperty */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid v-bind('token.colorBorderSecondary');
}

/* noinspection CssUnresolvedCustomProperty */
.card-date {
  font-size: 12px;
  color: v-bind('token.colorTextSecondary');
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* 分页 */
.story-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
