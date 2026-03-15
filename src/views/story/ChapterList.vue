<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {theme, message} from 'ant-design-vue'
import type {FormInstance, Rule} from 'ant-design-vue/es/form'
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
  moveChapter,
  updateChapter,
  type ChapterItem,
  type ChapterType,
} from '@api/story/chapter.ts'
import {useStoryStore} from '@stores/story.ts'

type DropMode = 'before' | 'after' | 'inside' | 'root-start' | 'root-end'

interface DropTarget {
  chapterId?: string
  mode: DropMode
}

const props = defineProps<{
  storyId?: string
}>()

const emit = defineEmits<{
  select: [chapter: ChapterItem]
}>()

const {token} = theme.useToken()
const storyStore = useStoryStore()
const route = useRoute()

const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const keyword = ref('')
const chapterList = ref<ChapterItem[]>([])
const selectedChapterId = ref('')
const currentPage = ref(1)
const hasNextPage = ref(false)
const draggingChapterId = ref('')
const dropTarget = ref<DropTarget | null>(null)
const createFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()
const pageSize = 50

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
  type: 'CHAPTER' as ChapterType,
})

const createFormRules = computed<Record<string, Rule[]>>(() => ({
  title: [
    {
      required: true,
      whitespace: true,
      message: createForm.value.type === 'VOLUME' ? '请输入分卷标题' : '请输入章节标题',
      trigger: 'change',
    },
    {
      max: 50,
      message: createForm.value.type === 'VOLUME' ? '分卷标题不能超过 50 个字符' : '章节标题不能超过 50 个字符',
      trigger: 'change',
    },
  ],
}))

const editFormRules = computed<Record<string, Rule[]>>(() => ({
  title: [
    {
      required: true,
      whitespace: true,
      message: editForm.value.type === 'VOLUME' ? '请输入分卷标题' : '请输入章节标题',
      trigger: 'change',
    },
    {
      max: 50,
      message: editForm.value.type === 'VOLUME' ? '分卷标题不能超过 50 个字符' : '章节标题不能超过 50 个字符',
      trigger: 'change',
    },
  ],
}))

const resolvedStoryId = computed(() => {
  const routeId = route.params.id
  return props.storyId || (typeof routeId === 'string' ? routeId : '')
})

const chapterTypeMap: Record<ChapterType, string> = {
  VOLUME: '卷',
  CHAPTER: '章',
}

const orderedChapterList = computed(() => [...chapterList.value].sort(sortChapterList))
const canCreateVolume = computed(() => storyStore.currentStory?.type === 'LONG')
const selectedChapter = computed(() =>
  chapterList.value.find((item) => item.id === selectedChapterId.value) ?? null
)
const draggingChapter = computed(() =>
  chapterList.value.find((item) => item.id === draggingChapterId.value) ?? null
)

function sortChapterList(a: ChapterItem, b: ChapterItem): number {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER

  if (orderA !== orderB) {
    return orderA - orderB
  }

  return a.createdAt.localeCompare(b.createdAt)
}

function getChapterById(chapterId?: string | null): ChapterItem | null {
  if (!chapterId) return null
  return chapterList.value.find((item) => item.id === chapterId) ?? null
}

function getChapterLevel(chapter: ChapterItem): number {
  return chapter.parentId ? 1 : 0
}

function shouldShowBeforeDropzone(chapter: ChapterItem): boolean {
  const parent = getChapterById(chapter.parentId)
  if (!parent) return true

  const siblings = orderedChapterList.value
    .filter((item) => (item.parentId ?? null) === (chapter.parentId ?? null))

  return siblings[0]?.id !== chapter.id
}

function getAfterDropIndent(chapter: ChapterItem, index: number): number {
  const nextChapter = orderedChapterList.value[index + 1]
  if (!nextChapter) {
    return 16
  }

  if ((nextChapter.parentId ?? null) !== (chapter.parentId ?? null)) {
    return 16 + Math.max(getChapterLevel(nextChapter) - 1, 0) * 18
  }

  return 16 + getChapterLevel(chapter) * 18
}

function canDrop(dragChapter: ChapterItem | null, targetChapterId: string | undefined, mode: DropMode): boolean {
  if (!dragChapter) return false

  if (mode === 'root-start' || mode === 'root-end') {
    return dragChapter.type === 'CHAPTER' || dragChapter.type === 'VOLUME'
  }

  if (!targetChapterId || dragChapter.id === targetChapterId) {
    return false
  }

  const targetChapter = getChapterById(targetChapterId)
  if (!targetChapter) return false

  if (mode === 'inside') {
    return dragChapter.type === 'CHAPTER' && targetChapter.type === 'VOLUME'
  }

  if (dragChapter.type === 'VOLUME' && targetChapter.parentId) {
    return false
  }

  return true
}

function setDropTarget(chapterId: string | undefined, mode: DropMode): void {
  if (!canDrop(draggingChapter.value, chapterId, mode)) {
    dropTarget.value = null
    return
  }

  dropTarget.value = {chapterId, mode}
}

function clearDragState(): void {
  draggingChapterId.value = ''
  dropTarget.value = null
}

function handleDragStart(chapter: ChapterItem, event: DragEvent): void {
  draggingChapterId.value = chapter.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', chapter.id)
  }
}

function handleDragEnd(): void {
  clearDragState()
}

function isActiveDropTarget(chapterId: string | undefined, mode: DropMode): boolean {
  return dropTarget.value?.chapterId === chapterId && dropTarget.value?.mode === mode
}

async function persistMove(targetChapterId: string | undefined, mode: DropMode): Promise<void> {
  if (!canDrop(draggingChapter.value, targetChapterId, mode) || !draggingChapter.value) {
    clearDragState()
    return
  }

  loading.value = true
  try {
    const modeMap: Record<DropMode, 'BEFORE' | 'AFTER' | 'INSIDE' | 'ROOT_START' | 'ROOT_END'> = {
      before: 'BEFORE',
      after: 'AFTER',
      inside: 'INSIDE',
      'root-start': 'ROOT_START',
      'root-end': 'ROOT_END',
    }

    await moveChapter({
      storyId: resolvedStoryId.value,
      chapterId: draggingChapter.value.id,
      targetChapterId,
      mode: modeMap[mode],
    })
    message.success('章节排序已更新')
    currentPage.value = 1
    hasNextPage.value = false
    await fetchChapterList({reset: true})
  } finally {
    loading.value = false
    clearDragState()
  }
}

async function fetchChapterList(options?: { reset?: boolean }) {
  if (!resolvedStoryId.value) return

  const reset = options?.reset ?? false
  const requestPage = reset ? 1 : currentPage.value

  if (reset) {
    loading.value = true
  } else {
    if (loading.value || loadingMore.value || !hasNextPage.value) return
    loadingMore.value = true
  }

  try {
    const res = await getChapterList({
      storyId: resolvedStoryId.value,
      page: requestPage,
      size: pageSize,
      title: keyword.value || undefined,
    })

    currentPage.value = res.page + 1
    hasNextPage.value = res.hasNext

    if (reset) {
      chapterList.value = res.list
    } else {
      const loadedIds = new Set(chapterList.value.map((item) => item.id))
      chapterList.value = chapterList.value.concat(
        res.list.filter((item) => !loadedIds.has(item.id)),
      )
    }

    if (!chapterList.value.length) {
      selectedChapterId.value = ''
      return
    }

    const currentSelected = chapterList.value.find((item) => item.id === selectedChapterId.value)
    const nextSelected = currentSelected || chapterList.value[0]
    if (!nextSelected) {
      selectedChapterId.value = ''
      return
    }
    selectedChapterId.value = nextSelected.id
    if (reset || !currentSelected) {
      emit('select', nextSelected)
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  hasNextPage.value = false
  void fetchChapterList({reset: true})
}

function handleSelect(chapter: ChapterItem) {
  selectedChapterId.value = chapter.id
  emit('select', chapter)
}

function openCreateModal(type: ChapterType, parentId?: string) {
  const nextType = type === 'VOLUME' && !canCreateVolume.value ? 'CHAPTER' : type
  const nextParentId = nextType === 'CHAPTER' && !parentId && selectedChapter.value?.type === 'VOLUME'
    ? selectedChapter.value.id
    : parentId
  createForm.value = {
    title: '',
    type: nextType,
    parentId: nextParentId,
  }
  createModalOpen.value = true
  setTimeout(() => {
    createFormRef.value?.clearValidate()
  }, 0)
}

function openEditModal(chapter: ChapterItem) {
  editForm.value = {
    id: chapter.id,
    title: chapter.title,
    type: chapter.type,
  }
  editModalOpen.value = true
  setTimeout(() => {
    editFormRef.value?.clearValidate()
  }, 0)
}

async function handleCreateSubmit() {
  if (!resolvedStoryId.value || submitting.value) return

  await createFormRef.value?.validate()

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
    currentPage.value = 1
    hasNextPage.value = false
    await fetchChapterList({reset: true})
  } finally {
    submitting.value = false
  }
}

async function handleEditSubmit() {
  if (submitting.value) return

  await editFormRef.value?.validate()

  submitting.value = true
  try {
    await updateChapter({
      id: editForm.value.id,
      title: editForm.value.title.trim(),
    })
    message.success('章节更新成功')
    editModalOpen.value = false
    currentPage.value = 1
    hasNextPage.value = false
    await fetchChapterList({reset: true})
  } finally {
    submitting.value = false
  }
}

async function handleDelete(chapter: ChapterItem) {
  await deleteChapter(chapter.id)
  message.success('章节删除成功')
  currentPage.value = 1
  hasNextPage.value = false
  await fetchChapterList({reset: true})
}

function handleContentScroll(event: Event): void {
  const target = event.target as HTMLDivElement
  const threshold = 80
  const reachBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold

  if (reachBottom && hasNextPage.value && !loading.value && !loadingMore.value) {
    void fetchChapterList()
  }
}

watch(resolvedStoryId, () => {
  currentPage.value = 1
  hasNextPage.value = false
  chapterList.value = []
  void fetchChapterList({reset: true})
}, {immediate: true})
</script>

<template>
  <div class="chapter-list">
    <div class="chapter-list__toolbar">
      <div class="chapter-list__title">
        <span>章节列表</span>
      </div>
      <a-input-search
          v-model:value="keyword"
          placeholder="搜索章节标题"
          allow-clear
          @search="handleSearch"
          @pressEnter="handleSearch"
      />
      <div class="chapter-list__actions" :class="{'chapter-list__actions--single': !canCreateVolume}">
        <a-button
          v-if="canCreateVolume"
          type="primary"
          size="small"
          @click="openCreateModal('VOLUME')"
        >
          <template #icon>
            <FolderAddOutlined/>
          </template>
          新建分卷
        </a-button>
        <a-button type="primary" size="small" @click="openCreateModal('CHAPTER')">
          <template #icon>
            <FileAddOutlined/>
          </template>
          新建章节
        </a-button>
      </div>
    </div>

    <div class="chapter-list__content" @scroll="handleContentScroll">
      <a-spin :spinning="loading">
      <div v-if="orderedChapterList.length" class="chapter-tree">
        <div
          class="chapter-dropzone chapter-dropzone--root"
          :class="{'chapter-dropzone--active': isActiveDropTarget(undefined, 'root-start')}"
          @dragover.prevent="setDropTarget(undefined, 'root-start')"
          @drop.prevent="persistMove(undefined, 'root-start')"
        />
        <template v-for="(chapter, index) in orderedChapterList" :key="chapter.id">
          <div
            v-if="shouldShowBeforeDropzone(chapter)"
            class="chapter-dropzone"
            :style="{marginLeft: `${16 + getChapterLevel(chapter) * 18}px`}"
            :class="{'chapter-dropzone--active': isActiveDropTarget(chapter.id, 'before')}"
            @dragover.prevent="setDropTarget(chapter.id, 'before')"
            @drop.prevent="persistMove(chapter.id, 'before')"
          />
          <div
            class="chapter-node"
            :class="{
              'chapter-node--active': selectedChapterId === chapter.id,
              'chapter-node--dragging': draggingChapterId === chapter.id,
              'chapter-node--inside-active': isActiveDropTarget(chapter.id, 'inside'),
            }"
            :style="{paddingLeft: `${16 + getChapterLevel(chapter) * 18}px`}"
            draggable="true"
            @click="handleSelect(chapter)"
            @dragstart="handleDragStart(chapter, $event)"
            @dragend="handleDragEnd"
            @dragover.prevent="setDropTarget(chapter.id, 'inside')"
            @drop.prevent="persistMove(chapter.id, 'inside')"
          >
            <div class="chapter-node__main">
              <div class="chapter-node__title-row">
                <a-tag :bordered="false" class="chapter-node__type-tag">
                  {{ chapterTypeMap[chapter.type] }}
                </a-tag>
                <span class="chapter-node__title">{{ chapter.title }}</span>
              </div>
              <div class="chapter-node__meta">
                <span v-if="chapter.wordCount">字数 {{ chapter.wordCount }}</span>
              </div>
            </div>
            <div class="chapter-node__actions" @click.stop>
              <a-button
                  v-if="canCreateVolume && chapter.type === 'VOLUME'"
                  type="text"
                  size="small"
                  @click="openCreateModal('CHAPTER', chapter.id)"
              >
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
          <div
            class="chapter-dropzone"
            :style="{marginLeft: `${getAfterDropIndent(chapter, index)}px`}"
            :class="{'chapter-dropzone--active': isActiveDropTarget(chapter.id, 'after')}"
            @dragover.prevent="setDropTarget(chapter.id, 'after')"
            @drop.prevent="persistMove(chapter.id, 'after')"
          />
        </template>
        <div
          class="chapter-dropzone chapter-dropzone--root"
          :class="{'chapter-dropzone--active': isActiveDropTarget(undefined, 'root-end')}"
          @dragover.prevent="setDropTarget(undefined, 'root-end')"
          @drop.prevent="persistMove(undefined, 'root-end')"
        />
      </div>
      <a-empty v-else description="暂无章节数据"/>
      <div v-if="loadingMore" class="chapter-list__loading-more">
        <a-spin size="small"/>
      </div>
      </a-spin>
    </div>

    <a-modal
        v-model:open="createModalOpen"
        :confirm-loading="submitting"
        :title="createForm.type === 'VOLUME' ? '创建分卷' : '创建章节'"
        ok-text="确定"
        cancel-text="取消"
        @ok="handleCreateSubmit"
    >
      <a-form ref="createFormRef" :model="createForm" :rules="createFormRules" layout="vertical" :required-mark="false">
        <a-form-item name="title">
          <a-input
            v-model:value="createForm.title"
            :maxlength="50"
            :placeholder="createForm.type === 'VOLUME' ? '请输入分卷标题' : '请输入章节标题'"
            show-count
          />
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
      <a-form ref="editFormRef" :model="editForm" :rules="editFormRules" layout="vertical" :required-mark="false">
        <a-form-item name="title">
          <a-input
            v-model:value="editForm.title"
            :placeholder="editForm.type === 'VOLUME' ? '请输入分卷标题' : '请输入章节标题'"
            :maxlength="50"
            show-count
          />
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
  min-width: 200px;
  background: v-bind('token.colorBgContainer');
  overflow: hidden;
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
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
}

.chapter-list__actions--single {
  justify-content: flex-start;
}

.chapter-list__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.chapter-list__loading-more {
  display: flex;
  justify-content: center;
  padding: 8px 0 16px;
}

.chapter-tree {
  padding: 8px 0;
}

.chapter-dropzone {
  height: 0;
  padding: 2px 0;
  margin-right: 12px;
  border-radius: 999px;
  background-clip: content-box;
  transition: background-color 0.2s ease;
}

.chapter-dropzone--root {
  margin-left: 16px;
}

.chapter-dropzone--active {
  background: v-bind('token.colorPrimary');
}

.chapter-node {
  display: flex;
  align-items: center;
  gap: 8px;
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

.chapter-node--dragging {
  opacity: 0.45;
}

.chapter-node--inside-active {
  box-shadow: inset 0 0 0 1px v-bind('token.colorPrimary');
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

.chapter-node:hover .chapter-node__actions {
  opacity: 1;
}
</style>
