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
        <template v-if="selected === 'note'">
          <div v-if="notes.length === 0">暂无笔记内容</div>
          <div v-else>
            <div v-for="note in notes" :key="note.id" class="note-item">
              <h3>{{ note.title }}</h3>
              <p>{{ note.description }}</p>
              <div class="meta">
                <div class="meta-left">
                  <span>👍 {{ note.likeCount }}</span>
                  <span>💬 {{ note.commentCount }}</span>
                  <span>👀 {{ note.viewCount }}</span>
                  <span>🕒 {{ formatDate(note.createdAt) }}</span>
                </div>
                <el-button type="text" @click="handleDelete(note.id)"  style="color: red; font-size: 20px; padding: 20px 12px;">
                  删除
                </el-button>
              </div>

              <el-divider />
            </div>

            <div class="pagination-container">
              <el-pagination
                  background
                  layout="prev, pager, next, jumper, ->, total"
                  :total="total"
                  :page-size="pageSize"
                  :current-page="pageNum"
                  @current-change="handlePageChange"
                  class="pagination"
              />
            </div>
          </div>
        </template>

        <!-- 点赞内容 -->
        <template v-else-if="selected === 'like'">
          <div>这是点赞内容区域</div>
        </template>

        <!-- 未选择内容 -->
        <template v-else>
          <div>请选择操作</div>
        </template>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import request from '@/http/request'

const user = ref(null)
const selected = ref('note')
const notes = ref([]) // 存放笔记内容
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
watch(selected, (val) => {
  if (val === 'note') {
    fetchNotes()
  }
})
async function fetchNotes() {
  try {
    // const res = await request.get('/content/my', {
    //   params: {
    //     pageNum: pageNum.value,
    //     pageSize: pageSize.value
    //   }
    // })
    //const result=res.data;
    const result = {
      "code": 200,
      "message": "操作成功",
      "data": {
        "records": [
          {
            "id": 2,
            "userId": 1,
            "title": "我的旅行照片2（已修改）",
            "type": "IMAGE",
            "description": "看到一些小动物,好可爱！",
            "likeCount": 0,
            "commentCount": 0,
            "viewCount": 0,
            "isDeleted": false,
            "createdAt": "2025-06-01T23:15:38",
            "updatedAt": "2025-06-01T23:25:13"
          },
          {
            "id": 1,
            "userId": 1,
            "title": "我的旅行照片",
            "type": "IMAGE",
            "description": "出去玩拍的风景照！",
            "likeCount": 0,
            "commentCount": 0,
            "viewCount": 0,
            "isDeleted": false,
            "createdAt": "2025-06-01T22:48:34",
            "updatedAt": "2025-06-02T00:10:46"
          }
        ],
        "total": 20
      }
    }
    if (result.code === 200) {
      notes.value = result.data.records
      total.value = result.data.total
    } else {
      console.error('笔记接口返回错误:', result.message)
    }
  } catch (error) {
    console.error('笔记请求异常:', error)
  }
}
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
async function handleDelete(contentId) {

  try {
    const confirmed = window.confirm('确定要删除这条笔记吗？')
    if (!confirmed) return

    const res = await request.delete(`contentId/content/${contentId}/delete`)
    const result = res.data
    if (result.code === 200) {
      // 删除成功后重新拉取数据
      fetchNotes()
    } else {
      console.error('删除失败:', result.message)
    }
  } catch (error) {
    console.error('删除异常:', error)
  }
}


onMounted(() => {
  fetchUser()
  fetchNotes()
})
function handlePageChange(newPage) {
  pageNum.value = newPage
  fetchNotes()
}
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
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.header {
  height: 150px;
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
  padding: 12px 0;
}

.custom-btn {
  padding: 8px 16px;
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
.meta {
  display: flex;
  justify-content: space-between; /* 左右分布 */
  align-items: center; /* 垂直居中 */
  padding: 8px 0;
}

.meta-left > span {
  margin-right: 12px;
}

.custom-btn.active {
  background-color: #e80f28;
  color: #fff;
}
</style>
