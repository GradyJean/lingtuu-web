/**
 * 分页输入 - 公共参数
 */
export interface PageInput {
    page_num?: number
    page_size?: number
}

/**
 * 分页响应数据 - 公共结构
 */
export interface PageResult<T> {
    list: T[]
    total: number
    page: number
    size: number
    pages: number
    has_next: boolean
    has_prev: boolean
}

/**
 * API 响应包装 - 公共结构
 */
export interface ApiResult<T> {
    code: number
    message: string
    data: T
    success: boolean
}
