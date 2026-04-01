import appApi from '@api/base'
import type {PageInput, PageResult} from '@api/base/types.ts'

export interface StoryCharacterItem {
    id: string
    name: string
    description?: string | null
    tags?: string[] | null
    visibility?: string | null
    storyId: string
    source?: string | null
    createdAt: string
    updatedAt: string
}

export interface StoryCharacterTagOptionItem {
    key: string
    values: string[]
}

export interface StoryCharacterListParams extends PageInput {
    name?: string
}

export interface CreateStoryCharacterParams {
    name: string
    description?: string
    tags?: string[]
}

export interface UpdateStoryCharacterParams {
    name?: string
    description?: string
    tags?: string[]
}

/**
 * 分页获取角色列表
 */
export function getStoryCharacterList(storyId: string, params: StoryCharacterListParams): Promise<PageResult<StoryCharacterItem>> {
    return appApi.get<PageResult<StoryCharacterItem>>(`/api/story/character/${storyId}`, params)
}

/**
 * 根据 ID 获取角色详情
 */
export function getStoryCharacterById(storyId: string, id: string): Promise<StoryCharacterItem> {
    return appApi.get<StoryCharacterItem>(`/api/story/character/${storyId}/${id}`)
}

/**
 * 创建角色
 */
export function createStoryCharacter(storyId: string, data: CreateStoryCharacterParams): Promise<StoryCharacterItem> {
    return appApi.put<StoryCharacterItem>(`/api/story/character/${storyId}`, data)
}

/**
 * 更新角色
 */
export function updateStoryCharacter(storyId: string, id: string, data: UpdateStoryCharacterParams): Promise<boolean> {
    return appApi.post<boolean>(`/api/story/character/${storyId}/${id}`, data)
}

/**
 * 删除角色
 */
export function deleteStoryCharacter(storyId: string, id: string): Promise<boolean> {
    return appApi.delete<boolean>(`/api/story/character/${storyId}/${id}`)
}

/**
 * 获取角色标签选项
 */
export function getStoryCharacterTagOptions(): Promise<StoryCharacterTagOptionItem[]> {
    return appApi.get<StoryCharacterTagOptionItem[]>('/api/story/character/tag/options')
}
