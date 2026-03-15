import {message} from 'ant-design-vue'
import type {AxiosInstance, AxiosRequestConfig} from 'axios'
import {appRequest, baseRequest} from '@api/base/request.ts'
import type {ApiResult} from '@api/base/types.ts'
import {useAuthStore} from '@stores/auth.ts'

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

function isUnauthorizedResult(code: ApiResult<unknown>['code']): boolean {
    return code === 401 || code === '401' || code === 'AUTH_UNAUTHORIZED'
}

function isUnauthorizedError(error: unknown): boolean {
    if (typeof error !== 'object' || !error || !('response' in error)) {
        return false
    }

    const response = (error as {
        response?: {
            status?: number
            data?: { code?: number | string }
        }
    }).response

    return response?.status === 401 || isUnauthorizedResult(response?.data?.code ?? '')
}

function createPendingPromise<T>(): Promise<T> {
    return new Promise<T>(() => {
        // Keep the current async chain pending after redirecting to login.
    })
}

function createApiClient(request: AxiosInstance): ApiClient {
    async function unwrapResult<T>(
        promise: Promise<{ data: ApiResult<T> }>,
        silent = false
    ): Promise<T> {
        let response: { data: ApiResult<T> }

        try {
            response = await promise
        } catch (error) {
            if (isUnauthorizedError(error)) {
                if (request === appRequest) {
                    useAuthStore().requireLogin()
                }
                return createPendingPromise<T>()
            }

            if (!silent && !isUnauthorizedError(error)) {
                message.error(extractErrorMessage(error))
            }
            throw error
        }

        const result = response.data

        if (result.success) {
            return result.data
        }

        if (request === appRequest && isUnauthorizedResult(result.code)) {
            useAuthStore().requireLogin()
            return createPendingPromise<T>()
        } else if (!silent) {
            message.error(result.message || '请求失败')
        }

        return Promise.reject(new Error(result.message || '请求失败'))
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
