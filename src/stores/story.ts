import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import {getStoryById, type StoryMetaItem} from '@api/story/story.ts'

export const useStoryStore = defineStore('story', () => {
  const currentStoryId = ref('')
  const currentStory = ref<StoryMetaItem | null>(null)
  const loading = ref(false)

  const hasStory = computed(() => !!currentStory.value)

  async function fetchCurrentStory(storyId?: string): Promise<StoryMetaItem | null> {
    const nextStoryId = storyId ?? currentStoryId.value

    if (!nextStoryId) {
      currentStoryId.value = ''
      currentStory.value = null
      return null
    }

    currentStoryId.value = nextStoryId
    loading.value = true
    try {
      const story = await getStoryById(nextStoryId)
      currentStory.value = story
      return story
    } finally {
      loading.value = false
    }
  }

  function setCurrentStory(story: StoryMetaItem | null) {
    currentStory.value = story
    currentStoryId.value = story?.id || ''
  }

  function clearCurrentStory() {
    currentStoryId.value = ''
    currentStory.value = null
  }

  return {
    currentStoryId,
    currentStory,
    loading,
    hasStory,
    fetchCurrentStory,
    setCurrentStory,
    clearCurrentStory,
  }
})
