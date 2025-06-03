import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import '@/assets/global.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import Particles from 'particles.vue3'

const app = createApp(App)

// 全局注册图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 使用 Element Plus 和 Particles 插件
app.use(ElementPlus)
app.use(Particles)
app.use(router)
app.mount('#app')
