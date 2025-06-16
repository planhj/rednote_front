<template>
  <div class="publish-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">内容管理</h1>
        <p class="page-subtitle">发布和管理你的精彩内容</p>
      </div>
      <div class="header-right">
        <el-button type="primary" size="large" @click="handleCreateContent" :icon="Plus">
          发布内容
        </el-button>
      </div>
    </div>

    <!-- 筛选搜索栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-input v-model="searchKeyword" placeholder="搜索标题或描述..." :prefix-icon="Search" clearable style="width: 300px;"
          @input="handleSearch" />
        <el-select v-model="filterType" placeholder="选择类型" clearable style="width: 150px; margin-left: 12px;"
          @change="handleFilter">
          <el-option label="图文" value="image" />
          <el-option label="视频" value="video" />
          <el-option label="音频" value="audio" />
          <el-option label="文档" value="document" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-switch v-model="isGridView" inline-prompt active-text="卡片" inactive-text="列表" @change="handleViewChange" />
        <el-button :icon="Refresh" @click="refreshData" :loading="loading" style="margin-left: 12px;">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 加载状态 -->
      <el-skeleton v-if="loading && !contentList.length" :rows="6" animated class="skeleton-loading" />

      <!-- 空状态 -->
      <el-empty v-else-if="!loading && !contentList.length" description="暂无内容，点击发布按钮创建第一个内容吧！" :image-size="120">
        <el-button type="primary" @click="handleCreateContent">立即发布</el-button>
      </el-empty>

      <!-- 内容列表 - 网格视图 -->
      <div v-else-if="isGridView" class="grid-view">
        <div class="content-grid">
          <ContentCard v-for="content in filteredContentList" :key="content.id" :content="content"
            @edit="handleEditContent" @click="handleContentClick" />
        </div>
      </div>

      <!-- 内容列表 - 列表视图 -->
      <div v-else class="list-view">
        <el-table :data="filteredContentList" stripe @row-click="handleContentClick" style="width: 100%">
          <el-table-column prop="title" label="标题" min-width="200">
            <template #default="{ row }">
              <div class="table-title">
                <el-icon size="16" :color="getTypeColor(row.type)">
                  <component :is="getTypeIcon(row.type)" />
                </el-icon>
                <span>{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="fileUrls" label="文件" width="80">
            <template #default="{ row }">
              <span v-if="row.fileUrls && row.fileUrls.length">
                {{ row.fileUrls.length }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="120">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click.stop="handleEditContent(row)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
        :page-sizes="[12, 24, 48, 96]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 发布/编辑模态框 -->
    <ContentModal v-model:visible="modalVisible" :mode="modalMode" :content-data="currentContent"
      @success="handleModalSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  PictureRounded,
  VideoPlay,
  Document
} from '@element-plus/icons-vue'
import ContentCard from './ContentCard/index.vue'
import ContentModal from './ContentModal/index.vue'
import { getContentList } from '@/http/api'

// 响应式数据
const loading = ref(false)
const modalVisible = ref(false)
const modalMode = ref('create') // create | edit
const currentContent = ref({})
const isGridView = ref(true)

// 搜索筛选
const searchKeyword = ref('')
const filterType = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(24)
const total = ref(0)

// 内容列表
const contentList = ref([])

// 模拟数据（实际项目中应该从API获取）
const mockData = [
  {
    id: 1,
    title: '美食分享：自制奶茶教程',
    type: 'image',
    description: '教你在家制作好喝的奶茶，简单几步就能享受美味',
    fileUrls: ['https://picsum.photos/300/200?random=1'],
    createTime: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 2,
    title: '旅行日记：云南大理三日游',
    type: 'image',
    description: '记录在大理的美好时光，古城、洱海、苍山，每一处都让人流连忘返',
    fileUrls: ['https://picsum.photos/300/200?random=2', 'https://picsum.photos/300/200?random=3'],
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 3,
    title: '健身教程：新手入门指南',
    type: 'video',
    description: '适合健身新手的入门教程，科学健身，健康生活',
    fileUrls: ['https://example.com/video1.mp4'],
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 4,
    title: '读书分享：《活着》读后感',
    type: 'document',
    description: '分享阅读《活着》这本书的心得体会，生命的意义与价值',
    fileUrls: [],
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 5,
    title: '音乐推荐：治愈系轻音乐',
    type: 'audio',
    description: '推荐几首治愈心灵的轻音乐，工作学习的好伴侣',
    fileUrls: ['https://example.com/music1.mp3', 'https://example.com/music2.mp3'],
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  }
]

// 计算属性
const filteredContentList = computed(() => {
  let result = [...contentList.value]

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }

  // 按类型筛选
  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }

  return result
})

// 方法
const loadContentList = async () => {
  try {
    loading.value = true

    // 这里应该调用真实的API
    // const response = await getContentList({
    //   page: currentPage.value,
    //   pageSize: pageSize.value,
    //   keyword: searchKeyword.value,
    //   type: filterType.value
    // })

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    contentList.value = [...mockData]
    total.value = mockData.length

  } catch (error) {
    console.error('加载内容列表失败:', error)
    ElMessage.error('加载内容列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreateContent = () => {
  modalMode.value = 'create'
  currentContent.value = {}
  modalVisible.value = true
}

const handleEditContent = (content) => {
  modalMode.value = 'edit'
  currentContent.value = { ...content }
  modalVisible.value = true
}

const handleContentClick = (content) => {
  console.log('查看内容详情:', content)
  // 这里可以跳转到内容详情页面
}

const handleModalSuccess = () => {
  modalVisible.value = false
  refreshData()
}

const handleSearch = () => {
  currentPage.value = 1
  // 实际项目中这里应该调用API进行搜索
  // loadContentList()
}

const handleFilter = () => {
  currentPage.value = 1
  // 实际项目中这里应该调用API进行筛选
  // loadContentList()
}

const handleViewChange = () => {
  // 视图切换
}

const refreshData = () => {
  loadContentList()
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadContentList()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  loadContentList()
}

// 工具方法
const getTypeIcon = (type) => {
  const iconMap = {
    image: PictureRounded,
    video: VideoPlay,
    audio: VideoPlay,
    document: Document
  }
  return iconMap[type] || Document
}

const getTypeText = (type) => {
  const textMap = {
    image: '图文',
    video: '视频',
    audio: '音频',
    document: '文档'
  }
  return textMap[type] || '文档'
}

const getTypeColor = (type) => {
  const colorMap = {
    image: '#4CAF50',
    video: '#F44336',
    audio: '#9C27B0',
    document: '#2196F3'
  }
  return colorMap[type] || '#2196F3'
}

const getTypeTagType = (type) => {
  const tagMap = {
    image: 'success',
    video: 'danger',
    audio: 'warning',
    document: 'info'
  }
  return tagMap[type] || 'info'
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 生命周期
onMounted(() => {
  loadContentList()
})
</script>

<style scoped>
.publish-page {
  width: 100%;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.header-right {
  flex-shrink: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-left {
  display: flex;
  align-items: center;
}

.filter-right {
  display: flex;
  align-items: center;
}

.content-area {
  margin-bottom: 24px;
}

.skeleton-loading {
  background: white;
  padding: 20px;
  border-radius: 12px;
}

.grid-view {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.list-view {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .publish-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    justify-content: center;
  }

  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>