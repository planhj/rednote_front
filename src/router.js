import { createRouter, createWebHistory } from 'vue-router'
import AuthForm from '@/components/AuthForm.vue'  // 路径根据你项目调整
import Home from './components/Home.vue'
import Find from './components/Find.vue'
import User from './components/User.vue'
import Publish from "@/components/Publish.vue";
import Notice from "@/components/Notice.vue";
const routes = [
    {
        path: '/',
        name: 'AuthForm',
        component: AuthForm
    },
    {
        path: '/home',
        component: Home,
        children: [
            {
                path: '/find',
                component: Find
            },
            {
                path: '/publish',
                component: Publish
            },
            {
                path: '/user',
                component: User
            },
            {
                path: '/notice',
                component: Notice
            },
            {
                path: '',
                redirect: '/find'
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
