<template>
  <div class="note-page">
    <!-- 头部 -->
    <div class="header">
      <el-title level="3" class="title">笔记管理</el-title>
      <el-input
        v-model="searchText"
        placeholder="搜索已发布笔记"
        class="search-input"
        clearable
      >
        <template #append>
          <el-button :icon="Search" />
        </template>
      </el-input>
    </div>

    <!-- 笔记列表 -->
    <el-card class="note-card" v-for="note in noteList" :key="note.id">
      <div class="note-item">
        <img class="note-cover" :src="BaseUrl + note.fileUrls[0]" alt="封面" />
        <div class="note-content">
          <div class="note-title">{{ note.title }}</div>
          <div class="note-meta">
            发布于{{ new Date(note.createdAt).toLocaleString() }}
          </div>
          <div class="note-icons">
            <span><el-icon><View /></el-icon> {{ note.viewCount }}</span>
            <span><el-icon><ChatLineRound /></el-icon> {{ note.commentCount }}</span>
            <span><el-icon><Star /></el-icon> {{ note.likeCount }}</span>
            <span><el-icon><Share /></el-icon> 0</span>
          </div>
        </div>
        <div class="note-actions">
          <el-button type="text" size="small" @click="showDetail(note.id)">编辑</el-button>
          <el-button type="text" size="small" @click="deleteNote(note.id)">删除</el-button>
        </div>
      </div>
    </el-card>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page.sync="pageNum"
      @current-change="fetchNotes"
      class="mt-4"
    />

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑内容" width="700px">
      <div v-if="detail">
        <el-input v-model="detail.title" placeholder="标题" class="mb-2" />
        <el-input
          type="textarea"
          v-model="detail.description"
          rows="4"
          placeholder="请输入描述"
          class="mb-2"
        />

        <div style="margin: 12px 0 8px">图片列表</div>
        <el-upload
          action="http://192.168.17.17:8080/files/upload/multi"
          list-type="picture-card"
          :on-success="handleEditUploadSuccess"
          :limit="18"
          :auto-upload="true"
          :file-list="editFileList"
          name="files"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Search,
  View,
  ChatLineRound,
  Star,
  Share,
  Plus,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import request from "@/http/request";

const BaseUrl = "http://192.168.17.17:8080";

const noteList = ref([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(5);
const searchText = ref("");

const fetchNotes = async () => {
  try {
    const res = await request.get("/contents/my", {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      },
    });
    if (res.data.code === 200) {
      noteList.value = res.data.data.records;
      total.value = res.data.data.records.length;
    }
  } catch (err) {
    ElMessage.error("获取笔记失败");
  }
};

onMounted(() => {
  fetchNotes();
});

// 删除功能
const deleteNote = async (contentId: number) => {
  try {
    await request.delete(`/contents/${contentId}/delete`);
    ElMessage.success("删除成功");
    fetchNotes();
  } catch (err) {
    ElMessage.error("删除失败");
  }
};

// 编辑弹窗
const dialogVisible = ref(false);
const detail = ref<any>(null);
const editFileList = ref<any[]>([]);

// 打开弹窗并获取详情
const showDetail = async (id: number) => {
  try {
    const res = await request.get(`/contents/${id}`);
    if (res.data.code === 200) {
      detail.value = res.data.data;
      editFileList.value = detail.value.fileUrls.map((url: string, index: number) => ({
        name: `图片${index + 1}`,
        url: BaseUrl + url,
      }));
      dialogVisible.value = true;
    }
  } catch (err) {
    ElMessage.error("获取详情失败");
  }
};

// 上传图片成功时更新 fileUrls
const handleEditUploadSuccess = (res: any, file: any, fileList: any) => {
  ElMessage.success("上传成功");
  const uploadedPaths = res.data; // 多图上传返回的是数组
  detail.value.fileUrls.push(...uploadedPaths);
  editFileList.value = detail.value.fileUrls.map((url: string, index: number) => ({
    name: `图片${index + 1}`,
    url: BaseUrl + url,
  }));
};

// 提交编辑
const submitEdit = async () => {
  try {
    if (!detail.value.title || !detail.value.description || detail.value.fileUrls.length === 0) {
      ElMessage.warning("请补充完整内容");
      return;
    }

    await request.put(`/contents/${detail.value.id}/edit`, {
      title: detail.value.title,
      type: "IMAGE",
      description: detail.value.description,
      fileUrls: detail.value.fileUrls,
    });

    ElMessage.success("修改成功");
    dialogVisible.value = false;
    fetchNotes();
  } catch (err) {
    ElMessage.error("修改失败");
  }
};
</script>

<style scoped>
.note-card {
  margin-bottom: 30px;
}
.title {
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.85);
  font-size: 20px;
  font-weight: 500;
  position: relative;
  padding-left: 12px;
}
.title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 2px;
  width: 4px;
  height: 18px;
  background-color: #3a64ff;
  border-radius: 1px;
}
.note-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-input {
  width: 250px;
}
.note-item {
  display: flex;
  align-items: flex-start;
}
.note-cover {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 10px;
}
.note-content {
  flex: 1;
}
.note-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
.note-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}
.note-icons span {
  margin-right: 12px;
  font-size: 13px;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.note-actions {
  display: flex;
  gap: 10px;
}
.mb-2 {
  margin-bottom: 12px;
}
</style>
