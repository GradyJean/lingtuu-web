<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {theme, message} from 'ant-design-vue'
import {useRoute} from 'vue-router'
import {
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import {
  createChapter,
  deleteChapter,
  getChapterList,
  updateChapter,
  type ChapterItem,
  type ChapterType,
} from '@api/story/chapter.ts'

interface ChapterTreeItem extends ChapterItem {
  children: ChapterTreeItem[]
  level: number
}

const props = defineProps<{
  storyId?: string
}>()

const emit = defineEmits<{
  select: [chapter: ChapterItem]
}>()

const {token} = theme.useToken()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const keyword = ref('')
const chapterList = ref<ChapterItem[]>([])
const selectedChapterId = ref('')

const createModalOpen = ref(false)
const editModalOpen = ref(false)

const createForm = ref({
  title: '',
  type: 'CHAPTER' as ChapterType,
  parentId: undefined as string | undefined,
})

const editForm = ref({
  id: '',
  title: '',
})

const resolvedStoryId = computed(() => {
  const routeId = route.params.id
  return props.storyId || (typeof routeId === 'string' ? routeId : '')
})

const chapterTypeMap: Record<ChapterType, string> = {
  VOLUME: '卷',
  CHAPTER: '章',
}

const chapterStatusMap: Record<string, string> = {
  DRAFT: '草稿',
  WRITING: '创作中',
  COMPLETED: '已完成',
}

const chapterTree = computed(() => buildChapterTree(chapterList.value))
const flatChapterList = computed(() => flattenChapterTree(chapterTree.value))

function buildChapterTree(list: ChapterItem[]): ChapterTreeItem[] {
  const nodeMap = new Map<string, ChapterTreeItem>()
  const rootList: ChapterTreeItem[] = []

  list.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: [],
      level: 0,
    })
  })

  const sortedNodes = [...nodeMap.values()].sort(sortChapterList)

  sortedNodes.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)?.children.push(node)
      return
    }
    rootList.push(node)
  })

  const walk = (nodes: ChapterTreeItem[], level = 0) => {
    nodes.sort(sortChapterList)
    nodes.forEach((node) => {
      node.level = level
      if (node.children.length > 0) {
        walk(node.children, level + 1)
      }
    })
  }

  walk(rootList)
  return rootList
}

function sortChapterList(a: ChapterItem, b: ChapterItem): number {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER

  if (orderA !== orderB) {
    return orderA - orderB
  }

  return a.createdAt.localeCompare(b.createdAt)
}

function flattenChapterTree(nodes: ChapterTreeItem[]): ChapterTreeItem[] {
  const result: ChapterTreeItem[] = []

  const walk = (items: ChapterTreeItem[]) => {
    items.forEach((item) => {
      result.push(item)
      if (item.children.length > 0) {
        walk(item.children)
      }
    })
  }

  walk(nodes)
  return result
}

async function fetchChapterList() {
  if (!resolvedStoryId.value) return

  loading.value = true
  try {
    const res = await getChapterList({
      storyId: resolvedStoryId.value,
      page: 1,
      size: 500,
      title: keyword.value || undefined,
    })

    chapterList.value = res.list

    if (!res.list.length) {
      selectedChapterId.value = ''
      return
    }

    const currentSelected = res.list.find((item) => item.id === selectedChapterId.value)
    const nextSelected = currentSelected || res.list[0]
    if (!nextSelected) {
      selectedChapterId.value = ''
      return
    }
    selectedChapterId.value = nextSelected.id
    emit('select', nextSelected)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchChapterList()
}

function handleSelect(chapter: ChapterItem) {
  selectedChapterId.value = chapter.id
  emit('select', chapter)
}

function openCreateModal(type: ChapterType, parentId?: string) {
  createForm.value = {
    title: '',
    type,
    parentId,
  }
  createModalOpen.value = true
}

function openEditModal(chapter: ChapterItem) {
  editForm.value = {
    id: chapter.id,
    title: chapter.title,
  }
  editModalOpen.value = true
}

async function handleCreateSubmit() {
  if (!resolvedStoryId.value || submitting.value || !createForm.value.title.trim()) return

  submitting.value = true
  try {
    await createChapter({
      storyId: resolvedStoryId.value,
      parentId: createForm.value.parentId,
      title: createForm.value.title.trim(),
      type: createForm.value.type,
    })
    message.success('章节创建成功')
    createModalOpen.value = false
    await fetchChapterList()
  } finally {
    submitting.value = false
  }
}

async function handleEditSubmit() {
  if (submitting.value || !editForm.value.title.trim()) return

  submitting.value = true
  try {
    await updateChapter({
      id: editForm.value.id,
      title: editForm.value.title.trim(),
    })
    message.success('章节更新成功')
    editModalOpen.value = false
    await fetchChapterList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(chapter: ChapterItem) {
  await deleteChapter(chapter.id)
  message.success('章节删除成功')
  await fetchChapterList()
}

watch(resolvedStoryId, () => {
  fetchChapterList()
}, {immediate: true})
</script>

<template>
  <div class="chapter-list">
    <div class="chapter-list__toolbar">
      <div class="chapter-list__title">
        <span>章节列表</span>
        <a-button type="text" size="small" @click="fetchChapterList">
          <template #icon>
            <ReloadOutlined/>
          </template>
        </a-button>
      </div>
      <a-input-search
        v-model:value="keyword"
        placeholder="搜索章节标题"
        allow-clear
        @search="handleSearch"
        @pressEnter="handleSearch"
      />
      <div class="chapter-list__actions">
        <a-button type="primary" block @click="openCreateModal('VOLUME')">
          <template #icon>
            <FolderAddOutlined/>
          </template>
          新建分卷
        </a-button>
        <a-button block @click="openCreateModal('CHAPTER')">
          <template #icon>
            <FileAddOutlined/>
          </template>
          新建章节
        </a-button>
      </div>
    </div>

    <a-spin :spinning="loading" class="chapter-list__content">
      <div v-if="flatChapterList.length" class="chapter-tree">
        <template v-for="chapter in flatChapterList" :key="chapter.id">
          <div
            class="chapter-node"
            :class="{'chapter-node--active': selectedChapterId === chapter.id}"
            :style="{paddingLeft: `${16 + chapter.level * 18}px`}"
            @click="handleSelect(chapter)"
          >
            <div class="chapter-node__main">
              <div class="chapter-node__title-row">
                <a-tag :bordered="false" class="chapter-node__type-tag">
                  {{ chapterTypeMap[chapter.type] }}
                </a-tag>
                <span class="chapter-node__title">{{ chapter.title }}</span>
              </div>
              <div class="chapter-node__meta">
                <span v-if="chapter.status">{{ chapterStatusMap[chapter.status] || chapter.status }}</span>
                <span v-if="chapter.wordCount">字数 {{ chapter.wordCount }}</span>
              </div>
            </div>
            <div class="chapter-node__actions" @click.stop>
              <a-button type="text" size="small" @click="openCreateModal('CHAPTER', chapter.id)">
                <template #icon>
                  <FileAddOutlined/>
                </template>
              </a-button>
              <a-button type="text" size="small" @click="openEditModal(chapter)">
                <template #icon>
                  <EditOutlined/>
                </template>
              </a-button>
              <a-popconfirm
                title="确定删除这个章节吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(chapter)"
              >
                <a-button type="text" size="small" danger>
                  <template #icon>
                    <DeleteOutlined/>
                  </template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </template>
      </div>
      <a-empty v-else description="暂无章节数据"/>
    </a-spin>

    <a-modal
      v-model:open="createModalOpen"
      :confirm-loading="submitting"
      title="创建章节"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleCreateSubmit"
    >
      <a-form layout="vertical">
        <a-form-item label="章节标题" required>
          <a-input v-model:value="createForm.title" placeholder="请输入章节标题"/>
        </a-form-item>
        <a-form-item label="章节类型" required>
          <a-radio-group v-model:value="createForm.type">
            <a-radio value="VOLUME">分卷</a-radio>
            <a-radio value="CHAPTER">章节</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      v-model:open="editModalOpen"
      :confirm-loading="submitting"
      title="编辑章节"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleEditSubmit"
    >
      <a-form layout="vertical">
        <a-form-item label="章节标题" required>
          <a-input v-model:value="editForm.title" placeholder="请输入章节标题"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.chapter-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: v-bind('token.colorBgContainer');
}

.chapter-list__toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
}

.chapter-list__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: v-bind('token.colorText');
}

.chapter-list__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.chapter-list__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.chapter-tree {
  padding: 8px 0;
}

.chapter-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 56px;
  padding-top: 8px;
  padding-right: 12px;
  padding-bottom: 8px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.chapter-node:hover {
  background: v-bind('token.controlItemBgHover');
}

.chapter-node--active {
  background: v-bind('token.controlItemBgActive');
  border-left-color: v-bind('token.colorPrimary');
}

.chapter-node__main {
  flex: 1;
  min-width: 0;
}

.chapter-node__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.chapter-node__type-tag {
  margin-inline-end: 0;
  color: v-bind('token.colorPrimary');
  background: v-bind('token.colorPrimaryBg');
}

.chapter-node__title {
  flex: 1;
  min-width: 0;
  color: v-bind('token.colorText');
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-node__meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  color: v-bind('token.colorTextSecondary');
  font-size: 12px;
}

.chapter-node__actions {
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chapter-node:hover .chapter-node__actions,
.chapter-node--active .chapter-node__actions {
  opacity: 1;
}
</style>
