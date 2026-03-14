import appApi from '@api/base'
import type {PageInput, PageResult} from '@api/base/types.ts'

// ==================== Story 相关类型 ====================

export interface StoryItem {
    id: string
    title: string
    status: string
    type: string
    createdAt: string
    updatedAt: string
}

export interface StoryListParams extends PageInput {
    title?: string,
    status?: 'DRAFT' | 'WRITING' | 'COMPLETED' | 'ALL,'
    type?: 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO' | 'ALL'
}

/**
 * 分页获取故事列表
 */
export function getStoryList(params: StoryListParams) {
    return appApi.get<PageResult<StoryItem>>('/api/story', params)
}

/**
 * 根据 ID 获取故事详情
 */
export function getStoryById(id: string) {
    return appApi.get<StoryItem>(`/api/story/${id}`)
}

/**
 * 创建故事
 */
export function createStory(data: {
    title: string
    type: 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO'
    perspective: 'FIRST' | 'THIRD'
    targetReader: 'FEMALE' | 'MALE' | 'ALL'
}) {
    return appApi.put<StoryItem>('/api/story', data)
}

/**
 * 更新故事
 */
export function updateStory(data: {
    id: string
    title?: string
    tags?: string[]
    outline?: string
    type?: 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO'
    perspective?: 'FIRST' | 'THIRD'
    targetReader?: 'FEMALE' | 'MALE' | 'ALL'
    status?: 'DRAFT' | 'WRITING' | 'COMPLETED'
}) {
    return appApi.post<StoryItem>('/api/story', data)
}

/**
 * 删除故事
 */
export function deleteStory(id: string) {
    return appApi.delete<null>(`/api/story/${id}`)
}
