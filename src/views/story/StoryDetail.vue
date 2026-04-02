<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {theme} from 'ant-design-vue'
import WorkContainer from '@components/container/WorkContainer.vue'
import {uiStateStore} from '@stores/ui.ts'
import MenuBar from '@components/menu/MenuBar.vue'
import MenuItem from '@components/menu/MenuItem.vue'
import WorkspaceLayout from "@components/layout/WorkspaceLayout.vue";
import Header from "@components/Header.vue";
import Footer from "@components/Footer.vue";
import ChapterList from '@views/story/ChapterList.vue'
import ChapterContent from '@views/story/ChapterContent.vue'
import {getChapterList} from '@api/story/chapter.ts'
import {useRoute} from 'vue-router'
import {useStoryStore} from '@stores/story.ts'
import {ArrowLeftOutlined} from '@ant-design/icons-vue'
import {storyStatusLabelMap, storyTypeLabelMap} from '@shared-types/story'
import router from '../../router'
import Character from "@views/story/Character.vue";

const {token} = theme.useToken()
const uiStore = uiStateStore()
const storyStore = useStoryStore()
const route = useRoute()
const storyWordCount = ref(0)
const backNavigating = ref(false)

const storyId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')
const currentStory = computed(() => storyStore.currentStory)
const currentChapterLastSavedAt = computed(() => storyStore.currentChapterLastSavedAt)

const storyTypeText = computed(() => currentStory.value?.type ? storyTypeLabelMap[currentStory.value.type] : '')
const storyStatusText = computed(() => currentStory.value?.status ? storyStatusLabelMap[currentStory.value.status] : '')
const storyWordCountText = computed(() => `${storyWordCount.value.toLocaleString()} 字`)
const storyTitle = computed(() => currentStory.value?.title || '章节编辑')
type WindowPosition = 'left' | 'right'

type PageState = {
  left: {
    chapter: boolean
    character: boolean
  }
  right: {
    database: boolean
  }
}

const pageState = ref<PageState>({
  left: {
    chapter: true,
    character: false,
  },
  right: {
    database: true,
  },
})

async function fetchStoryWordCount(nextStoryId: string): Promise<void> {
  const chapterPage = await getChapterList(nextStoryId, {
    page: 1,
    size: 2000,
    order: 'desc',
  })
  storyWordCount.value = chapterPage.list.reduce((total, chapter) => total + (chapter.wordCount ?? 0), 0)
}

function menuActive(iconKey: string, isActive: boolean): void {
  let windowPosition: WindowPosition = 'left'
  switch (iconKey) {
    case 'chapter':
    case 'character':
      windowPosition = 'left'
      break
    case 'database':
      windowPosition = 'right'
      break
    default:
      return
  }

  if (windowPosition === 'left') {
    const group = pageState.value.left
    Object.keys(group).forEach((key) => {
      group[key as keyof typeof group] = key === iconKey
    })
  } else {
    const group = pageState.value.right
    Object.keys(group).forEach((key) => {
      group[key as keyof typeof group] = key === iconKey
    })
  }

  uiStore.windowShow(windowPosition, isActive)
}

async function handleBack(): Promise<void> {
  if (backNavigating.value) {
    return
  }

  backNavigating.value = true
  try {
    await router.push({name: 'story'})
  } finally {
    backNavigating.value = false
  }
}

watch(storyId, (nextStoryId) => {
  if (!nextStoryId) {
    storyStore.clearCurrentStory()
    storyWordCount.value = 0
    return
  }
  storyStore.setActiveStoryId(nextStoryId)
  void storyStore.fetchCurrentStory(nextStoryId)
  void fetchStoryWordCount(nextStoryId)
}, {immediate: true})

watch(currentChapterLastSavedAt, (savedAt) => {
  if (!savedAt || !storyId.value) {
    return
  }
  void fetchStoryWordCount(storyId.value)
})
</script>

<template>
  <WorkspaceLayout>
    <template #header>
      <Header>
        <template #header-left>
          <div class="chapter-header">
            <a-button class="chapter-header__back" type="text" size="small" :loading="backNavigating"
                      @click="handleBack">
              <template #icon>
                <ArrowLeftOutlined/>
              </template>
              返回作品
            </a-button>
            <div class="chapter-header__meta">
              <div class="chapter-header__tags">
                <a-tag color="orange">{{ storyTypeText }}</a-tag>
                <a-tag color="green">{{ storyStatusText }}</a-tag>
                <span class="chapter-header__word-count">{{ storyWordCountText }}</span>
              </div>
              <span class="chapter-header__divider"/>
              <span class="chapter-header__title">{{ storyTitle }}</span>
            </div>
          </div>
        </template>
      </Header>
    </template>
    <template #footer>
      <Footer/>
    </template>
    <template #left-side>
      <MenuBar>
        <MenuItem icon-name="strategy" menu-key="word" tips="背景管理" :default-active="true" @active="menuActive"/>
        <MenuItem icon-name="work-plan" menu-key="chapter" tips="章节管理" :default-active="true" @active="menuActive"/>
        <MenuItem icon-name="contact" menu-key="character" tips="角色管理" @active="menuActive"/>
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
          <ChapterList v-if="pageState.left.chapter"/>
          <Character v-if="pageState.left.character"/>
        </template>
        <template #center>
          <ChapterContent/>
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

.chapter-header__back {
  border: 1px solid v-bind('token.colorBorderSecondary');
  border-radius: v-bind('`${token.borderRadiusSM}px`');
  background: v-bind('token.colorBgContainer');
  color: v-bind('token.colorTextSecondary');
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.chapter-header__back:hover {
  border-color: v-bind('token.colorPrimary');
  background: v-bind('token.colorBgTextHover');
  color: v-bind('token.colorPrimary');
}

.chapter-header__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.chapter-header__title {
  font-size: 16px;
  font-weight: 600;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chapter-header__tags {
  display: flex;
  margin: 0 10px 0 10px;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.chapter-header__word-count {
  min-width: 80px;
  color: v-bind('token.colorTextSecondary');
  font-size: 13px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.chapter-header__divider {
  width: 2px;
  height: 30px;
  background: v-bind('token.colorBorderSecondary');
  flex-shrink: 0;
}
</style>
