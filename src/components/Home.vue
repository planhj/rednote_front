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
          <el-button icon="Search" class="search-btn" circle />
        </div>
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
          <el-menu-item index="/find">
            <el-icon><Search /></el-icon>
            <span>发现</span>
          </el-menu-item>
          <el-menu-item index="/publish">
            <el-icon><Plus /></el-icon>
            <span>发布</span>
          </el-menu-item>
          <el-menu-item index="/notice">
            <el-icon><Bell /></el-icon>
            <span>通知</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon><House /></el-icon>
            <span>我的</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content" ref="mainRef">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import {useRoute} from "vue-router";
const searchText = ref("")
const mainRef = ref<HTMLElement | null>(null)
const route = useRoute();
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
  height: 100%;
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
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

</style>
