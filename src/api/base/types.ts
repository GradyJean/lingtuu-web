/**
 * 分页输入 - 公共参数
 */
export interface PageInput {
    page?: number
    size?: number
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
    hasNext: boolean
    hasPrev: boolean
}

/**
 * API 响应包装 - 公共结构
 */
export interface ApiResult<T> {
    code: number | string
    message: string
    data: T
    success: boolean
}
