import {message} from 'ant-design-vue'
import type {AxiosInstance, AxiosRequestConfig} from 'axios'
import {appRequest, baseRequest} from '@api/request.ts'
import type {ApiResult} from '@api/types'

type ApiClientConfig = AxiosRequestConfig & {
    silent?: boolean
}

type ApiClient = {
    get<T>(url: string, params?: object, config?: ApiClientConfig): Promise<T>
    delete<T>(url: string, params?: object, config?: ApiClientConfig): Promise<T>
    post<T>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T>
    put<T>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T>
    patch<T>(url: string, data?: unknown, config?: ApiClientConfig): Promise<T>
}

function extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as {
            response?: {
                data?: { message?: string }
            }
        }).response
        if (response?.data?.message) {
            return response.data.message
        }
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    return '请求失败，请稍后重试'
}

function createApiClient(request: AxiosInstance): ApiClient {
    async function unwrapResult<T>(
        promise: Promise<{ data: ApiResult<T> }>,
        silent = false
    ): Promise<T> {
        try {
            const response = await promise
            const result = response.data

            if (result.success) {
                return result.data
            }

            throw new Error(result.message || '请求失败')
        } catch (error) {
            if (!silent) {
                message.error(extractErrorMessage(error))
            }
            throw error
        }
    }

    return {
        get<T>(url: string, params?: object, config?: ApiClientConfig) {
            const {silent, ...requestConfig} = config ?? {}
            return unwrapResult<T>(
                request.get<ApiResult<T>>(url, {
                    ...requestConfig,
                    params,
                }),
                silent
            )
        },
        delete<T>(url: string, params?: object, config?: ApiClientConfig) {
            const {silent, ...requestConfig} = config ?? {}
            return unwrapResult<T>(
                request.delete<ApiResult<T>>(url, {
                    ...requestConfig,
                    params,
                }),
                silent
            )
        },
        post<T>(url: string, data?: unknown, config?: ApiClientConfig) {
            const {silent, ...requestConfig} = config ?? {}
            return unwrapResult<T>(request.post<ApiResult<T>>(url, data, requestConfig), silent)
        },
        put<T>(url: string, data?: unknown, config?: ApiClientConfig) {
            const {silent, ...requestConfig} = config ?? {}
            return unwrapResult<T>(request.put<ApiResult<T>>(url, data, requestConfig), silent)
        },
        patch<T>(url: string, data?: unknown, config?: ApiClientConfig) {
            const {silent, ...requestConfig} = config ?? {}
            return unwrapResult<T>(request.patch<ApiResult<T>>(url, data, requestConfig), silent)
        }
    }
}

export const appApi = createApiClient(appRequest)
export const baseApi = createApiClient(baseRequest)

export default appApi
