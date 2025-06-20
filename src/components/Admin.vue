<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2>用户管理</h2>
      <div class="search-bar">
        <el-input 
          v-model="searchText" 
          placeholder="搜索用户名" 
          clearable 
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="admin-content">
      <el-table 
        :data="filteredUsers" 
        style="width: 100%" 
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="contentCount" label="作品数" width="120" />、
        <el-table-column prop="totalViewCount" label="浏览量" width="120" />
        <el-table-column prop="receivedLikeCount" label="被赞量" width="120" />
        <el-table-column prop="commentCount" label="评论量" width="120" />
        <el-table-column prop="role" label="当前角色" width="120">
          <template #default="scope">
            <el-tag 
              :type="getRoleTagType(scope.row.role)"
              effect="dark"
            >
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-dropdown @command="(command) => handleRoleChange(scope.row.id, command)">
              <el-button type="primary" size="small">
                修改权限 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    command="USER" 
                    :disabled="scope.row.role === 'USER'"
                  >
                    普通用户
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="ADMIN" 
                    :disabled="scope.row.role === 'ADMIN'"
                  >
                    管理员
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import request from '@/http/request'

const users = ref([])
const loading = ref(false)
const searchText = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchText.value) {
    return users.value
  }
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 获取所有用户信息
async function fetchUsers() {
  loading.value = true
  try {
    const res = await request.get('/admin/users', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value
      }
    })
    const result = res.data
    if (result.code === 200) {
      users.value = result.data.records
      total.value = result.data.total
    } else {
      ElMessage.error(result.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息异常:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 修改用户权限
async function handleRoleChange(userId, newRole) {
  try {
    const user = users.value.find(u => u.id === userId)
    if (!user) return

    await ElMessageBox.confirm(
      `确定要将用户 "${user.username}" 的权限修改为 "${getRoleText(newRole)}" 吗？`,
      '修改权限确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const res = await request.put(`/admin/users/${userId}/role`, {
      role: newRole
    })
    const result = res.data
    if (result.code === 200) {
      // 更新本地数据
      user.role = newRole
      user.updatedAt = new Date().toISOString()
      
      ElMessage.success('权限修改成功')
    } else {
      ElMessage.error(result.message || '权限修改失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('权限修改异常:', error)
      ElMessage.error('权限修改失败')
    }
  } finally {
    loading.value = false
  }
}

// 分页处理
function handlePageChange(newPage) {
  pageNum.value = newPage
  fetchUsers()
}

// 搜索处理
function handleSearch() {
  // 这里可以添加防抖逻辑
  console.log('搜索:', searchText.value)
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取角色标签类型
function getRoleTagType(role) {
  switch (role) {
    case 'ADMIN':
      return 'danger'
    case 'MODERATOR':
      return 'warning'
    case 'USER':
    default:
      return 'info'
  }
}

// 获取角色中文文本
function getRoleText(role) {
  switch (role) {
    case 'ADMIN':
      return '管理员'
    case 'MODERATOR':
      return '版主'
    case 'USER':
    default:
      return '普通用户'
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-page {
  width: 100%;
  height: 100%;
  padding: 24px;
  background: #ffffff;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.admin-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.search-bar {
  display: flex;
  align-items: center;
}

.admin-content {
  flex: 1;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.pagination {
  background: transparent;
}

/* 自定义表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table tr:hover > td) {
  background-color: #f8f9ff !important;
}

/* 自定义按钮样式 */
:deep(.el-button--primary) {
  background-color: #e8162e;
  border-color: #e8162e;
}

:deep(.el-button--primary:hover) {
  background-color: #d52b4a;
  border-color: #d52b4a;
}

/* 自定义标签样式 */
:deep(.el-tag--danger) {
  background-color: #e8162e;
  border-color: #e8162e;
  color: #fff;
}

:deep(.el-tag--warning) {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

:deep(.el-tag--info) {
  background-color: #909399;
  border-color: #909399;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-page {
    padding: 16px;
  }
  
  .admin-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .search-bar .el-input {
    width: 100% !important;
  }
}
</style> 