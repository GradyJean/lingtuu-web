import {createRouter, createWebHistory} from 'vue-router'
import {hasPagePermission} from '@api/security'
import {useAuthStore} from '@stores/auth'
import HomeView from '@views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {requiresAuth: true},
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@views/Dashboard.vue'),
                    meta: {requiresAuth: true, requiresPermission: false}
                },
                {
                    path: 'story',
                    name: 'story',
                    component: () => import('@views/story/Story.vue'),
                    meta: {requiresAuth: true, requiresPermission: true},
                }
            ],
        },
        {
            path: '/admin/permission/manager',
            name: 'permissionManager',
            component: () => import('@views/admin/PermissionManagerView.vue'),
            meta: {requiresAuth: true, requiresPermission: true},
        },
        {
            path: '/auth/wechat/callback',
            name: 'wechat-callback',
            component: () => import('@views/auth/wechat/WechatCallback.vue'),
            meta: {requiresAuth: false, requiresPermission: false}
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('@views/UserProfileView.vue'),
            meta: {requiresAuth: true, requiresPermission: true},
        },
        {
            path: '/story/:id',
            name: 'storyDetail',
            component: () => import('@views/story/StoryDetail.vue'),
            meta: {requiresAuth: true, requiresPermission: true},
        },
        {
            path: '/permission-denied',
            name: 'permissionDenied',
            component: () => import('@views/PermissionDeniedView.vue'),
            meta: {requiresAuth: true, requiresPermission: false}
        },
    ],
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
        authStore.rememberLoginRedirect(to.fullPath)
        return true
    }

    if (to.meta.requiresAuth === false || to.meta.requiresPermission === false) {
        return true
    }

    const allowed = await hasPagePermission({path: to.path})

    if (allowed) {
        return true
    }

    return {
        name: 'permissionDenied',
        query: {
            path: to.fullPath,
        },
        replace: true,
    }
})

export default router
