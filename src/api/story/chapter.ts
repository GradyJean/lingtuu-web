import appApi from '@api/base'
import type {PageInput, PageResult} from '@api/base/types.ts'

export type ChapterType = 'VOLUME' | 'CHAPTER'
export type ChapterStatus = 'DRAFT' | 'WRITING' | 'COMPLETED'

export interface ChapterItem {
    id: string
    story_id: string
    parent_id?: string | null
    title: string
    type: ChapterType
    sort_order?: number | null
    status?: ChapterStatus | null
    word_count?: number | null
    created_at: string
    updated_at: string
}

export interface ChapterListParams extends PageInput {
    story_id: string
    title?: string
}

export interface CreateChapterParams {
    story_id: string
    parent_id?: string
    title: string
    type: ChapterType
}

export interface UpdateChapterParams {
    id: string
    title: string
    sort_order?: number
    status?: ChapterStatus
}

export interface UpdateChapterContentParams {
    id: string
    content?: string
    word_count?: number
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
