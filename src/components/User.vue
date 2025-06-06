<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-header class="header">
        <div class="user-info" v-if="user">
          <div>用户名：{{ user.username }}</div>
          <div>角色：{{ user.role }}</div>
          <div>注册时间：{{ formatDate(user.createdAt) }}</div>
        </div>
      </el-header>

      <div class="footer-buttons">
        <button
            :class="['custom-btn', selected === 'note' ? 'active' : '']"
            @click="selected = 'note'"
        >
          笔记
        </button>
        <button
            :class="['custom-btn', selected === 'like' ? 'active' : '']"
            @click="selected = 'like'"
        >
          点赞
        </button>
      </div>

      <el-divider />

      <el-main class="main">
        <!-- 这里可以根据 selected 值显示不同内容 -->
        <div v-if="selected === 'note'">这是笔记内容区域</div>
        <div v-else-if="selected === 'like'">这是点赞内容区域</div>
        <div v-else>请选择操作</div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/http/request'

const user = ref(null)
const selected = ref(null)

async function fetchUser() {
  try {
    const res = await request.get('/user/me')
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

onMounted(() => {
  fetchUser()
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString()
}
</script>


<style scoped>
.common-layout {
  width: 100%;
  height: 100vh;
}

.layout-container {
  height: 80%;
  display: flex;
  flex-direction: column;
}

.header {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  font-size: 18px;
}

.main {
  flex: 1;
  overflow: auto;
  padding: 16px;
  font-size: 16px;
}

.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 16px 0;
}

.custom-btn {
  padding: 12px 28px;
  font-size: 18px;
  border: 2px solid #e80f28;
  border-radius: 9999px;
  background-color: transparent;
  color: #e80f28;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  outline: none;
  user-select: none;
}

.custom-btn:hover {
  background-color: rgba(232, 15, 40, 0.1);
}

.custom-btn.active {
  background-color: #e80f28;
  color: #fff;
}
</style>
