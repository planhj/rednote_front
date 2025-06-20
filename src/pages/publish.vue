<template>
  
  <div class="layout">
    <!-- 顶部导航 -->
    <div class="topbar">
      <div class="left">
        <img src="@/assets/rednote.png" class="logo" />
        <div class="word">创作服务平台</div>
      </div>

      <!-- 右上角头像下拉菜单 -->
      <el-dropdown trigger="hover" @command="handleCommand">
        <div class="right" @click.prevent>
          <img src="@/assets/image.png" class="avatar" />
          <div class="name">{{ user?.username }}</div>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 主体区域 -->
    <div class="content-area">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <el-button color="#ff2442" class="btn" @click="toPublish">发布笔记</el-button>

        <el-divider />

        <el-menu
          default-active=""
          class="el-menu-vertical"
          :collapse="false"
          router
        >
          
          <el-menu-item index="/publish/notemanager">
            <el-icon><Tickets /></el-icon>
            <span>笔记管理</span>
          </el-menu-item>

        <el-menu-item index="/publish/creator">
          <el-icon><Collection /></el-icon>
          <span>创作百科</span>
        </el-menu-item>
         
        </el-menu>
      </div>

      <!-- 主内容区：上传组件放这里 -->
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import request from "@/http/request"
import { ArrowDown, Plus, Search, House } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import {onMounted, ref} from "vue";
const user = ref(null)
const handleCommand = (command: string) => {
  if (command === "logout") {
    ElMessage.success("已退出登录");
    // 清除 token 跳转登录页
    localStorage.removeItem('token')
    window.location.href = '/'
  }
};
async function fetchUser() {
  try {
    const res = await request.get('/users/me')
    const result = res.data
    if (result.code === 200) {
      user.value = result.data
    } else {
      console.error('接口返回错误:', result.message)
    }
  } catch (error) {
    console.error('请求异常:', error)
  }
}
const router = useRouter();
const toPublish = ()=>{
  router.push('/publish/new')
}
onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
/* 上传区域 */
.upload-area {
  margin-top: 20px;
  border: 2px dashed #dcdfe6;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
}
.el-upload__tip p {
  margin: 4px 0;
  color: #888;
  font-size: 13px;
}

/* 页面整体布局 */
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.btn {
  width: 176px;
  height: 44px;
  margin-left: 16px;
  font-size: 17px;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 100%;
  margin-right: 10px;
}
.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
  margin-top: 60px;
}
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #fff;
  z-index: 999;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  justify-content: space-between;
}
.topbar .left {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.name {
  font-size: 16px;
}
.word {
  font-size: 20px;
  margin-left: 5px;
}
.topbar .right {
  flex: 0 0 auto;
  margin-right: 50px;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
}
.logo {
  width: 60px;
  height: 30px;
}
.sidebar {
  width: 208px;
  background: #fff;
  border-right: 1px solid #eee;
  box-sizing: border-box;
  padding-top: 20px;
  flex-shrink: 0;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: block;
  background: #eef1f8;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
