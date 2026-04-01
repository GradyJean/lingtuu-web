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
    title?: string
    order?: 'asc' | 'desc'
}

export interface CreateChapterParams {
    parentId?: string
    title: string
    type: ChapterType
}

export interface UpdateChapterParams {
    title: string
    status?: ChapterStatus
}

export interface UpdateChapterContentParams {
    content?: string
    plainText?: string
}

export interface ChapterContentItem {
    id: string
    storyId: string
    content?: string | null
    plainText?: string | null
    wordCount?: number | null
    createdAt: string
    updatedAt: string
}

export type MoveChapterMode = 'BEFORE' | 'AFTER' | 'INSIDE' | 'INSIDE_START' | 'ROOT_START' | 'ROOT_END'

export interface MoveChapterParams {
    chapterId: string
    targetChapterId?: string
    mode: MoveChapterMode
}

/**
 * 分页获取章节列表
 */
export function getChapterList(storyId: string, params: ChapterListParams): Promise<PageResult<ChapterItem>> {
    return appApi.get<PageResult<ChapterItem>>(`/api/story/chapter/${storyId}`, params)
}

/**
 * 根据 ID 获取章节详情
 */
export function getChapterById(storyId: string, id: string): Promise<ChapterItem> {
    return appApi.get<ChapterItem>(`/api/story/chapter/${storyId}/${id}`)
}

/**
 * 根据 ID 获取章节正文
 */
export function getChapterContentById(storyId: string, id: string): Promise<ChapterContentItem> {
    return appApi.get<ChapterContentItem>(`/api/story/chapter/${storyId}/${id}/content`)
}

/**
 * 创建章节
 */
export function createChapter(storyId: string, data: CreateChapterParams): Promise<ChapterItem> {
    return appApi.put<ChapterItem>(`/api/story/chapter/${storyId}`, data)
}

/**
 * 更新章节
 */
export function updateChapter(storyId: string, id: string, data: UpdateChapterParams): Promise<boolean> {
    return appApi.post<boolean>(`/api/story/chapter/${storyId}/${id}`, data)
}

/**
 * 更新章节内容
 */
export function updateChapterContent(storyId: string, id: string, data: UpdateChapterContentParams): Promise<boolean> {
    return appApi.post<boolean>(`/api/story/chapter/${storyId}/${id}/content`, data)
}

/**
 * 根据移动意图调整章节顺序。
 * 排序号由后端统一计算并重排。
 */
export function moveChapter(storyId: string, data: MoveChapterParams): Promise<boolean> {
    return appApi.post<boolean>(`/api/story/chapter/${storyId}/move`, data)
}

/**
 * 删除章节
 */
export function deleteChapter(storyId: string, id: string): Promise<boolean> {
    return appApi.delete<boolean>(`/api/story/chapter/${storyId}/${id}`)
}
