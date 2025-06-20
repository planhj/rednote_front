import { createRouter, createWebHistory } from "vue-router";
import AuthForm from "@/components/AuthForm.vue"; // 路径根据你项目调整
import Home from "./components/Home.vue";
import Find from "./components/Find.vue";
import Publish from "@/components/Publish.vue";
import Admin from "@/components/Admin.vue";
import {ElMessage} from "element-plus";
const routes = [
  {
    path: "/",
    name: "AuthForm",
    component: AuthForm,
  },
  {
    path: "/home",
    component: Home,
    children: [
      {
        path: "/find",
        component: Find,
      },
      {
        path: "/publish",
        component: Publish,
      },
      // {
      //   path: "/user",
      //   component: User,
      // },
      // {
      //   path: "/notice",
      //   component: Notice,
      // },
      {
        path: "/admin",
        component: Admin,
        meta: { requiresAdmin: true }
      },
      {
        path: "",
        redirect: "/find",
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('role')
  if (to.meta.requiresAdmin && role !== 'ADMIN') {
    ElMessage.warning('权限不足，无法访问管理页面')
    next(false) // 阻止跳转
  } else {
    next() // 放行
  }
})
export default router;
