import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios'
import type {AxiosRequestConfig} from 'axios'
import {useAuthStore} from '@stores/auth.ts'
import {getDeviceId} from '@utils/device.ts'

const requestConfig = {
    baseURL: import.meta.env.PROD ? 'https://www.qmvector.com/lingtuu' : '/lingtuu',
    timeout: 30000,
}

export const baseRequest = axios.create(requestConfig)
export const appRequest = axios.create(requestConfig)

/**
 * helper function to add device id to request config
 * @param config
 */
function addDeviceId(config: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig {
    config.headers = config.headers ?? {}
    // 添加设备 ID
    config.headers['X-Device-Id'] = getDeviceId()
    return config
}

function addAuthToken(config: InternalAxiosRequestConfig<any>): InternalAxiosRequestConfig {
    const authStore = useAuthStore()
    config.headers = config.headers ?? {}
    // 添加 token
    const token = authStore.accessToken?.token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

// 请求拦截器
baseRequest.interceptors.request.use(addDeviceId)
appRequest.interceptors.request.use(addDeviceId)
appRequest.interceptors.request.use(addAuthToken)
// 是否正在刷新 token 的标志
let isRefreshing = false
// 重试队列
let retryQueue: Array<{
    resolve: () => void
    reject: (error: unknown) => void
}> = []


// 响应拦截器
appRequest.interceptors.response.use(
    (response) => {
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // 如果是 401 错误
        if (error.response?.status === 401) {
            const authStore = useAuthStore()

            // 如果是重试的请求，直接清除登录状态
            if (originalRequest._retry) {
                authStore.requireLogin()
                return Promise.reject(error)
            }

            // 如果正在刷新 token，将请求加入队列
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    retryQueue.push({
                        resolve: () => {
                            resolve(appRequest(originalRequest))
                        },
                        reject,
                    })
                })
            }

            // 尝试刷新 token
            originalRequest._retry = true
            isRefreshing = true

            try {
                const refreshed = await authStore.refreshTokenIfNeeded()

                if (refreshed) {
                    // 刷新成功，执行队列中的请求
                    retryQueue.forEach(({resolve}) => resolve())
                    retryQueue = []
                    return appRequest(originalRequest)
                } else {
                    // 刷新失败，清除登录状态
                    retryQueue.forEach(({reject}) => reject(error))
                    retryQueue = []
                    authStore.requireLogin()
                    return Promise.reject(error)
                }
            } catch (refreshError) {
                // 刷新异常，清除登录状态
                retryQueue.forEach(({reject}) => reject(refreshError))
                retryQueue = []
                authStore.requireLogin()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)
