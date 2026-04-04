import appApi from '@api/base'

export interface StoryTagOptionItem {
    key: string
    values: string[]
}

/**
 * 获取标签选项
 */
export function getStoryTagOptions(key: string): Promise<StoryTagOptionItem[]> {
    return appApi.get<StoryTagOptionItem[]>(`/api/story/tag/${key}`)
}
