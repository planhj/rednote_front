<template>
  <div class="layout">
    <!-- 顶部导航 -->
    <div class="topbar">
      <img src="@/assets/rednote.png" class="logo" />
      <div class="search-container">
        <el-input v-model="searchText" placeholder="登录探索更多内容" clearable class="search-input" />
        <el-button icon="Search" class="search-btn" circle />
      </div>
      <el-button type="primary">登录</el-button>
    </div>

    <!-- 主体区域（左侧菜单 + 主内容） -->
    <div class="content-area">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <el-menu default-active="/find" class="el-menu-vertical" :collapse="false" router>
          <el-menu-item index="/find">
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
          <el-menu-item index="/notice">
            <el-icon>
              <Bell />
            </el-icon>
            <span>通知</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon>
              <House />
            </el-icon>
            <span>我的</span>
          </el-menu-item>
          <el-menu-item index="/admin">
            <el-icon>
              <House />
            </el-icon>
            <span>管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区域 -->
      <div class="main-content" ref="mainRef">
        <router-view />
      </div>
      <!--      <div class="main-content" ref="mainRef">-->
      <!--        <div class="card" v-for="(item, index) in contentList" :key="index">-->
      <!--          <img :src="item.img" class="card-img" />-->
      <!--          <div class="card-title">{{ item.title }}</div>-->
      <!--        </div>-->
      <!--        <div class="loading" v-if="loading">加载中...</div>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
const searchText = ref("")
const mainRef = ref<HTMLElement | null>(null)

</script>

<style scoped>
/* 页面整体布局 */
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 64px;
  /* 留出顶部导航高度 */
}

.content-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 顶部栏 */
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
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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

/* 左侧菜单 */
.sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #eee;
  box-sizing: border-box;
  padding-top: 20px;
  flex-shrink: 0;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  scrollbar-width: none;
  /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none;
  /* IE 10+ 隐藏滚动条 */
}
</style>
