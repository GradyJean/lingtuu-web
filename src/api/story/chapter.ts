import appApi from '@api/base'
import type {PageInput, PageResult} from '@api/base/types.ts'

export type ChapterType = 'VOLUME' | 'CHAPTER'
export type ChapterStatus = 'DRAFT' | 'WRITING' | 'COMPLETED'

export interface ChapterItem {
    id: string
    storyId: string
    parentId?: string | null
    title: string
    type: ChapterType
    sortOrder?: number | null
    status?: ChapterStatus | null
    wordCount?: number | null
    createdAt: string
    updatedAt: string
}

export interface ChapterListParams extends PageInput {
    storyId: string
    title?: string
}

export interface CreateChapterParams {
    storyId: string
    parentId?: string
    title: string
    type: ChapterType
}

export interface UpdateChapterParams {
    id: string
    title: string
    sortOrder?: number
    status?: ChapterStatus
}

export interface UpdateChapterContentParams {
    id: string
    content?: string
    wordCount?: number
}

/**
 * 分页获取章节列表
 */
export function getChapterList(params: ChapterListParams) {
    return appApi.get<PageResult<ChapterItem>>('/api/chapter', params)
}

/**
 * 根据 ID 获取章节详情
 */
export function getChapterById(id: string) {
    return appApi.get<ChapterItem>(`/api/chapter/${id}`)
}

/**
 * 创建章节
 */
export function createChapter(data: CreateChapterParams) {
    return appApi.put<ChapterItem>('/api/chapter', data)
}

/**
 * 更新章节
 */
export function updateChapter(data: UpdateChapterParams) {
    return appApi.post<boolean>('/api/chapter', data)
}

/**
 * 更新章节内容
 */
export function updateChapterContent(data: UpdateChapterContentParams) {
    return appApi.post<boolean>('/api/chapter/content', data)
}

/**
 * 删除章节
 */
export function deleteChapter(id: string) {
    return appApi.delete<boolean>(`/api/chapter/${id}`)
}
