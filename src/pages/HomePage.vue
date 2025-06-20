<template>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="top" name="top"></el-tab-pane>
      <el-tab-pane label="right" name="right"></el-tab-pane>
      <el-tab-pane label="bottom" name="bottom"></el-tab-pane>
      <el-tab-pane label="left" name="left"></el-tab-pane>
    </el-tabs>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  const activeName = ref('top')
  </script>