import request from '../utils/request'
import type {PageInput, PageResult, ApiResult} from './types'

// ==================== Story 相关类型 ====================

export interface StoryItem {
    id: string
    title: string
    status: string
    type: string
    created_at: string
    updated_at: string
}

export interface StoryListParams extends PageInput {
    title?: string,
    status?: 'DRAFT' | 'WRITING' | 'COMPLETED' | 'ALL,'
    type?: 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO' | 'ALL'
}

export type StoryListResult = ApiResult<PageResult<StoryItem>>

/**
 * 分页获取故事列表
 */
export function getStoryList(params: StoryListParams) {
    return request.get<StoryListResult>('/api/story', {params})
}

/**
 * 根据 ID 获取故事详情
 */
export function getStoryById(id: string) {
    return request.get(`/api/story/${id}`)
}

/**
 * 创建故事
 */
export function createStory(data: {
    title: string
    type: 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO'
    perspective: 'FIRST' | 'THIRD'
    target_reader: 'FEMALE' | 'MALE' | 'ALL'
}) {
    return request.put('/api/story', data)
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
    target_reader?: 'FEMALE' | 'MALE' | 'ALL'
    status?: 'DRAFT' | 'WRITING' | 'COMPLETED'
}) {
    return request.post('/api/story', data)
}

/**
 * 删除故事
 */
export function deleteStory(id: string) {
    return request.delete(`/api/story/${id}`)
}
