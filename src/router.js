import { createRouter, createWebHistory } from 'vue-router'
import AuthForm from '@/components/AuthForm.vue'  // 路径根据你项目调整
import Home from './components/Home.vue'
const routes = [
    {
        path: '/',
        name: 'AuthForm',
        component: AuthForm
    },
    {
        path: '/Home',
        name: 'Home',
        component: Home
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
