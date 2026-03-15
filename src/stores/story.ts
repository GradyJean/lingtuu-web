import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import {getStoryById, type StoryMetaItem} from '@api/story/story.ts'
import type {ChapterItem} from '@api/story/chapter.ts'

const STORY_WORKSPACE_STORAGE_KEY = 'story:workspace'

interface StoryWorkspaceState {
  story: StoryMetaItem | null
  selectedChapterId: string
  selectedChapter: ChapterItem | null
  chapterDraftMap: Record<string, string>
  chapterPlainTextMap: Record<string, string>
  chapterSavedMap: Record<string, string>
  chapterSavedPlainTextMap: Record<string, string>
  chapterSavedAtMap: Record<string, string>
  chapterLoadStateMap: Record<string, boolean>
  chapterSaveStatusMap: Record<string, ChapterSaveStatus>
}

interface StoryWorkspaceStorage {
    currentStoryId: string
    settings: StoryWorkspaceSettings
    storyMap: Record<string, StoryWorkspaceState>
}

export type ChapterSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

interface StoryWorkspaceSettings {
    autoSaveEnabled: boolean
}

function createEmptyStoryWorkspace(): StoryWorkspaceState {
    return {
        story: null,
    selectedChapterId: '',
    selectedChapter: null,
    chapterDraftMap: {},
    chapterPlainTextMap: {},
    chapterSavedMap: {},
    chapterSavedPlainTextMap: {},
    chapterSavedAtMap: {},
    chapterLoadStateMap: {},
    chapterSaveStatusMap: {},
    }
}

function getDefaultChapterContent(chapterTitle?: string): string {
    const title = chapterTitle?.trim() || '第一章'
    return `<h1>${title}</h1><p></p>`
}

export const useStoryStore = defineStore('story', () => {
    const currentStoryId = ref('')
    const storyMap = ref<Record<string, StoryWorkspaceState>>({})
    const settings = ref<StoryWorkspaceSettings>({
        autoSaveEnabled: true,
    })
    const loading = ref(false)
    const chapterSelectionVersion = ref(0)

    const currentStoryState = computed<StoryWorkspaceState | null>(() => {
        if (!currentStoryId.value) {
            return null
        }
        return storyMap.value[currentStoryId.value] ?? null
    })

    const currentStory = computed(() => currentStoryState.value?.story ?? null)
    const currentChapter = computed(() => currentStoryState.value?.selectedChapter ?? null)
    const currentSelectedChapterId = computed(() => currentStoryState.value?.selectedChapterId ?? '')
    const currentChapterSaveStatus = computed<ChapterSaveStatus>(() => {
        const chapterId = currentSelectedChapterId.value
        if (!chapterId) {
            return 'idle'
        }
        return currentStoryState.value?.chapterSaveStatusMap[chapterId] ?? 'idle'
    })
    const currentChapterLastSavedAt = computed(() => {
        const chapterId = currentSelectedChapterId.value
        if (!chapterId) {
            return ''
        }
        return currentStoryState.value?.chapterSavedAtMap[chapterId] ?? ''
    })
    const currentChapterContent = computed(() => {
        const chapter = currentChapter.value
        const storyState = currentStoryState.value

        if (!chapter || !storyState) {
            return getDefaultChapterContent()
        }

        return storyState.chapterDraftMap[chapter.id] ?? getDefaultChapterContent(chapter.title)
    })
    const hasStory = computed(() => !!currentStory.value)

    function saveToStorage() {
        localStorage.setItem(STORY_WORKSPACE_STORAGE_KEY, JSON.stringify({
            currentStoryId: currentStoryId.value,
            settings: settings.value,
            storyMap: storyMap.value,
        } satisfies StoryWorkspaceStorage))
    }

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORY_WORKSPACE_STORAGE_KEY)
            if (!raw) {
                return
            }

            const parsed = JSON.parse(raw) as Partial<StoryWorkspaceStorage>
            currentStoryId.value = typeof parsed.currentStoryId === 'string' ? parsed.currentStoryId : ''
            settings.value = {
                autoSaveEnabled: parsed.settings?.autoSaveEnabled ?? true,
            }
            storyMap.value = parsed.storyMap && typeof parsed.storyMap === 'object' ? parsed.storyMap : {}
        } catch (error) {
            currentStoryId.value = ''
            settings.value = {
                autoSaveEnabled: true,
            }
            storyMap.value = {}
        }
    }

    function setAutoSaveEnabled(enabled: boolean) {
        settings.value.autoSaveEnabled = enabled
        saveToStorage()
    }

    function ensureStoryState(storyId: string): StoryWorkspaceState {
        const existingState = storyMap.value[storyId]
        if (existingState) {
      if (!existingState.chapterDraftMap) {
        existingState.chapterDraftMap = {}
      }
      if (!existingState.chapterPlainTextMap) {
        existingState.chapterPlainTextMap = {}
      }
      if (!existingState.chapterSavedMap) {
        existingState.chapterSavedMap = {}
      }
      if (!existingState.chapterSavedPlainTextMap) {
        existingState.chapterSavedPlainTextMap = {}
      }
      if (!existingState.chapterSavedAtMap) {
        existingState.chapterSavedAtMap = {}
      }
            if (!existingState.chapterLoadStateMap) {
                existingState.chapterLoadStateMap = {}
            }
            if (!existingState.chapterSaveStatusMap) {
                existingState.chapterSaveStatusMap = {}
            }
            return existingState
        }

        const nextState = createEmptyStoryWorkspace()
        storyMap.value = {
            ...storyMap.value,
            [storyId]: nextState,
        }
        return nextState
    }

    function setActiveStoryId(storyId: string) {
        currentStoryId.value = storyId
        if (storyId) {
            ensureStoryState(storyId)
        }
        saveToStorage()
    }

    async function fetchCurrentStory(storyId?: string): Promise<StoryMetaItem | null> {
        const nextStoryId = storyId ?? currentStoryId.value

        if (!nextStoryId) {
            currentStoryId.value = ''
            saveToStorage()
            return null
        }

        setActiveStoryId(nextStoryId)
        loading.value = true
        try {
            const story = await getStoryById(nextStoryId)
            setCurrentStory(story, nextStoryId)
            return story
        } finally {
            loading.value = false
        }
    }

    function setCurrentStory(story: StoryMetaItem | null, storyId?: string) {
        const targetStoryId = storyId ?? story?.id ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        storyState.story = story
        currentStoryId.value = targetStoryId
        saveToStorage()
    }

    function setSelectedChapter(chapter: ChapterItem | null, storyId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        storyState.selectedChapter = chapter
        storyState.selectedChapterId = chapter?.id ?? ''

        if (targetStoryId === currentStoryId.value) {
            currentStoryId.value = targetStoryId
        }

        chapterSelectionVersion.value += 1
        saveToStorage()
    }

  function setCurrentChapterContent(content: string, storyId?: string, chapterId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return
        }

        const savedContent = storyState.chapterSavedMap[targetChapterId]
    storyState.chapterDraftMap[targetChapterId] = content
    storyState.chapterSaveStatusMap[targetChapterId] = savedContent === content ? 'saved' : 'dirty'
    saveToStorage()
  }

  function setCurrentChapterPlainText(plainText: string, storyId?: string, chapterId?: string) {
    const targetStoryId = storyId ?? currentStoryId.value
    if (!targetStoryId) {
      return
    }

    const storyState = ensureStoryState(targetStoryId)
    const targetChapterId = chapterId ?? storyState.selectedChapterId
    if (!targetChapterId) {
      return
    }

    storyState.chapterPlainTextMap[targetChapterId] = plainText
    saveToStorage()
  }

  function setChapterContentFromRemote(content: string, plainText: string, savedAt?: string, storyId?: string, chapterId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return
        }

    storyState.chapterDraftMap[targetChapterId] = content
    storyState.chapterPlainTextMap[targetChapterId] = plainText
    storyState.chapterSavedMap[targetChapterId] = content
    storyState.chapterSavedPlainTextMap[targetChapterId] = plainText
    storyState.chapterSavedAtMap[targetChapterId] = savedAt ?? ''
    storyState.chapterLoadStateMap[targetChapterId] = true
    storyState.chapterSaveStatusMap[targetChapterId] = 'saved'
        saveToStorage()
    }

    function markChapterLoaded(storyId?: string, chapterId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return
        }

        storyState.chapterLoadStateMap[targetChapterId] = true
        saveToStorage()
    }

    function setChapterSaveStatus(status: ChapterSaveStatus, storyId?: string, chapterId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return
        }

        storyState.chapterSaveStatusMap[targetChapterId] = status
        saveToStorage()
    }

    function markChapterSaved(content: string, plainText: string, savedAt?: string, storyId?: string, chapterId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return
        }

        storyState.chapterDraftMap[targetChapterId] = content
        storyState.chapterPlainTextMap[targetChapterId] = plainText
        storyState.chapterSavedMap[targetChapterId] = content
        storyState.chapterSavedPlainTextMap[targetChapterId] = plainText
        storyState.chapterSavedAtMap[targetChapterId] = savedAt ?? new Date().toISOString()
        storyState.chapterLoadStateMap[targetChapterId] = true
        storyState.chapterSaveStatusMap[targetChapterId] = 'saved'
        saveToStorage()
    }

  function setChapterSavedContent(content: string, plainText: string, savedAt?: string, storyId?: string, chapterId?: string) {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return
        }

        const storyState = ensureStoryState(targetStoryId)
        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return
        }

        storyState.chapterSavedMap[targetChapterId] = content
        storyState.chapterSavedPlainTextMap[targetChapterId] = plainText
        storyState.chapterSavedAtMap[targetChapterId] = savedAt ?? ''
        storyState.chapterLoadStateMap[targetChapterId] = true
        storyState.chapterSaveStatusMap[targetChapterId] =
            storyState.chapterDraftMap[targetChapterId] === content ? 'saved' : 'dirty'
        saveToStorage()
    }

    function getChapterDraft(storyId?: string, chapterId?: string): string | undefined {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return undefined
        }

        const storyState = storyMap.value[targetStoryId]
        if (!storyState) {
            return undefined
        }

        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return undefined
        }

    return storyState.chapterDraftMap[targetChapterId]
  }

  function getChapterPlainText(storyId?: string, chapterId?: string): string | undefined {
    const targetStoryId = storyId ?? currentStoryId.value
    if (!targetStoryId) {
      return undefined
    }

    const storyState = storyMap.value[targetStoryId]
    if (!storyState) {
      return undefined
    }

    const targetChapterId = chapterId ?? storyState.selectedChapterId
    if (!targetChapterId) {
      return undefined
    }

    return storyState.chapterPlainTextMap[targetChapterId]
  }

  function getChapterSavedPlainText(storyId?: string, chapterId?: string): string | undefined {
    const targetStoryId = storyId ?? currentStoryId.value
    if (!targetStoryId) {
      return undefined
    }

    const storyState = storyMap.value[targetStoryId]
    if (!storyState) {
      return undefined
    }

    const targetChapterId = chapterId ?? storyState.selectedChapterId
    if (!targetChapterId) {
      return undefined
    }

    return storyState.chapterSavedPlainTextMap[targetChapterId]
  }

  function getChapterSavedAt(storyId?: string, chapterId?: string): string | undefined {
    const targetStoryId = storyId ?? currentStoryId.value
    if (!targetStoryId) {
      return undefined
    }

    const storyState = storyMap.value[targetStoryId]
    if (!storyState) {
      return undefined
    }

    const targetChapterId = chapterId ?? storyState.selectedChapterId
    if (!targetChapterId) {
      return undefined
    }

    return storyState.chapterSavedAtMap[targetChapterId]
  }

    function getChapterSavedContent(storyId?: string, chapterId?: string): string | undefined {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return undefined
        }

        const storyState = storyMap.value[targetStoryId]
        if (!storyState) {
            return undefined
        }

        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return undefined
        }

        return storyState.chapterSavedMap[targetChapterId]
    }

    function hasChapterDraft(storyId?: string, chapterId?: string): boolean {
        return getChapterDraft(storyId, chapterId) !== undefined
    }

    function isChapterLoaded(storyId?: string, chapterId?: string): boolean {
        const targetStoryId = storyId ?? currentStoryId.value
        if (!targetStoryId) {
            return false
        }

        const storyState = storyMap.value[targetStoryId]
        if (!storyState) {
            return false
        }

        const targetChapterId = chapterId ?? storyState.selectedChapterId
        if (!targetChapterId) {
            return false
        }

        return !!storyState.chapterLoadStateMap[targetChapterId]
    }

    function isChapterDirty(storyId?: string, chapterId?: string): boolean {
        const draft = getChapterDraft(storyId, chapterId)
        const saved = getChapterSavedContent(storyId, chapterId)
        if (draft === undefined) {
            return false
        }
        return draft !== saved
    }

    function clearCurrentStory() {
        currentStoryId.value = ''
        saveToStorage()
    }

    if (typeof window !== 'undefined') {
        loadFromStorage()
    }

    return {
        currentStoryId,
        storyMap,
        settings,
        loading,
        chapterSelectionVersion,
        hasStory,
        currentStoryState,
        currentStory,
        currentChapter,
        currentSelectedChapterId,
        currentChapterSaveStatus,
        currentChapterLastSavedAt,
        currentChapterContent,
        loadFromStorage,
        saveToStorage,
        setAutoSaveEnabled,
        setActiveStoryId,
        fetchCurrentStory,
        setCurrentStory,
    setSelectedChapter,
    setCurrentChapterContent,
    setCurrentChapterPlainText,
    setChapterContentFromRemote,
        markChapterLoaded,
        setChapterSaveStatus,
        markChapterSaved,
    setChapterSavedContent,
    getChapterDraft,
    getChapterPlainText,
    getChapterSavedContent,
    getChapterSavedPlainText,
    getChapterSavedAt,
        hasChapterDraft,
        isChapterLoaded,
        isChapterDirty,
        clearCurrentStory,
    }
})
