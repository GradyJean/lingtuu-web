import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
                    component: () => import('../views/Dashboard.vue'),
                },
                {
                    path: 'story',
                    name: 'story',
                    component: () => import('../views/Story.vue'),
                },
            ],
        },
        {
            path: '/auth/wechat/callback',
            name: 'wechat-callback',
            component: () => import('../views/auth/wechat/WechatCallback.vue'),
            meta: {requiresAuth: false},
        },
    ],
})

export default router
