<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import type {JSONContent} from '@tiptap/vue-3'
import {message, theme} from 'ant-design-vue'
import Editor from '@components/editor/Editor.vue'
import {useStoryStore} from '@stores/story.ts'
import {getChapterContentById, updateChapterContent} from '@api/story/chapter.ts'

const {token} = theme.useToken()
const storyStore = useStoryStore()
const loading = ref(false)
let fetchToken = 0
let saveTimer: number | null = null
let retryTimer: number | null = null
let retryCount = 0

const AUTO_SAVE_DELAY = 5000
const RETRY_DELAYS = [5000, 10000, 30000]

const currentStoryId = computed(() => storyStore.currentStoryId)
const currentChapterId = computed(() => storyStore.currentChapter?.id ?? '')
const chapterSelectionVersion = computed(() => storyStore.chapterSelectionVersion)
const autoSaveEnabled = computed({
  get: () => storyStore.settings.autoSaveEnabled,
  set: (value: boolean) => {
    storyStore.setAutoSaveEnabled(value)
  },
})
const saveStatus = computed(() => storyStore.currentChapterSaveStatus)
const lastSavedAt = computed(() => storyStore.currentChapterLastSavedAt)
const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'dirty':
      return '编辑中'
    case 'saving':
      return '保存中'
    case 'saved':
      return '已保存'
    case 'error':
      return '保存失败'
    default:
      return '未修改'
  }
})
const lastSavedAtText = computed(() => {
  if (!lastSavedAt.value) {
    return '尚未保存'
  }

  const date = new Date(lastSavedAt.value)
  if (Number.isNaN(date.getTime())) {
    return '尚未保存'
  }

  return `最后保存 ${date.toLocaleString()}`
})
const canSave = computed(() =>
  !!currentStoryId.value
  && !!currentChapterId.value
  && !loading.value
  && saveStatus.value !== 'saving'
)

const chapterContent = computed({
  get: () => storyStore.currentChapterContent,
  set: (value: string) => {
    storyStore.setCurrentChapterContent(value)
  },
})

function handleEditorSave(payload: { html: string; text: string; json: JSONContent }): void {
  storyStore.setCurrentChapterPlainText(payload.text)
}

function clearSaveTimer() {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer)
    saveTimer = null
  }
}

function clearRetryTimer() {
  if (retryTimer !== null) {
    window.clearTimeout(retryTimer)
    retryTimer = null
  }
}

function scheduleAutoSave(storyId = currentStoryId.value, chapterId = currentChapterId.value) {
  clearSaveTimer()

  if (!autoSaveEnabled.value || !storyId || !chapterId || !storyStore.isChapterDirty(storyId, chapterId)) {
    return
  }

  saveTimer = window.setTimeout(() => {
    void saveChapterContent(storyId, chapterId)
  }, AUTO_SAVE_DELAY)
}

function scheduleRetry(storyId: string, chapterId: string) {
  clearRetryTimer()

  if (!storyId || !storyStore.isChapterDirty(storyId, chapterId)) {
    return
  }

  const delay = RETRY_DELAYS[Math.min(retryCount, RETRY_DELAYS.length - 1)]
  retryTimer = window.setTimeout(() => {
    void saveChapterContent(storyId, chapterId)
  }, delay)
  retryCount += 1
}

async function saveChapterContent(
  storyId = currentStoryId.value,
  chapterId = currentChapterId.value,
  force = false,
): Promise<void> {
  if (!storyId || !chapterId) {
    return
  }

  const draftContent = storyStore.getChapterDraft(storyId, chapterId)
  const plainText = storyStore.getChapterPlainText(storyId, chapterId) ?? ''
  const savedContent = storyStore.getChapterSavedContent(storyId, chapterId)

  if (!force && (draftContent === undefined || draftContent === savedContent)) {
    storyStore.setChapterSaveStatus('saved', storyId, chapterId)
    retryCount = 0
    clearRetryTimer()
    return
  }

  storyStore.setChapterSaveStatus('saving', storyId, chapterId)
  try {
    await updateChapterContent({
      id: chapterId,
      content: draftContent,
      plainText,
    })
    storyStore.markChapterSaved(draftContent, plainText, undefined, storyId, chapterId)
    retryCount = 0
    clearRetryTimer()
  } catch (error) {
    storyStore.setChapterSaveStatus('error', storyId, chapterId)
    message.error('章节内容保存失败')
    scheduleRetry(storyId, chapterId)
  }
}

watch(
  [currentStoryId, currentChapterId, chapterSelectionVersion],
  async ([storyId, chapterId], [previousStoryId, previousChapterId]) => {
    clearSaveTimer()
    clearRetryTimer()

    if (
      previousStoryId
      && previousChapterId
      && (previousStoryId !== storyId || previousChapterId !== chapterId)
      && storyStore.isChapterDirty(previousStoryId, previousChapterId)
    ) {
      await saveChapterContent(previousStoryId, previousChapterId)
    }

    if (!chapterId || !storyId) {
      return
    }

    const chapter = storyStore.currentChapter
    const defaultDraft = `<h1>${chapter?.title?.trim() || '第一章'}</h1><p></p>`

    const requestId = ++fetchToken
    loading.value = true
    try {
      const content = await getChapterContentById(chapterId)
      if (requestId !== fetchToken || storyStore.currentChapter?.id !== chapterId) {
        return
      }

      const remoteContent = content.content || defaultDraft
      const remotePlainText = content.plainText || ''
      const remoteSavedAt = content.updatedAt || ''
      if (storyStore.isChapterDirty(storyId, chapterId)) {
        storyStore.setChapterSavedContent(remoteContent, remotePlainText, remoteSavedAt, storyId, chapterId)
      } else {
        storyStore.setChapterContentFromRemote(remoteContent, remotePlainText, remoteSavedAt, storyId, chapterId)
      }
    } catch (error) {
      if (requestId === fetchToken) {
        message.error('章节内容加载失败')
      }
    } finally {
      if (requestId === fetchToken) {
        loading.value = false
      }
    }
  },
  {immediate: true},
)

watch(
  [currentStoryId, currentChapterId, chapterContent],
  ([storyId, chapterId]) => {
    retryCount = 0
    clearRetryTimer()

    scheduleAutoSave(storyId, chapterId)
  },
  {flush: 'post'},
)

watch(autoSaveEnabled, (enabled) => {
  if (!enabled) {
    clearSaveTimer()
    return
  }

  scheduleAutoSave(currentStoryId.value, currentChapterId.value)
})

onBeforeUnmount(() => {
  clearSaveTimer()
  clearRetryTimer()
  if (currentStoryId.value && currentChapterId.value && storyStore.isChapterDirty(currentStoryId.value, currentChapterId.value)) {
    void saveChapterContent(currentStoryId.value, currentChapterId.value)
  }
})

function handleManualSave(): void {
  if (!canSave.value) {
    return
  }

  clearSaveTimer()
  clearRetryTimer()
  retryCount = 0
  void saveChapterContent(currentStoryId.value, currentChapterId.value, true)
}
</script>

<template>
  <div class="chapter-content">
    <div class="chapter-content__status">
      <div class="chapter-content__status-meta">
        <span>{{ saveStatusText }}</span>
        <span>{{ lastSavedAtText }}</span>
      </div>
      <div class="chapter-content__status-actions">
        <span class="chapter-content__switch-label">自动保存</span>
        <a-switch v-model:checked="autoSaveEnabled" size="small"/>
        <a-button type="primary" size="small" :disabled="!canSave" @click="handleManualSave">
          保存
        </a-button>
      </div>
    </div>
    <a-spin :spinning="loading" wrapper-class-name="chapter-content__spin">
      <Editor v-model="chapterContent" @change="handleEditorSave"/>
    </a-spin>
  </div>
</template>

<style scoped>
.chapter-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chapter-content__status {
  flex-shrink: 0;
  min-width: 800px;
  padding: 8px 15px 10px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: v-bind('token.colorTextTertiary');
  font-size: 12px;
}

.chapter-content__status-meta,
.chapter-content__status-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chapter-content__status-meta {
  white-space: nowrap;
}

.chapter-content__status-actions {
  margin-left: auto;
}

.chapter-content__switch-label {
  color: v-bind('token.colorTextSecondary');
}

:deep(.chapter-content__spin) {
  flex: 1;
  min-height: 0;
}

:deep(.chapter-content__spin .ant-spin-container) {
  height: 100%;
}
</style>
