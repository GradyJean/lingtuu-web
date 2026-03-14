import {ref, computed} from 'vue'
import {defineStore} from 'pinia'
import {logoutAuth, refreshAuthToken} from '@api/auth/auth.ts'

interface TokenInfo {
    token: string
    expire_at: number
}

export const useAuthStore = defineStore('auth', () => {
    // Token 信息
    const accessToken = ref<TokenInfo | null>(null)
    const refreshToken = ref<TokenInfo | null>(null)

    // 计算属性：是否已登录（只按真实过期时间判断，不做提前量）
    const isLoggedIn = computed(() => !!accessToken.value && !isTokenExpired(accessToken.value, 0))

    // 定时检查 token 过期的定时器
    let checkTimer: number | null = null
    let refreshPromise: Promise<boolean> | null = null

    /**
     * 从 localStorage 加载登录状态
     */
    function loadFromStorage() {
        try {
            const accessTokenStr = localStorage.getItem('access_token')
            const refreshTokenStr = localStorage.getItem('refresh_token')

            if (accessTokenStr) {
                const data = JSON.parse(accessTokenStr)
                // 确保 expire_at 是毫秒级时间戳
                accessToken.value = {
                    token: data.token,
                    expire_at: data.expire_at > 1e12 ? data.expire_at : data.expire_at * 1000,
                }
            }

            if (refreshTokenStr) {
                const data = JSON.parse(refreshTokenStr)
                // 确保 expire_at 是毫秒级时间戳
                refreshToken.value = {
                    token: data.token,
                    expire_at: data.expire_at > 1e12 ? data.expire_at : data.expire_at * 1000,
                }
            }

            // 启动定时检查
            startCheckTimer()
        } catch (error) {
            console.error('加载登录状态失败:', error)
            clearAuth()
        }
    }

    /**
     * 保存登录状态到 localStorage
     */
    function saveToStorage() {
        if (accessToken.value) {
            localStorage.setItem('access_token', JSON.stringify(accessToken.value))
        }
        if (refreshToken.value) {
            localStorage.setItem('refresh_token', JSON.stringify(refreshToken.value))
        }
    }

    /**
     * 检查 token 是否过期
     */
    function isTokenExpired(token: TokenInfo, advanceMs = 5 * 60 * 1000): boolean {
        // expire_at 可能是秒级时间戳，需要转换为毫秒
        const expireAt = token.expire_at > 1e12 ? token.expire_at : token.expire_at * 1000
        return Date.now() >= expireAt - advanceMs
    }

    /**
     * 设置登录信息
     */
    function setLoginInfo(data: {
        access_token: { token: string; expire_at: number }
        refresh_token: { token: string; expire_at: number }
    }) {
        // 确保 expire_at 是毫秒级时间戳
        const accessExpireAt = data.access_token.expire_at > 1e12
            ? data.access_token.expire_at
            : data.access_token.expire_at * 1000
        const refreshExpireAt = data.refresh_token.expire_at > 1e12
            ? data.refresh_token.expire_at
            : data.refresh_token.expire_at * 1000

        accessToken.value = {
            token: data.access_token.token,
            expire_at: accessExpireAt,
        }
        refreshToken.value = {
            token: data.refresh_token.token,
            expire_at: refreshExpireAt,
        }
        saveToStorage()
        startCheckTimer()
    }

    /**
     * 启动定时检查 token 过期
     */
    function startCheckTimer() {
        if (checkTimer) {
            clearInterval(checkTimer)
        }

        // 每分钟检查一次
        checkTimer = window.setInterval(() => {
            if (accessToken.value && isTokenExpired(accessToken.value)) {
                void refreshTokenIfNeeded()
            }
        }, 60 * 1000)
    }

    /**
     * 刷新 access_token
     */
    async function doRefreshToken(): Promise<boolean> {
        if (!refreshToken.value) {
            return false
        }

        // 检查 refresh_token 是否过期
        if (isTokenExpired(refreshToken.value)) {
            clearAuth()
            return false
        }

        try {
            const tokenData = await refreshAuthToken(refreshToken.value.token)
            // 直接更新 token，不要调用 startCheckTimer()
            accessToken.value = {
                token: tokenData.access_token.token,
                expire_at: tokenData.access_token.expire_at,
            }
            refreshToken.value = {
                token: tokenData.refresh_token.token,
                expire_at: tokenData.refresh_token.expire_at,
            }
            saveToStorage()
            return true
        } catch (error) {
            console.error('刷新 token 异常:', error)
            return false
        }
    }

    /**
     * 检查是否需要刷新 token（定时调用）
     */
    async function refreshTokenIfNeeded(): Promise<boolean> {
        if (!accessToken.value || !refreshToken.value) {
            return false
        }

        // 只有 access_token 过期时才刷新
        if (!isTokenExpired(accessToken.value)) {
            return true
        }

        if (!refreshPromise) {
            refreshPromise = doRefreshToken()
                .finally(() => {
                    refreshPromise = null
                })
        }

        const refreshed = await refreshPromise
        return !!(refreshed && accessToken.value)

    }

    /**
     * 清除登录状态
     */
    function clearAuth() {
        accessToken.value = null
        refreshToken.value = null

        if (checkTimer) {
            clearInterval(checkTimer)
            checkTimer = null
        }
        refreshPromise = null

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
    }

    /**
     * 退出登录
     */
    async function logout() {
        try {
            await logoutAuth(accessToken.value?.token)
        } catch (error) {
            console.error('退出登录失败:', error)
        } finally {
            clearAuth()
        }
    }

    /**
     * 获取有效的 access_token（如果过期自动刷新）
     */
    async function getValidAccessToken(): Promise<string | null> {
        if (!accessToken.value) {
            return null
        }

        // token 未过期，直接返回
        if (!isTokenExpired(accessToken.value, 0)) {
            return accessToken.value.token
        }

        // token 已过期，尝试刷新
        const refreshed = await refreshTokenIfNeeded()
        if (refreshed && accessToken.value) {
            return accessToken.value.token
        }

        return null
    }

    return {
        // 状态
        accessToken,
        refreshToken,
        isLoggedIn,

        // 方法
        loadFromStorage,
        setLoginInfo,
        clearAuth,
        logout,
        getValidAccessToken,
        refreshTokenIfNeeded,
    }
})
