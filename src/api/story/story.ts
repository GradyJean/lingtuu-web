import appApi from '@api/base'
import type {PageInput, PageResult} from '@api/base/types.ts'

export type StoryType = 'ALL' | 'SCRIPT' | 'SHORT' | 'LONG' | 'VIDEO'
export type StoryStatus = 'ALL' | 'DRAFT' | 'WRITING' | 'COMPLETED'
export type StoryPerspective = 'FIRST' | 'THIRD'
export type StoryTargetReader = 'FEMALE' | 'MALE' | 'ALL'
export const storyTypeValues: Exclude<StoryType, 'ALL'>[] = ['SHORT', 'LONG', 'SCRIPT', 'VIDEO']
export const storyStatusValues: Exclude<StoryStatus, 'ALL'>[] = ['DRAFT', 'WRITING', 'COMPLETED']
export const storyPerspectiveValues: StoryPerspective[] = ['FIRST', 'THIRD']
export const storyTargetReaderValues: StoryTargetReader[] = ['FEMALE', 'MALE', 'ALL']
export const storyTypeLabelMap: Record<Exclude<StoryType, 'ALL'>, string> = {
    SHORT: '短篇',
    LONG: '长篇',
    SCRIPT: '剧本',
    VIDEO: '视频',
}
export const storyStatusLabelMap: Record<Exclude<StoryStatus, 'ALL'>, string> = {
    DRAFT: '草稿',
    WRITING: '连载中',
    COMPLETED: '已完结',
}
export const storyPerspectiveLabelMap: Record<StoryPerspective, string> = {
    FIRST: '第一人称',
    THIRD: '第三人称',
}
export const storyTargetReaderLabelMap: Record<StoryTargetReader, string> = {
    FEMALE: '女频',
    MALE: '男频',
    ALL: '通用',
}
export type StoryTypeKey = keyof typeof storyTypeLabelMap | 'ALL'

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
export function getStoryList(params: StoryListParams): Promise<PageResult<StoryItem>> {
    return appApi.get<PageResult<StoryItem>>('/api/story', params)
}

/**
 * 根据 ID 获取作品详情
 */
export function getStoryById(id: string): Promise<StoryMetaItem> {
    return appApi.get<StoryMetaItem>(`/api/story/${id}`)
}

/**
 * 创建作品
 */
export function createStory(data: CreateStoryParams): Promise<StoryItem> {
    return appApi.put<StoryItem>('/api/story', data)
}

/**
 * 更新作品
 */
export function updateStory(id: string, data: UpdateStoryParams): Promise<boolean> {
    return appApi.post<boolean>(`/api/story/${id}`, data)
}

/**
 * 删除作品
 */
export function deleteStory(id: string): Promise<boolean> {
    return appApi.delete<boolean>(`/api/story/${id}`)
}
