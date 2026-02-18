import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/auth'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.PROD ? 'https://www.qmvector.com/lingtuu' : '/lingtuu',
  timeout: 30000,
})

// 是否正在刷新 token 的标志
let isRefreshing = false
// 重试队列
let retryQueue: Array<() => void> = []

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore()
    
    // 获取有效的 access_token（如果过期会自动刷新）
    const token = await authStore.getValidAccessToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
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
        authStore.clearAuth()
        return Promise.reject(error)
      }
      
      // 如果正在刷新 token，将请求加入队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          retryQueue.push(() => {
            resolve(request(originalRequest))
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
          retryQueue.forEach((cb) => cb())
          retryQueue = []
          return request(originalRequest)
        } else {
          // 刷新失败，清除登录状态
          authStore.clearAuth()
          return Promise.reject(error)
        }
      } catch (refreshError) {
        // 刷新异常，清除登录状态
        authStore.clearAuth()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

export default request
