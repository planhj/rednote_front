<template>
  <div style="text-align: left; padding-top: 10px;">
    <img src="@/assets/rednote.png" alt="logo" style="width: 80px; height: 40px;" />
  </div>
  <div style="margin-left: 22px;margin-top: 10px; margin-bottom:5px; ">
    <el-button
        type="text"
        @click="isCollapse = !isCollapse"
        style="font-size: 30px;"
        :title="isCollapse ? '展开菜单' : '收起菜单'"
    >
      <el-icon>
        <component :is="isCollapse ? ArrowRight : ArrowLeft" />
      </el-icon>
    </el-button>
  </div>

  <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><location /></el-icon>
        <span>我的</span>
      </template>
      <el-menu-item-group>
        <template #title><span>我的信息</span></template>
        <el-menu-item index="1-1">个人主页</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="我的内容中心">
        <el-menu-item index="1-2">我的内容</el-menu-item>
        <el-menu-item index="1-3">发布内容</el-menu-item>
      </el-menu-item-group>
      <el-sub-menu index="1-4">
        <template #title><span>item four</span></template>
        <el-menu-item index="1-4-1">item one</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-menu-item index="2">
      <el-icon><icon-menu /></el-icon>
      <template #title>Navigator Two</template>
    </el-menu-item>
    <el-menu-item index="3" disabled>
      <el-icon><document /></el-icon>
      <template #title>Navigator Three</template>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon><setting /></el-icon>
      <template #title>Navigator Four</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  ArrowLeft,
  ArrowRight,
} from '@element-plus/icons-vue'

const isCollapse = ref(true)

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 250px;
  min-height: 400px;
}

.el-menu-vertical-demo .el-menu-item,
.el-menu-vertical-demo .el-sub-menu__title {
  font-size: 18px;
  height: 50px;
  line-height: 50px;
}

.el-sub-menu__icon-arrow {
  font-size: 20px !important;
  margin-left: auto;
  display: flex;
  align-items: center;
}
.el-menu-vertical-demo .el-icon {
  font-size: 40px;
}

</style>
