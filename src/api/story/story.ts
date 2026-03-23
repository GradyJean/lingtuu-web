import appApi from '@api/base'
import type {PageInput, PageResult} from '@api/base/types.ts'

export type StoryType = 'ALL' | 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO'
export type StoryStatus = 'ALL' | 'DRAFT' | 'WRITING' | 'COMPLETED'
export type StoryPerspective = 'FIRST' | 'THIRD'
export type StoryTargetReader = 'FEMALE' | 'MALE' | 'ALL'

export interface StoryItem {
    id: string
    title: string
    status: Exclude<StoryStatus, 'ALL'>
    type: Exclude<StoryType, 'ALL'>
    createdAt: string
    updatedAt: string
}

export interface StoryMetaItem {
    id: string
    title: string
    tags?: string[]
    outline?: string
    type: Exclude<StoryType, 'ALL'>
    perspective: StoryPerspective
    targetReader: StoryTargetReader
    status: Exclude<StoryStatus, 'ALL'>
}

export interface StoryListParams extends PageInput {
    title?: string
    status?: StoryStatus
    type?: StoryType
}

export interface CreateStoryParams {
    title: string
    type: Exclude<StoryType, 'ALL'>
    perspective: StoryPerspective
    targetReader: StoryTargetReader
}

export interface UpdateStoryParams {
    id: string
    title?: string
    tags?: string[]
    outline?: string
    type?: Exclude<StoryType, 'ALL'>
    perspective?: StoryPerspective
    targetReader?: StoryTargetReader
    status?: Exclude<StoryStatus, 'ALL'>
}

/**
 * 分页获取作品列表
 */
export function getStoryList(params: StoryListParams) {
    return appApi.get<PageResult<StoryItem>>('/api/story', params)
}

/**
 * 根据 ID 获取作品详情
 */
export function getStoryById(id: string) {
    return appApi.get<StoryMetaItem>(`/api/story/${id}`)
}

/**
 * 创建作品
 */
export function createStory(data: CreateStoryParams) {
    return appApi.put<StoryItem>('/api/story', data)
}

/**
 * 更新作品
 */
export function updateStory(data: UpdateStoryParams) {
    return appApi.post<boolean>(`/api/story/${data.id}`, data)
}

/**
 * 删除作品
 */
export function deleteStory(id: string) {
    return appApi.delete<boolean>(`/api/story/${id}`)
}
