<script setup lang="ts">
import {computed, reactive, ref, watch} from 'vue'
import {theme} from 'ant-design-vue'
import {BulbOutlined, CheckOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons-vue'
import {useRoute} from 'vue-router'
import {
  createStoryCharacter,
  deleteStoryCharacter,
  getStoryCharacterList,
  getStoryCharacterTagOptions,
  type StoryCharacterItem,
  type StoryCharacterTagOptionItem,
  updateStoryCharacter,
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
const deleteSubmitting = ref(false)
const characterListLoading = ref(false)
const characterList = ref<StoryCharacterItem[]>([])
const tagOptionLoading = ref(false)
const tagOptions = ref<StoryCharacterTagOptionItem[]>([])
const tagDraftRows = ref<TagDraftRow[]>([])
const editingCharacterId = ref('')
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

async function fetchCharacterList(): Promise<void> {
  if (!storyId.value) {
    characterList.value = []
    return
  }

  characterListLoading.value = true
  try {
    const page = await getStoryCharacterList(storyId.value, {
      page: 1,
      size: 2000,
    })
    characterList.value = page.list
  } finally {
    characterListLoading.value = false
  }
}

async function openCreateModal(): Promise<void> {
  resetCreateForm()
  editingCharacterId.value = ''
  createModalOpen.value = true
  await ensureTagOptionsLoaded()
}

async function openEditModal(character: StoryCharacterItem): Promise<void> {
  createForm.name = character.name
  createForm.description = character.description ?? ''
  createForm.tags = [...(character.tags ?? [])]
  tagDraftRows.value = []
  editingCharacterId.value = character.id
  createModalOpen.value = true
  await ensureTagOptionsLoaded()
}

function handleCreateCharacter(): void {
  if (!storyId.value) {
    return
  }
  void openCreateModal()
}

function handleAiGenerate(): void {
  console.log('open ai generate dialog')
}

function handleEditCharacter(character: StoryCharacterItem): void {
  void openEditModal(character)
}

const modalTitle = computed(() => editingCharacterId.value ? '编辑角色' : '新建角色')
const modalOkText = computed(() => editingCharacterId.value ? '保存' : '创建')
const roleTagValues = computed(() => {
  const roleOption = tagOptions.value.find((item) => item.key === '角色')
  return roleOption?.values ?? []
})

function resolveCharacterRole(character: StoryCharacterItem): string {
  const tags = character.tags ?? []
  const roleTag = tags.find((tag) => tag.startsWith('角色:') || tag.startsWith('角色：'))
  if (!roleTag) {
    return ''
  }
  const [, value = ''] = roleTag.split(/[:：]/)
  return value.trim()
}

function resolveCharacterGender(character: StoryCharacterItem): string {
  const tags = character.tags ?? []
  const genderTag = tags.find((tag) => tag.startsWith('性别:') || tag.startsWith('性别：'))
  if (!genderTag) {
    return ''
  }
  const [, value = ''] = genderTag.split(/[:：]/)
  return value.trim()
}

function resolveCharacterColor(character: StoryCharacterItem): string {
  const gender = resolveCharacterGender(character)
  if (gender === '男') {
    return 'blue'
  }
  if (gender === '女') {
    return 'pink'
  }
  return 'green'
}

const groupedCharacterList = computed(() => {
  const groupMap = new Map<string, StoryCharacterItem[]>()
  const ungrouped: StoryCharacterItem[] = []

  for (const character of characterList.value) {
    const role = resolveCharacterRole(character)
    if (!role || !roleTagValues.value.includes(role)) {
      ungrouped.push(character)
      continue
    }
    const list = groupMap.get(role) ?? []
    list.push(character)
    groupMap.set(role, list)
  }

  const groups = roleTagValues.value
    .map((role) => ({
      key: role,
      title: role,
      list: groupMap.get(role) ?? [],
    }))
    .filter((group) => group.list.length > 0)

  return {
    groups,
    ungrouped,
  }
})

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
    const payload = {
      name,
      description: createForm.description.trim() || undefined,
      tags: createForm.tags.length ? createForm.tags : undefined,
    }

    if (editingCharacterId.value) {
      await updateStoryCharacter(storyId.value, editingCharacterId.value, payload)
    } else {
      await createStoryCharacter(storyId.value, payload)
    }

    await fetchCharacterList()
    createModalOpen.value = false
  } finally {
    createSubmitting.value = false
  }
}

async function handleDeleteCharacter(): Promise<void> {
  if (!storyId.value || !editingCharacterId.value || deleteSubmitting.value) {
    return
  }

  deleteSubmitting.value = true
  try {
    await deleteStoryCharacter(storyId.value, editingCharacterId.value)
    await fetchCharacterList()
    createModalOpen.value = false
  } finally {
    deleteSubmitting.value = false
  }
}

watch(
  () => storyId.value,
  () => {
    void fetchCharacterList()
    void ensureTagOptionsLoaded()
  },
  {immediate: true}
)
</script>

<template>
  <div class="character-panel">
    <div class="character-panel__toolbar">
      <span class="character-panel__title-text">角色</span>
      <div class="character-panel__actions">
        <a-button type="primary"  size="small" @click="handleAiGenerate">
          <template #icon>
            <BulbOutlined/>
          </template>
          AI生成
        </a-button>
        <a-button type="primary" size="small" @click="handleCreateCharacter">
          <template #icon>
            <PlusOutlined/>
          </template>
          新建
        </a-button>
      </div>
    </div>

    <div class="character-panel__content">
      <a-spin :spinning="characterListLoading">
        <div v-if="characterList.length" class="character-content">
          <section
            v-for="group in groupedCharacterList.groups"
            :key="group.key"
            class="character-group"
          >
            <div class="character-group__title">{{ group.title }}</div>
            <div class="character-list">
              <a-tag
                v-for="character in group.list"
                :key="character.id"
                :color="resolveCharacterColor(character)"
                class="character-list__tag"
                @click="handleEditCharacter(character)"
              >
                {{ character.name }}
              </a-tag>
            </div>
          </section>

          <div v-if="groupedCharacterList.ungrouped.length" class="character-list">
            <a-tag
              v-for="character in groupedCharacterList.ungrouped"
              :key="character.id"
              :color="resolveCharacterColor(character)"
              class="character-list__tag"
              @click="handleEditCharacter(character)"
            >
              {{ character.name }}
            </a-tag>
          </div>
        </div>
        <a-empty v-else description="暂无角色" />
      </a-spin>
    </div>

    <a-modal
        v-model:open="createModalOpen"
        :title="modalTitle"
        :ok-text="modalOkText"
        cancel-text="取消"
        :confirm-loading="createSubmitting"
        @ok="handleCreateSubmit"
    >
      <template #footer>
        <div class="character-modal__footer">
          <a-popconfirm
            v-if="editingCharacterId"
            title="确定删除这个角色吗？"
            ok-text="删除"
            cancel-text="取消"
            @confirm="handleDeleteCharacter"
          >
            <a-button  danger :loading="deleteSubmitting">删除</a-button>
          </a-popconfirm>
          <div class="character-modal__footer-right">
            <a-button @click="createModalOpen = false">取消</a-button>
            <a-button type="primary" :loading="createSubmitting" @click="handleCreateSubmit">
              {{ modalOkText }}
            </a-button>
          </div>
        </div>
      </template>

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
  width: 100%;
  min-width: 290px;
  background: v-bind('token.colorBgContainer');
  display: flex;
  flex-direction: column;
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

.character-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.character-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.character-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.character-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.character-group__title {
  font-size: 12px;
  font-weight: 600;
  color: v-bind('token.colorTextSecondary');
}

.character-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.character-list__tag {
  margin: 0;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  font-size: 13px;
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

.character-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.character-modal__footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
