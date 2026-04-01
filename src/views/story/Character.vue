<script setup lang="ts">
import {computed, ref} from 'vue'
import {theme} from 'ant-design-vue'
import {BulbOutlined, PlusOutlined, UserOutlined} from '@ant-design/icons-vue'

type CharacterItem = {
  id: string
  name: string
  tags: string[]
}

type CharacterGroup = {
  key: string
  title: string
  list: CharacterItem[]
}

const {token} = theme.useToken()

const activeCharacterId = ref('1')

const characterList = ref<CharacterItem[]>([
  {
    id: '1',
    name: '沈砚',
    tags: ['主角:男主', '性别:男', '年龄:22岁'],
  },
  {
    id: '2',
    name: '林知夏',
    tags: ['主角:女主', '性别:女', '年龄:21岁'],
  },
  {
    id: '3',
    name: '周渡',
    tags: ['配角:同伴', '性别:男'],
  },
  {
    id: '4',
    name: '贺沉',
    tags: ['反派:幕后者', '性别:男'],
  },
  {
    id: '5',
    name: '阿宁',
    tags: ['性别:女'],
  },
])

function resolveGroupTitle(tags: string[]): string {
  const preferredKeys = ['主角', '配角', '反派']

  for (const key of preferredKeys) {
    const matched = tags.find((tag) => tag.startsWith(`${key}:`))
    if (matched) {
      const value = matched.slice(key.length + 1).trim()
      return value || key
    }
  }

  return '未分类'
}

const groupedCharacters = computed<CharacterGroup[]>(() => {
  const map = new Map<string, CharacterItem[]>()

  characterList.value.forEach((item) => {
    const title = resolveGroupTitle(item.tags)
    const current = map.get(title) ?? []
    current.push(item)
    map.set(title, current)
  })

  const priorityOrder = ['男主', '女主', '主角', '配角', '反派', '未分类']

  return Array.from(map.entries())
    .map(([title, list]) => ({
      key: title,
      title,
      list,
    }))
    .sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.title)
      const bIndex = priorityOrder.indexOf(b.title)

      if (aIndex === -1 && bIndex === -1) {
        return a.title.localeCompare(b.title, 'zh-CN')
      }
      if (aIndex === -1) {
        return 1
      }
      if (bIndex === -1) {
        return -1
      }
      return aIndex - bIndex
    })
})

function handleSelectCharacter(id: string): void {
  activeCharacterId.value = id
}

function handleCreateCharacter(): void {
  console.log('open character detail drawer for create')
}

function handleOpenAi(): void {
  console.log('open character ai drawer')
}
</script>

<template>
  <div class="character-panel">
    <div class="character-panel__toolbar">
      <div class="character-panel__title">
        <span class="character-panel__title-text">角色</span>
        <span class="character-panel__count">{{ characterList.length }}</span>
      </div>
      <a-button type="primary" size="small" @click="handleCreateCharacter">
        <template #icon>
          <PlusOutlined/>
        </template>
        新建
      </a-button>
    </div>

    <div class="character-panel__content">
      <template v-if="groupedCharacters.length">
        <section
          v-for="group in groupedCharacters"
          :key="group.key"
          class="character-group"
        >
          <div class="character-group__header">
            <span class="character-group__title">{{ group.title }}</span>
            <span class="character-group__count">{{ group.list.length }}</span>
          </div>

          <div class="character-group__list">
            <button
              v-for="item in group.list"
              :key="item.id"
              type="button"
              class="character-item"
              :class="{'character-item--active': activeCharacterId === item.id}"
              @click="handleSelectCharacter(item.id)"
            >
              <UserOutlined class="character-item__icon"/>
              <span class="character-item__name">{{ item.name }}</span>
            </button>
          </div>
        </section>
      </template>

      <a-empty v-else description="暂无角色数据"/>
    </div>

    <div class="character-panel__footer">
      <div class="character-panel__footer-text">
        <div class="character-panel__footer-title">AI 辅助</div>
        <div class="character-panel__footer-desc">生成角色名与结构化候选信息</div>
      </div>
      <a-button size="small" @click="handleOpenAi">
        <template #icon>
          <BulbOutlined/>
        </template>
        打开
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.character-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.character-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.character-panel__title-text {
  font-size: 15px;
  font-weight: 600;
  color: v-bind('token.colorText');
}

.character-panel__count {
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 999px;
  background: v-bind('token.colorFillSecondary');
  color: v-bind('token.colorTextSecondary');
  font-size: 12px;
  text-align: center;
}

.character-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.character-group + .character-group {
  margin-top: 16px;
}

.character-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.character-group__title {
  font-size: 12px;
  font-weight: 600;
  color: v-bind('token.colorTextTertiary');
  letter-spacing: 0.04em;
}

.character-group__count {
  color: v-bind('token.colorTextQuaternary');
  font-size: 12px;
}

.character-group__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.character-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: v-bind('`${token.borderRadius}px`');
  background: transparent;
  color: v-bind('token.colorText');
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.character-item:hover {
  background: v-bind('token.colorBgTextHover');
  border-color: v-bind('token.colorBorderSecondary');
}

.character-item--active {
  background: v-bind('token.colorPrimaryBg');
  border-color: v-bind('token.colorPrimaryBorder');
  color: v-bind('token.colorPrimary');
}

.character-item__icon {
  font-size: 14px;
  color: inherit;
  opacity: 0.85;
}

.character-item__name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.character-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-top: 1px solid v-bind('token.colorBorderSecondary');
  background: v-bind('token.colorFillQuaternary');
}

.character-panel__footer-text {
  min-width: 0;
}

.character-panel__footer-title {
  font-size: 13px;
  font-weight: 600;
  color: v-bind('token.colorText');
}

.character-panel__footer-desc {
  margin-top: 2px;
  color: v-bind('token.colorTextSecondary');
  font-size: 12px;
  line-height: 1.4;
}
</style>
