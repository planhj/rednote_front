<template>
  <div class="layout">
    <div class="topbar">
      <div class="left">
        <img src="@/assets/rednote.png" class="logo" />
      </div>
      <div class="center">
        <div class="search-container">
          <el-input
              v-model="searchText"
              placeholder="搜索指定内容"
              clearable
              class="search-input"
          />
          <el-button icon="Search" class="search-btn" circle @click="search"/>
        </div>
      </div>
      <div class="right">
        <span v-if="user" style="color: red; cursor: pointer;" @click="showUserDialog">{{ user.username }}</span>
      </div>
    </div>


    <div class="content-area">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :collapse="false"
          router
        >
          <el-menu-item index="/find" @click="goFind">
            <el-icon>
              <Search />
            </el-icon>
            <span>发现</span>
          </el-menu-item>
          <el-menu-item index="/publish">
            <el-icon>
              <Plus />
            </el-icon>
            <span>发布</span>
          </el-menu-item>
          <el-menu-item
              index="/admin"
              :class="{ disabled: user && user.role !== 'ADMIN' }"
          >

          <img src="/icons/MaterialSymbolsLightManageAccountsOutline.svg" class="icon" />
            <span>管理用户</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content" ref="mainRef">
        <router-view v-slot="{ Component }">
          <component :is="Component" ref="findRef" />
        </router-view>

      </div>
    </div>
  </div>
  <el-dialog
      v-model="userDialogVisible"
      title="用户信息"
      width="400px"
  >
    <template #header>
      <div style="text-align: center; font-weight: bold;">
        用户信息
      </div>
    </template>

    <div v-if="user">
      <p><strong>ID：</strong>{{ user.id }}</p>
      <p><strong>用户名：</strong>{{ user.username }}</p>
      <p><strong>角色：</strong>{{ user.role }}</p>
      <p><strong>注册时间：</strong>{{ user.createdAt }}</p>
      <p><strong>内容数量：</strong>{{ user.contentCount }}</p>
      <p><strong>评论数量：</strong>{{ user.commentCount }}</p>
      <p><strong>总浏览量：</strong>{{ user.totalViewCount }}</p>
      <p><strong>收到的评论：</strong>{{ user.receivedCommentCount }}</p>
      <p><strong>收到的点赞：</strong>{{ user.receivedLikeCount }}</p>
    </div>
  </el-dialog>

</template>

<script setup>
import {ref, onMounted, nextTick} from "vue"
import request from '@/http/request'
import {ElMessage} from "element-plus";
import { useRouter, useRoute } from "vue-router";
const searchText = ref("")
const user = ref(null)
const route = useRoute();
const router = useRouter();
const findRef = ref(null)
const userDialogVisible = ref(false);
function showUserDialog() {
  userDialogVisible.value = true;
}
function goFind() {
  searchText.value = ''
  if (route.path !== '/find') {
    router.push('/find')
  }else{
    router.push({ path: '/find', query: { t: Date.now() } })
  }
}
async function fetchUser() {
  try {
    const res = await request.get('/users/me')
    const result = res.data
    console.log(res)
    if (result.code === 200) {
      user.value = result.data
    } else {
      console.error('接口返回错误:', result.message)
    }
  } catch (error) {
    console.error('请求异常:', error)
  }
}
function search() {
  if (route.path !== '/find') {
    router.push('/find').then(() => {
      nextTick(() => {
        findRef.value?.doSearch(searchText.value)
      })
    })
  } else {
    findRef.value?.doSearch(searchText.value)
  }
}
onMounted(() => {
  fetchUser()
})
</script>

<style scoped>
/* 页面整体布局 */
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
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
}
.topbar .left {
  flex: 0 0 auto;
}

.topbar .center {
  flex: 1;
  display: flex;
  justify-content: center;
}
.topbar .right {
  flex: 0 0 auto;
  margin-right: 30px;
  font-size: 20px;
  color: #333;
}
.logo {
  width: 80px;
  height: 40px;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
  padding: 6px 12px;
  border-radius: 20px;
  max-width: 400px;
  flex: 1;
  margin: 0 24px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.search-btn {
  background: transparent !important;
  border: none !important;
  margin-left: 8px;
}

.sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #eee;
  box-sizing: border-box;
  padding-top: 25px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.icon {
  width: 24px;
  height: 24px;
  margin-right: 5px;
}
</style>
