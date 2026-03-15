<script setup lang="ts">
import {computed, nextTick, ref, watch} from 'vue'
import {theme, message} from 'ant-design-vue'
import type {FormInstance, Rule} from 'ant-design-vue/es/form'
import {useRoute} from 'vue-router'
import {
  DownOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UpOutlined,
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

type DropMode = 'before' | 'after' | 'inside-start' | 'root-start'

interface DropTarget {
  chapterId?: string
  mode: DropMode
}

const {token} = theme.useToken()
const storyStore = useStoryStore()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const keyword = ref('')
const sortOrder = ref<'asc' | 'desc'>('desc')
const chapterList = ref<ChapterItem[]>([])
const draggingChapterId = ref('')
const dropTarget = ref<DropTarget | null>(null)
const currentMatchIndex = ref(0)
const createFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()
const pageSize = 2000

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
  return storyStore.currentStoryId || (typeof routeId === 'string' ? routeId : '')
})

const chapterTypeMap: Record<ChapterType, string> = {
  VOLUME: '卷',
  CHAPTER: '章',
}

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
const orderedChapterList = computed(() => [...chapterList.value].sort(sortChapterList))
const matchedChapters = computed(() =>
  normalizedKeyword.value
    ? orderedChapterList.value.filter((item) => item.title.toLowerCase().includes(normalizedKeyword.value))
    : [],
)
const matchedChapterIds = computed(() => new Set(matchedChapters.value.map((item) => item.id)))
const currentMatchedChapterId = computed(() => matchedChapters.value[currentMatchIndex.value]?.id ?? '')
const topLevelChapters = computed(() => orderedChapterList.value.filter((item) => !item.parentId))
const childChapterMap = computed(() => {
  const map = new Map<string, ChapterItem[]>()
  for (const chapter of orderedChapterList.value) {
    if (!chapter.parentId) continue
    const list = map.get(chapter.parentId) ?? []
    list.push(chapter)
    map.set(chapter.parentId, list)
  }
  return map
})
const matchCountText = computed(() =>
  matchedChapters.value.length ? `${currentMatchIndex.value + 1}/${matchedChapters.value.length}` : '0/0',
)
const canCreateVolume = computed(() => storyStore.currentStory?.type === 'LONG')
const selectedChapter = computed(() =>
    chapterList.value.find((item) => item.id === storyStore.currentSelectedChapterId) ?? storyStore.currentChapter
)
const draggingChapter = computed(() =>
    chapterList.value.find((item) => item.id === draggingChapterId.value) ?? null
)

function sortChapterList(a: ChapterItem, b: ChapterItem): number {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER

  if (orderA !== orderB) {
    return sortOrder.value === 'asc' ? orderA - orderB : orderB - orderA
  }

  return sortOrder.value === 'asc'
      ? a.createdAt.localeCompare(b.createdAt)
      : b.createdAt.localeCompare(a.createdAt)
}

function getChapterById(chapterId?: string | null): ChapterItem | null {
  if (!chapterId) return null
  return chapterList.value.find((item) => item.id === chapterId) ?? null
}

function getVolumeChildren(volumeId: string): ChapterItem[] {
  return childChapterMap.value.get(volumeId) ?? []
}

function getMaxOrderVolumeChild(volumeId: string): ChapterItem | null {
  const chapters = getVolumeChildren(volumeId)
  if (!chapters.length) {
    return null
  }

  return [...chapters].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MIN_SAFE_INTEGER
    const orderB = b.sortOrder ?? Number.MIN_SAFE_INTEGER
    if (orderA !== orderB) {
      return orderB - orderA
    }
    return b.createdAt.localeCompare(a.createdAt)
  })[0] ?? null
}

function isLastTopLevelChapter(chapterId: string): boolean {
  return topLevelChapters.value[topLevelChapters.value.length - 1]?.id === chapterId
}

function isLastVolumeChild(volumeId: string, chapterId: string): boolean {
  const chapters = getVolumeChildren(volumeId)
  return chapters[chapters.length - 1]?.id === chapterId
}

function isVolumeEmpty(volumeId: string): boolean {
  return getVolumeChildren(volumeId).length === 0
}

function isMatchedChapter(chapterId: string): boolean {
  return matchedChapterIds.value.has(chapterId)
}

function isCurrentMatchedChapter(chapterId: string): boolean {
  return currentMatchedChapterId.value === chapterId
}

function getHighlightedTitleSegments(title: string): Array<{ text: string; matched: boolean }> {
  if (!normalizedKeyword.value) {
    return [{text: title, matched: false}]
  }

  const source = title.toLowerCase()
  const keywordValue = normalizedKeyword.value
  const segments: Array<{ text: string; matched: boolean }> = []
  let cursor = 0

  while (cursor < title.length) {
    const index = source.indexOf(keywordValue, cursor)
    if (index === -1) {
      segments.push({text: title.slice(cursor), matched: false})
      break
    }

    if (index > cursor) {
      segments.push({text: title.slice(cursor, index), matched: false})
    }
    segments.push({text: title.slice(index, index + keywordValue.length), matched: true})
    cursor = index + keywordValue.length
  }

  return segments.length ? segments : [{text: title, matched: false}]
}

function scrollToChapter(chapterId: string): void {
  if (!chapterId || typeof document === 'undefined') {
    return
  }

  const element = document.querySelector(`[data-chapter-id="${chapterId}"]`) as HTMLElement | null
  if (!element) {
    return
  }

  element.scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  })
}

function focusCurrentMatch(): void {
  const chapter = matchedChapters.value[currentMatchIndex.value]
  if (!chapter) {
    return
  }

  storyStore.setSelectedChapter(chapter, resolvedStoryId.value)
  void nextTick(() => {
    scrollToChapter(chapter.id)
  })
}

function canDrop(dragChapter: ChapterItem | null, targetChapterId: string | undefined, mode: DropMode): boolean {
  if (!dragChapter) return false

  if (mode === 'root-start') {
    return dragChapter.type === 'CHAPTER' || dragChapter.type === 'VOLUME'
  }

  if (!targetChapterId || dragChapter.id === targetChapterId) {
    return false
  }

  const targetChapter = getChapterById(targetChapterId)
  if (!targetChapter) return false

  if (mode === 'inside-start') {
    if (dragChapter.type !== 'CHAPTER' || targetChapter.type !== 'VOLUME') {
      return false
    }

    if (dragChapter.parentId !== targetChapter.id) {
      return true
    }

    const firstChild = getVolumeChildren(targetChapter.id)[0]
    return firstChild?.id !== dragChapter.id
  }

  return !(dragChapter.type === 'VOLUME' && targetChapter.parentId)

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

function resolveMoveMode(mode: DropMode): 'BEFORE' | 'AFTER' | 'INSIDE' | 'INSIDE_START' | 'ROOT_START' | 'ROOT_END' {
  if (sortOrder.value === 'asc') {
    switch (mode) {
      case 'before':
        return 'BEFORE'
      case 'after':
        return 'AFTER'
      case 'inside-start':
        return 'INSIDE_START'
      case 'root-start':
        return 'ROOT_START'
    }
  }

  switch (mode) {
    case 'before':
      return 'AFTER'
    case 'after':
      return 'BEFORE'
    case 'inside-start':
      return 'INSIDE'
    case 'root-start':
      return 'ROOT_END'
  }
}

async function persistMove(targetChapterId: string | undefined, mode: DropMode): Promise<void> {
  if (!canDrop(draggingChapter.value, targetChapterId, mode) || !draggingChapter.value) {
    clearDragState()
    return
  }

  try {
    await moveChapter({
      storyId: resolvedStoryId.value,
      chapterId: draggingChapter.value.id,
      targetChapterId,
      mode: resolveMoveMode(mode),
    })
    message.success('章节排序已更新')
    await fetchChapterList({reset: true})
  } finally {
    clearDragState()
  }
}

async function fetchChapterList(options?: { reset?: boolean }) {
  if (!resolvedStoryId.value) return

  void options
  if (loading.value) return
  loading.value = true

  try {
    const res = await getChapterList({
      storyId: resolvedStoryId.value,
      page: 1,
      size: pageSize,
      order: sortOrder.value,
    })

    chapterList.value = res.list

    if (!chapterList.value.length) {
      storyStore.setSelectedChapter(null, resolvedStoryId.value)
      return
    }

    const currentSelected = chapterList.value.find((item) => item.id === storyStore.currentSelectedChapterId) ?? null
    let normalizedSelected: ChapterItem | null = currentSelected
    if (currentSelected?.type === 'VOLUME') {
      normalizedSelected = getMaxOrderVolumeChild(currentSelected.id) ?? currentSelected
    }
    const nextSelected = normalizedSelected || chapterList.value[0]
    if (!nextSelected) {
      storyStore.setSelectedChapter(null, resolvedStoryId.value)
      return
    }
    if (!currentSelected || normalizedSelected?.id !== currentSelected.id) {
      storyStore.setSelectedChapter(nextSelected, resolvedStoryId.value)
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  dropTarget.value = null
  focusCurrentMatch()
}

function handleToggleSort(): void {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  void fetchChapterList({reset: true})
}

function handlePreviousMatch(): void {
  if (!matchedChapters.value.length) {
    return
  }

  currentMatchIndex.value =
    (currentMatchIndex.value - 1 + matchedChapters.value.length) % matchedChapters.value.length
  focusCurrentMatch()
}

function handleNextMatch(): void {
  if (!matchedChapters.value.length) {
    return
  }

  currentMatchIndex.value = (currentMatchIndex.value + 1) % matchedChapters.value.length
  focusCurrentMatch()
}

function handleSelect(chapter: ChapterItem) {
  if (chapter.type === 'VOLUME') {
    const maxOrderChapter = getMaxOrderVolumeChild(chapter.id)
    storyStore.setSelectedChapter(maxOrderChapter ?? chapter, resolvedStoryId.value)
    return
  }

  storyStore.setSelectedChapter(chapter, resolvedStoryId.value)
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
    await fetchChapterList({reset: true})
  } finally {
    submitting.value = false
  }
}

async function handleDelete(chapter: ChapterItem) {
  const orderedListBeforeDelete = orderedChapterList.value
  const deletedIndex = orderedListBeforeDelete.findIndex((item) => item.id === chapter.id)
  const fallbackChapter = deletedIndex > 0
      ? orderedListBeforeDelete[deletedIndex - 1]
      : orderedListBeforeDelete[deletedIndex + 1] ?? null
  const shouldMoveSelection = storyStore.currentSelectedChapterId === chapter.id

  await deleteChapter(chapter.id)
  message.success('章节删除成功')
  await fetchChapterList({reset: true})

  if (!shouldMoveSelection || !fallbackChapter) {
    return
  }

  const nextSelectedChapter = chapterList.value.find((item) => item.id === fallbackChapter.id) ?? null
  storyStore.setSelectedChapter(nextSelectedChapter, resolvedStoryId.value)
}

function handleContentScroll(event: Event): void {
  void event
}

watch(resolvedStoryId, () => {
  chapterList.value = []
  void fetchChapterList({reset: true})
}, {immediate: true})

watch(normalizedKeyword, () => {
  currentMatchIndex.value = 0
  if (!matchedChapters.value.length) {
    return
  }
  focusCurrentMatch()
})
</script>

<template>
  <div class="chapter-list" :class="{'chapter-list--dragging': !!draggingChapterId}">
    <div class="chapter-list__toolbar">
      <div class="chapter-list__title">
        <span>章节列表</span>
      </div>
      <div class="chapter-list__search-row">
        <a-input-search
            v-model:value="keyword"
            size="small"
            placeholder="搜索章节标题"
            allow-clear
            @search="handleSearch"
            @pressEnter="handleSearch"
        />
        <div class="chapter-list__search-nav">
          <a-button size="small" :disabled="!matchedChapters.length" @click="handlePreviousMatch">
            <template #icon>
              <UpOutlined/>
            </template>
          </a-button>
          <a-button size="small" :disabled="!matchedChapters.length" @click="handleNextMatch">
            <template #icon>
              <DownOutlined/>
            </template>
          </a-button>
          <span class="chapter-list__search-count">{{ matchCountText }}</span>
        </div>
      </div>
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
        <a-button class="chapter-list__sort-btn" size="small" @click="handleToggleSort">
          <template #icon>
            <SortAscendingOutlined v-if="sortOrder === 'asc'"/>
            <SortDescendingOutlined v-else/>
          </template>
        </a-button>
      </div>
    </div>

    <div class="chapter-list__content" @scroll="handleContentScroll">
      <a-spin :spinning="loading">
        <div v-if="orderedChapterList.length" class="chapter-tree">
          <div
              v-if="sortOrder === 'asc'"
              class="chapter-slot chapter-slot--root"
              :class="{
              'chapter-slot--visible': !!draggingChapterId && canDrop(draggingChapter, undefined, 'root-start'),
              'chapter-slot--active': isActiveDropTarget(undefined, 'root-start'),
            }"
              @dragover.prevent="setDropTarget(undefined, 'root-start')"
              @drop.prevent="persistMove(undefined, 'root-start')"
          />
          <template v-for="topLevelChapter in topLevelChapters" :key="topLevelChapter.id">
          <div
              v-if="sortOrder === 'desc'"
              class="chapter-slot"
              :class="{
              'chapter-slot--visible': !!draggingChapterId && canDrop(draggingChapter, topLevelChapter.id, 'before'),
              'chapter-slot--active': isActiveDropTarget(topLevelChapter.id, 'before'),
            }"
              @dragover.prevent="setDropTarget(topLevelChapter.id, 'before')"
              @drop.prevent="persistMove(topLevelChapter.id, 'before')"
          />
            <div
                class="chapter-node"
                :class="{
                'chapter-node--active': storyStore.currentSelectedChapterId === topLevelChapter.id,
                'chapter-node--dragging': draggingChapterId === topLevelChapter.id,
                'chapter-node--matched': isMatchedChapter(topLevelChapter.id),
                'chapter-node--matched-current': isCurrentMatchedChapter(topLevelChapter.id),
              }"
                :data-chapter-id="topLevelChapter.id"
                draggable="true"
                @click="handleSelect(topLevelChapter)"
                @dragstart="handleDragStart(topLevelChapter, $event)"
                @dragend="handleDragEnd"
            >
              <div class="chapter-node__main">
                <div class="chapter-node__title-row">
                  <a-tag :bordered="false" class="chapter-node__type-tag">
                    {{ chapterTypeMap[topLevelChapter.type] }}
                  </a-tag>
                  <span class="chapter-node__title">
                    <template v-for="(segment, index) in getHighlightedTitleSegments(topLevelChapter.title)" :key="`${topLevelChapter.id}-${index}`">
                      <mark v-if="segment.matched" class="chapter-node__highlight">{{ segment.text }}</mark>
                      <template v-else>{{ segment.text }}</template>
                    </template>
                  </span>
                </div>
              </div>
              <div class="chapter-node__actions" @click.stop>
                <a-button
                    v-if="canCreateVolume && topLevelChapter.type === 'VOLUME'"
                    type="text"
                    size="small"
                    @click="openCreateModal('CHAPTER', topLevelChapter.id)"
                >
                  <template #icon>
                    <FileAddOutlined/>
                  </template>
                </a-button>
                <a-button type="text" size="small" @click="openEditModal(topLevelChapter)">
                  <template #icon>
                    <EditOutlined/>
                  </template>
                </a-button>
                <a-popconfirm
                    title="确定删除这个章节吗？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="handleDelete(topLevelChapter)"
                >
                  <a-button type="text" size="small" danger>
                    <template #icon>
                      <DeleteOutlined/>
                    </template>
                  </a-button>
                </a-popconfirm>
              </div>
            </div>

            <template v-if="topLevelChapter.type === 'VOLUME'">
              <div
                  v-if="sortOrder === 'asc' || isVolumeEmpty(topLevelChapter.id)"
                  class="chapter-slot chapter-slot--inside"
                  :class="{
                  'chapter-slot--visible': !!draggingChapterId && canDrop(draggingChapter, topLevelChapter.id, 'inside-start'),
                  'chapter-slot--active': isActiveDropTarget(topLevelChapter.id, 'inside-start'),
                }"
                  @dragover.prevent="setDropTarget(topLevelChapter.id, 'inside-start')"
                  @drop.prevent="persistMove(topLevelChapter.id, 'inside-start')"
              />

              <template v-for="childChapter in getVolumeChildren(topLevelChapter.id)" :key="childChapter.id">
                <div
                    v-if="sortOrder === 'desc'"
                    class="chapter-slot chapter-slot--inside"
                    :class="{
                    'chapter-slot--visible': !!draggingChapterId && canDrop(draggingChapter, childChapter.id, 'before'),
                    'chapter-slot--active': isActiveDropTarget(childChapter.id, 'before'),
                  }"
                    @dragover.prevent="setDropTarget(childChapter.id, 'before')"
                    @drop.prevent="persistMove(childChapter.id, 'before')"
                />
                <div
                    class="chapter-node chapter-node--child"
                    :class="{
                    'chapter-node--active': storyStore.currentSelectedChapterId === childChapter.id,
                    'chapter-node--dragging': draggingChapterId === childChapter.id,
                    'chapter-node--matched': isMatchedChapter(childChapter.id),
                    'chapter-node--matched-current': isCurrentMatchedChapter(childChapter.id),
                  }"
                    :data-chapter-id="childChapter.id"
                    draggable="true"
                    @click="handleSelect(childChapter)"
                    @dragstart="handleDragStart(childChapter, $event)"
                    @dragend="handleDragEnd"
                >
                  <div class="chapter-node__main">
                    <div class="chapter-node__title-row">
                      <a-tag :bordered="false" class="chapter-node__type-tag">
                        {{ chapterTypeMap[childChapter.type] }}
                      </a-tag>
                      <span class="chapter-node__title">
                        <template v-for="(segment, index) in getHighlightedTitleSegments(childChapter.title)" :key="`${childChapter.id}-${index}`">
                          <mark v-if="segment.matched" class="chapter-node__highlight">{{ segment.text }}</mark>
                          <template v-else>{{ segment.text }}</template>
                        </template>
                      </span>
                    </div>
                  </div>
                  <div class="chapter-node__actions" @click.stop>
                    <a-button type="text" size="small" @click="openEditModal(childChapter)">
                      <template #icon>
                        <EditOutlined/>
                      </template>
                    </a-button>
                    <a-popconfirm
                        title="确定删除这个章节吗？"
                        ok-text="确定"
                        cancel-text="取消"
                        @confirm="handleDelete(childChapter)"
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
                    v-if="sortOrder === 'asc' || isLastVolumeChild(topLevelChapter.id, childChapter.id)"
                    class="chapter-slot chapter-slot--inside"
                    :class="{
                    'chapter-slot--visible': !!draggingChapterId && canDrop(draggingChapter, childChapter.id, 'after'),
                    'chapter-slot--active': isActiveDropTarget(childChapter.id, 'after'),
                  }"
                    @dragover.prevent="setDropTarget(childChapter.id, 'after')"
                    @drop.prevent="persistMove(childChapter.id, 'after')"
                />
              </template>
            </template>

            <div
                v-if="sortOrder === 'asc' || isLastTopLevelChapter(topLevelChapter.id)"
                class="chapter-slot"
                :class="{
                'chapter-slot--visible': !!draggingChapterId && canDrop(draggingChapter, topLevelChapter.id, 'after'),
                'chapter-slot--active': isActiveDropTarget(topLevelChapter.id, 'after'),
              }"
                @dragover.prevent="setDropTarget(topLevelChapter.id, 'after')"
                @drop.prevent="persistMove(topLevelChapter.id, 'after')"
            />
          </template>
        </div>
        <a-empty v-else description="暂无章节数据"/>
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
        :title="editForm.type === 'VOLUME' ? '编辑分卷' : '编辑章节'"
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

.chapter-list__search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 240px;
}

.chapter-list__search-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.chapter-list__search-nav :deep(.ant-btn) {
  flex: 0 0 24px;
  width: 24px;
  min-width: 24px;
  padding-inline: 0;
}

.chapter-list__search-count {
  min-width: 32px;
  flex-shrink: 0;
  text-align: center;
  color: v-bind('token.colorTextTertiary');
  font-size: 12px;
}

.chapter-list__actions {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
}

.chapter-list__actions :deep(.ant-btn) {
  flex-shrink: 0;
}

.chapter-list__actions--single {
  justify-content: flex-start;
}

.chapter-list__sort-btn {
  flex: 0 0 auto;
}

.chapter-list__content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.chapter-tree {
  padding: 8px 0;
}

.chapter-slot {
  height: 0;
  margin: 4px 8px;
  border: 1px dashed transparent;
  background: transparent;
  opacity: 0;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease, height 0.2s ease, opacity 0.2s ease;
}

.chapter-slot--root {
}

.chapter-slot--inside {
  margin-left: 52px;
}

.chapter-slot--visible {
  height: 15px;
  opacity: 1;
  border-radius: v-bind('`${token.borderRadiusSM}px`');
  border-color: v-bind('token.colorTextTertiary');
  background: v-bind('token.colorBgTextHover');
}

.chapter-slot--inside.chapter-slot--visible {
  border-color: v-bind('token.colorPrimaryHover');
  background: v-bind('token.controlItemBgActive');
}

.chapter-slot--active {
  border-color: v-bind('token.colorWarning');
  background: color-mix(in srgb, v-bind('token.colorWarning') 16%, transparent);
}

.chapter-slot--inside.chapter-slot--active {
  border-color: v-bind('token.colorWarning');
  background: color-mix(in srgb, v-bind('token.colorWarning') 20%, transparent);
}

.chapter-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  cursor: pointer;
  border-left: 5px solid transparent;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.chapter-node--child {
  padding-left: 34px;
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

.chapter-node--matched {
  background: color-mix(in srgb, v-bind('token.colorWarning') 10%, transparent);
}

.chapter-node--matched-current {
  background: color-mix(in srgb, v-bind('token.colorWarning') 16%, transparent);
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

.chapter-node__highlight {
  padding: 0 2px;
  color: inherit;
  background: color-mix(in srgb, v-bind('token.colorWarning') 28%, transparent);
  border-radius: 4px;
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
