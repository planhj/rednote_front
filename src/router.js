import { createRouter, createWebHistory } from "vue-router";
import AuthForm from "@/components/AuthForm.vue"; // 路径根据你项目调整
import Home from "./components/Home.vue";
import Find from "./components/Find.vue";
// import Publish from "@/components/Publish.vue";
import Admin from "@/components/Admin.vue";


import publish from "./pages/publish.vue";
import UploadArea from "./pages/UploadArea.vue";
import UploadToPreviewPage from "./pages/UploadToPreviewPage.vue";
import HomePage from "./pages/HomePage.vue";

import NoteManager from "./pages/NoteManager.vue";
import CreationEncyclopedia from "./pages/CreationEncyclopedia.vue";

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
        path: "find",
        name: "Find",
        component: Find,
      },
      {
        path: "admin",
        name: "Admin",
        component: Admin,
        meta: { requiresAdmin: true }
      },
      {
        path: "",
        redirect: "find",
      },
    ],
  },
  {
    path: "/publish",
    redirect: '/publish/notemanager',
    component: publish,
    children: [
      {
        path: "new",
        name: "UploadArea",
        component: UploadArea,
      },
      {
        path: "edit-post",
        name: "UploadToPreview",
        component: UploadToPreviewPage,
      },
      {
        path: "myhome",
        name: "HomePage",
        component: HomePage,
      },
      {
        path: "notemanager",
        name: "NoteManager",
        component: NoteManager,
      },
      {
        path: "creator",
        name: "CreationEncyclopedia",
        component: CreationEncyclopedia,
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
