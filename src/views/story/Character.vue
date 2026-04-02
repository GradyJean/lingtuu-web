<script setup lang="ts">
import {computed, reactive, ref} from 'vue'
import {theme} from 'ant-design-vue'
import {CheckOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons-vue'
import {useRoute} from 'vue-router'
import {
  createStoryCharacter,
  getStoryCharacterTagOptions,
  type StoryCharacterTagOptionItem,
} from '@api/story/character.ts'

const {token} = theme.useToken()
const route = useRoute()

type TagDraftMode = 'preset' | 'custom'

interface TagDraftRow {
  id: number
  mode: TagDraftMode
  key: string
  value: string
  custom: string
}

const storyId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const createModalOpen = ref(false)
const createSubmitting = ref(false)
const tagOptionLoading = ref(false)
const tagOptions = ref<StoryCharacterTagOptionItem[]>([])
const tagDraftRows = ref<TagDraftRow[]>([])
let tagDraftSeed = 0

const createForm = reactive({
  name: '',
  description: '',
  tags: [] as string[],
})

function resetCreateForm(): void {
  createForm.name = ''
  createForm.description = ''
  createForm.tags = []
  tagDraftRows.value = []
}

async function ensureTagOptionsLoaded(): Promise<void> {
  if (tagOptionLoading.value || tagOptions.value.length > 0) {
    return
  }
  tagOptionLoading.value = true
  try {
    tagOptions.value = await getStoryCharacterTagOptions()
  } finally {
    tagOptionLoading.value = false
  }
}

function addTagDraftRow(): void {
  const firstOption = tagOptions.value[0]
  const defaultKey = firstOption?.key ?? ''
  const defaultValue = firstOption?.values?.[0] ?? ''

  tagDraftSeed += 1
  tagDraftRows.value.push({
    id: tagDraftSeed,
    mode: 'preset',
    key: defaultKey,
    value: defaultValue,
    custom: '',
  })
}

function removeTagDraftRow(id: number): void {
  tagDraftRows.value = tagDraftRows.value.filter((row) => row.id !== id)
}

function onTagDraftKeyChange(row: TagDraftRow): void {
  row.value = getValuesByKey(row.key)[0] ?? ''
}

function getValuesByKey(key: string): string[] {
  const option = tagOptions.value.find((item) => item.key === key)
  return option?.values ?? []
}

function addTagFromRow(row: TagDraftRow): void {
  const nextTag = row.mode === 'preset'
      ? `${row.key}:${row.value}`.trim()
      : row.custom.trim()

  if (!nextTag || nextTag === ':') {
    return
  }

  if (!createForm.tags.includes(nextTag)) {
    createForm.tags.push(nextTag)
  }

  removeTagDraftRow(row.id)
}

function removeTag(tag: string): void {
  createForm.tags = createForm.tags.filter((item) => item !== tag)
}

async function openCreateModal(): Promise<void> {
  resetCreateForm()
  createModalOpen.value = true
  await ensureTagOptionsLoaded()
}

function handleCreateCharacter(): void {
  if (!storyId.value) {
    return
  }
  void openCreateModal()
}

async function handleCreateSubmit(): Promise<void> {
  if (!storyId.value || createSubmitting.value) {
    return
  }

  const name = createForm.name.trim()
  if (!name) {
    return
  }

  createSubmitting.value = true
  try {
    await createStoryCharacter(storyId.value, {
      name,
      description: createForm.description.trim() || undefined,
      tags: createForm.tags.length ? createForm.tags : undefined,
    })
    createModalOpen.value = false
  } finally {
    createSubmitting.value = false
  }
}
</script>

<template>
  <div class="character-panel">
    <div class="character-panel__toolbar">
      <span class="character-panel__title-text">角色</span>
      <a-button type="primary" size="small" @click="handleCreateCharacter">
        <template #icon>
          <PlusOutlined/>
        </template>
        新建
      </a-button>
    </div>

    <a-modal
        v-model:open="createModalOpen"
        title="新建角色"
        ok-text="创建"
        cancel-text="取消"
        :confirm-loading="createSubmitting"
        @ok="handleCreateSubmit"
    >
      <a-form layout="vertical">
        <a-form-item label="角色名" required>
          <a-input v-model:value="createForm.name" :maxlength="200" placeholder="请输入角色名"/>
        </a-form-item>

        <a-form-item label="角色描述">
          <a-textarea
              v-model:value="createForm.description"
              :maxlength="5000"
              :rows="4"
              placeholder="请输入角色描述"
          />
        </a-form-item>

        <a-form-item>
          <template #label>
            <span class="tag-label">
              <span>标签</span>
              <a-button size="small" type="primary" :loading="tagOptionLoading" @click="addTagDraftRow">
               <template #icon>
                <PlusOutlined/>
               </template>
              </a-button>
            </span>
          </template>
          <div class="tag-inline">
            <a-tag
                v-for="tag in createForm.tags"
                :key="tag"
                closable
                @close.prevent="removeTag(tag)"
            >
              {{ tag }}
            </a-tag>

            <div v-for="row in tagDraftRows" :key="row.id" class="tag-row">
              <a-select v-model:value="row.mode" size="small" class="tag-row__mode">
                <a-select-option value="preset">预置</a-select-option>
                <a-select-option value="custom">自定义</a-select-option>
              </a-select>

              <template v-if="row.mode === 'preset'">
                <a-select
                    v-model:value="row.key"
                    size="small"
                    class="tag-row__key"
                    placeholder="属性"
                    @change="onTagDraftKeyChange(row)"
                >
                  <a-select-option v-for="item in tagOptions" :key="item.key" :value="item.key">
                    {{ item.key }}
                  </a-select-option>
                </a-select>
                <a-select v-model:value="row.value" size="small" class="tag-row__value" placeholder="值">
                  <a-select-option v-for="value in getValuesByKey(row.key)" :key="value" :value="value">
                    {{ value }}
                  </a-select-option>
                </a-select>
              </template>

              <a-input
                  v-else
                  v-model:value="row.custom"
                  size="small"
                  class="tag-row__custom"
                  placeholder="请输入自定义标签"
              />
              <a-button size="small" type="primary" @click="addTagFromRow(row)">
                <template #icon>
                  <CheckOutlined/>
                </template>
              </a-button>
              <a-button size="small" danger @click="removeTagDraftRow(row.id)">
                <template #icon>
                  <DeleteOutlined/>
                </template>
              </a-button>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.character-panel {
  height: 100%;
  background: v-bind('token.colorBgContainer');
}

.character-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid v-bind('token.colorBorderSecondary');
}

.character-panel__title-text {
  font-size: 15px;
  font-weight: 600;
  color: v-bind('token.colorText');
}

.tag-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.tag-inline .ant-tag) {
  height: 28px;
  line-height: 26px;
  padding: 0 10px;
  font-size: 13px;
}

.tag-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.tag-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}

.tag-row__mode {
  width: 108px;
}

.tag-row__key,
.tag-row__value {
  width: 142px;
}

.tag-row__custom {
  width: 290px;
}
</style>
