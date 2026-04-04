<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue'
import {theme, message} from 'ant-design-vue'
import {useRoute} from 'vue-router'
import {useStoryStore} from '@stores/story.ts'
import {
  storyPerspectiveLabelMap,
  storyPerspectiveValues,
  storyStatusLabelMap,
  storyStatusValues,
  storyTargetReaderLabelMap,
  storyTargetReaderValues,
  storyTypeLabelMap,
  storyTypeValues,
  updateStory,
  type StoryMetaItem,
  type StoryPerspective,
  type StoryStatus,
  type StoryTargetReader,
  type StoryType,
} from '@api/story/story.ts'
import {getStoryTagOptions, type StoryTagOptionItem} from '@api/story/tagOption.ts'
import {PlusOutlined} from '@ant-design/icons-vue'

const {token} = theme.useToken()
const route = useRoute()
const storyStore = useStoryStore()

const storyId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const currentStory = computed(() => storyStore.currentStory)
const saving = ref(false)
const tagModalOpen = ref(false)
const tagOptionLoading = ref(false)
const tagOptions = ref<StoryTagOptionItem[]>([])
const selectedTagMap = reactive<Record<string, string[]>>({})

const tagLimitMap: Record<string, number> = {
  题材: 1,
  时空: 1,
  情节: 3,
  情绪: 3,
}

const formState = reactive({
  title: '',
  type: 'SHORT' as Exclude<StoryType, 'ALL'>,
  status: 'DRAFT' as Exclude<StoryStatus, 'ALL'>,
  perspective: 'THIRD' as StoryPerspective,
  targetReader: 'ALL' as StoryTargetReader,
  tags: [] as string[],
  outline: '',
})

const typeOptions = storyTypeValues.map((value) => ({
  value,
  label: storyTypeLabelMap[value],
}))

const statusOptions = storyStatusValues.map((value) => ({
  value,
  label: storyStatusLabelMap[value],
}))

const perspectiveOptions = storyPerspectiveValues.map((value) => ({
  value,
  label: storyPerspectiveLabelMap[value],
}))

const targetReaderOptions = storyTargetReaderValues.map((value) => ({
  value,
  label: storyTargetReaderLabelMap[value],
}))

function applyStoryToForm(story: StoryMetaItem | null): void {
  if (!story) {
    formState.title = ''
    formState.type = 'SHORT'
    formState.status = 'DRAFT'
    formState.perspective = 'THIRD'
    formState.targetReader = 'ALL'
    formState.tags = []
    formState.outline = ''
    return
  }

  formState.title = story.title ?? ''
  formState.type = story.type
  formState.status = story.status
  formState.perspective = story.perspective
  formState.targetReader = story.targetReader
  formState.tags = [...(story.tags ?? [])]
  formState.outline = story.outline ?? ''
}

watch(
    () => currentStory.value,
    (story) => {
      applyStoryToForm(story)
    },
    {immediate: true}
)

const saveDisabled = computed(() => !storyId.value || !formState.title.trim() || saving.value)

function parsePresetTag(tag: string): { key: string; value: string } | null {
  const [key = '', value = ''] = tag.split(':')
  if (!key || !value) {
    return null
  }
  return {
    key: key.trim(),
    value: value.trim(),
  }
}

function getTagLimit(key: string): number {
  return tagLimitMap[key] ?? 3
}

async function ensureTagOptionsLoaded(): Promise<void> {
  if (tagOptionLoading.value || tagOptions.value.length > 0) {
    return
  }
  tagOptionLoading.value = true
  try {
    tagOptions.value = await getStoryTagOptions('story_tag_option')
  } finally {
    tagOptionLoading.value = false
  }
}

function resetSelectedTagMap(): void {
  for (const key of Object.keys(selectedTagMap)) {
    delete selectedTagMap[key]
  }

  const optionMap = new Map(tagOptions.value.map((option) => [option.key, new Set(option.values)]))
  for (const tag of formState.tags) {
    const parsed = parsePresetTag(tag)
    if (!parsed) {
      continue
    }
    const allowedValues = optionMap.get(parsed.key)
    if (!allowedValues?.has(parsed.value)) {
      continue
    }
    const list = selectedTagMap[parsed.key] ?? []
    if (!list.includes(parsed.value)) {
      list.push(parsed.value)
      selectedTagMap[parsed.key] = list
    }
  }
}

function toggleTagSelection(key: string, value: string): void {
  const current = selectedTagMap[key] ?? []
  if (current.includes(value)) {
    selectedTagMap[key] = current.filter((item) => item !== value)
    return
  }

  if (current.length >= getTagLimit(key)) {
    message.warning(`${key}最多选择 ${getTagLimit(key)} 个`)
    return
  }
  selectedTagMap[key] = [...current, value]
}

function isTagSelected(key: string, value: string): boolean {
  return (selectedTagMap[key] ?? []).includes(value)
}

function getSelectedCount(key: string): number {
  return selectedTagMap[key]?.length ?? 0
}

async function handleOpenTagModal(): Promise<void> {
  tagModalOpen.value = true
  await ensureTagOptionsLoaded()
  resetSelectedTagMap()
}

function handleTagModalConfirm(): void {
  const optionKeySet = new Set(tagOptions.value.map((option) => option.key))
  const preservedTags = formState.tags.filter((tag) => {
    const parsed = parsePresetTag(tag)
    return !parsed || !optionKeySet.has(parsed.key)
  })

  const selectedTags: string[] = []
  for (const option of tagOptions.value) {
    const values = selectedTagMap[option.key] ?? []
    for (const value of values) {
      selectedTags.push(`${option.key}:${value}`)
    }
  }

  formState.tags = [...selectedTags, ...preservedTags]
  tagModalOpen.value = false
}

async function handleSave(): Promise<void> {
  if (saveDisabled.value || !storyId.value || !currentStory.value) {
    return
  }

  saving.value = true
  try {
    await updateStory(storyId.value, {
      title: formState.title.trim(),
      type: formState.type,
      status: formState.status,
      perspective: formState.perspective,
      targetReader: formState.targetReader,
      tags: formState.tags.length ? formState.tags : [],
      outline: formState.outline.trim(),
    })

    storyStore.setCurrentStory({
      ...currentStory.value,
      title: formState.title.trim(),
      type: formState.type,
      status: formState.status,
      perspective: formState.perspective,
      targetReader: formState.targetReader,
      tags: [...formState.tags],
      outline: formState.outline.trim(),
    })
    message.success('作品属性已保存')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="story-property-panel">
    <div class="story-property-panel__toolbar">
      <span class="story-property-panel__title-text">属性设定</span>
      <div class="story-property-panel__toolbar-actions">
        <a-select
            v-model:value="formState.status"
            size="small"
            class="story-property-panel__status-select"
            :options="statusOptions"
        />
        <a-button type="primary" size="small" :loading="saving" :disabled="saveDisabled" @click="handleSave">
          保存
        </a-button>
      </div>
    </div>

    <div class="story-property-panel__content">
      <a-form layout="vertical">
        <a-form-item label="作品标题" required>
          <a-input size="small" v-model:value="formState.title" :maxlength="200" placeholder="请输入作品标题"/>
        </a-form-item>

        <div class="story-property-panel__triple-row">
          <a-form-item class="story-property-panel__triple-item" label="作品类型">
            <a-select size="small" v-model:value="formState.type" :options="typeOptions"/>
          </a-form-item>
          <a-form-item class="story-property-panel__triple-item" label="视角">
            <a-select size="small" v-model:value="formState.perspective" :options="perspectiveOptions"/>
          </a-form-item>
          <a-form-item class="story-property-panel__triple-item" label="目标读者">
            <a-select size="small" v-model:value="formState.targetReader" :options="targetReaderOptions"/>
          </a-form-item>
        </div>

        <a-form-item>
          <template #label>
              <span class="story-property-panel__tag-label">
                <span>标签</span>
                <a-button type="primary" class="story-property-panel__tag-add-btn" @click="handleOpenTagModal">
                  <template #icon>
                    <PlusOutlined/>
                  </template>
              </a-button>
            </span>
          </template>
          <a-select
              v-model:value="formState.tags"
              mode="tags"
              :max-tag-count="4"
              placeholder="输入后回车添加标签"
              :token-separators="[',', '，']"
          />
        </a-form-item>

        <a-form-item label="作品大纲">
          <a-textarea
              v-model:value="formState.outline"
              :rows="6"
              :maxlength="5000"
              placeholder="请输入作品大纲"
              show-count
          />
        </a-form-item>
      </a-form>
    </div>

    <a-modal
      v-model:open="tagModalOpen"
      title="标签"
      width="980px"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleTagModalConfirm"
    >
      <a-spin :spinning="tagOptionLoading">
        <div class="story-property-panel__tag-picker">
          <section
            v-for="option in tagOptions"
            :key="option.key"
            class="story-property-panel__tag-picker-section"
          >
            <div class="story-property-panel__tag-picker-header">
              <span class="story-property-panel__tag-picker-title">{{ option.key }}</span>
              <span class="story-property-panel__tag-picker-count">
                {{ getSelectedCount(option.key) }} / {{ getTagLimit(option.key) }}
              </span>
            </div>
            <div class="story-property-panel__tag-picker-values">
              <a-tag
                v-for="value in option.values"
                :key="value"
                class="story-property-panel__tag-chip"
                :color="isTagSelected(option.key, value) ? 'orange' : ''"
                @click="toggleTagSelection(option.key, value)"
              >
                {{ value }}
              </a-tag>
            </div>
          </section>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<style scoped>
.story-property-panel {
  height: 100%;
  width: 100%;
  min-width: 290px;
  background: v-bind('token.colorBgContainer');
  display: flex;
  flex-direction: column;
}

.story-property-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
}

.story-property-panel__title-text {
  font-size: 15px;
  font-weight: 600;
  color: v-bind('token.colorText');
}

.story-property-panel__toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.story-property-panel__status-select {
  width: 70px;
}

.story-property-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.story-property-panel__triple-row {
  display: flex;
  gap: 3px;
}

.story-property-panel__triple-item {
  flex: 1;
  min-width: 0;
}

.story-property-panel__tag-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.story-property-panel__tag-add-btn {
  width: 23px;
  min-width: 23px;
  height: 23px;
  min-height: 23px;
  padding: 0;
}

:deep(.story-property-panel__tag-add-btn .ant-btn-icon) {
  margin-inline-end: 0;
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.story-property-panel__tag-picker {
  max-height: 560px;
  overflow-y: auto;
  padding-right: 6px;
}

.story-property-panel__tag-picker-section {
  margin-bottom: 16px;
}

.story-property-panel__tag-picker-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.story-property-panel__tag-picker-title {
  font-size: 14px;
  font-weight: 500;
  color: v-bind('token.colorText');
}

.story-property-panel__tag-picker-count {
  color: v-bind('token.colorTextDescription');
  font-size: 13px;
  font-weight: 500;
}

.story-property-panel__tag-picker-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.story-property-panel__tag-chip {
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  margin: 0;
}

@media (max-width: 900px) {
  .story-property-panel__triple-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
