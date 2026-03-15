<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import WorkContainer from '@components/container/WorkContainer.vue'
import {uiStateStore} from '@stores/ui.ts'
import MenuBar from '@components/menu/MenuBar.vue'
import MenuItem from '@components/menu/MenuItem.vue'
import WorkspaceLayout from "@components/layout/WorkspaceLayout.vue";
import Header from "@components/Header.vue";
import Footer from "@components/Footer.vue";
import Editor from "@components/editor/Editor.vue";
import type {JSONContent} from '@tiptap/vue-3'
import ChapterList from '@views/story/ChapterList.vue'
import type {ChapterItem} from '@api/story/chapter.ts'
import {useRoute} from 'vue-router'
import {useStoryStore} from '@stores/story.ts'
import {ArrowLeftOutlined} from '@ant-design/icons-vue'
import router from '../../router'

const uiStore = uiStateStore()
const storyStore = useStoryStore()
const route = useRoute()
const chapterContent = ref('<h1>第一章</h1><p></p>')
const currentChapter = ref<ChapterItem | null>(null)

const storyId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const headerTitle = computed(() => {
  if (currentChapter.value?.title) {
    return currentChapter.value.title
  }
  if (storyStore.currentStory?.title) {
    return storyStore.currentStory.title
  }
  return '章节编辑'
})

function menuActive(iconKey: string, isActive: boolean): void {
  let windowPosition: 'left' | 'right' = 'left'
  switch (iconKey) {
    case 'project':
      windowPosition = 'left'
      break
    case 'database':
      windowPosition = 'right'
  }
  uiStore.windowShow(windowPosition, isActive)
}

function handleEditorSave(payload: { html: string; text: string; json: JSONContent }): void {
  console.log('editor save payload', payload)
}

function handleChapterSelect(chapter: ChapterItem): void {
  currentChapter.value = chapter
  chapterContent.value = `<h1>${chapter.title}</h1><p></p>`
}

function handleBack(): void {
  router.push({name: 'story'})
}

watch(storyId, () => {
  currentChapter.value = null
  if (!storyId.value) {
    storyStore.clearCurrentStory()
    return
  }
  void storyStore.fetchCurrentStory(storyId.value)
}, {immediate: true})
</script>

<template>
  <WorkspaceLayout>
    <template #header>
      <Header>
        <template #header-left>
          <div class="chapter-header">
            <a-button type="text" size="small" @click="handleBack">
              <template #icon>
                <ArrowLeftOutlined/>
              </template>
              返回作品管理
            </a-button>
            <span class="chapter-header__title">{{ headerTitle }}</span>
          </div>
        </template>
      </Header>
    </template>
    <template #footer>
      <Footer/>
    </template>
    <template #left-side>
      <MenuBar>
        <MenuItem icon-name="folder" menu-key="chapter" tips="章节管理" :default-active="true" @active="menuActive"/>
      </MenuBar>
    </template>
    <template #right-side>
      <MenuBar>
        <MenuItem icon-name="database" menu-key="database" tips="资料库" :default-active="true" @active="menuActive"/>
      </MenuBar>
    </template>
    <template #main>
      <WorkContainer>
        <template #left>
          <ChapterList :story-id="storyId" @select="handleChapterSelect"/>
        </template>
        <template #center>
          <Editor v-model="chapterContent" @save="handleEditorSave"/>
        </template>
        <template #right>
          right
        </template>
      </WorkContainer>
    </template>
  </WorkspaceLayout>
</template>

<style scoped>
.chapter-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-header__title {
  font-size: 16px;
  font-weight: 600;
}
</style>
