<template>
  <el-card>
    <div class="post-editor">
      <!-- 顶部返回和提示 -->
      <div class="header">
        <el-button type="text" @click="goBack">< 返回图文上传</el-button>
        <span class="tip">图片编辑（{{ fileList.length }}/18） </span>
      </div>

      <!-- 图片编辑区 -->
      <div class="image-editor">
        <div>
          <div class="content-title">图片编辑</div>
          (1/18) 支持拖拽排序
        </div>
        <el-upload
          action="http://192.168.17.17:8080/files/upload/multi"
          list-type="picture-card"
          :limit="18"
          v-model:file-list="fileList"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          :on-success="handleImageSuccess"
          :auto-upload="true"
          name="files"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </div>

      <!-- 内容输入区 -->
      <div class="content-editor">
        <el-input
          v-model="title"
          maxlength="20"
          placeholder="填写标题会有更多赞哦 ~"
          class="title-input"
        />
        <el-input
          type="textarea"
          rows="6"
          maxlength="1000"
          v-model="description"
          placeholder="输入正文描述，真诚有价值的分享更入温暖"
        />
      </div>

      <!-- 发布操作 -->
      <div class="bottom-bar">
        <el-button color="#ff2442" @click="submitPost">发布</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

import request from "@/http/request";

const router = useRouter();
const title = ref("");
const description = ref("");

const BaseUrl = "http://192.168.17.17:8080";

const fileList = ref<any[]>([]);

// 页面加载时读取上传的数据
onMounted(() => {
  const stored = sessionStorage.getItem("uploadedImages");
  if (stored) {
    const paths = JSON.parse(stored);
    fileList.value = paths.map((item: any, index: number) => ({
      name: item.name || `图片${index + 1}`,
      url: `${BaseUrl}${item}`,
    }));
    console.log("恢复后的文件列表：", fileList.value);
  }
});

const handlePreview = (file: any) => {
  window.open(file.url || file.response?.url);
};
const handleRemove = (file: any) => {
  ElMessage.info(`已删除图片 ${file.name}`);
};
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) ElMessage.error("只能上传图片文件");
  return isImage;
};
const goBack = () => {
  router.push("/publish/new");
};


const handleImageSuccess = (response: any, file: any, uploadFileList: any) => {
  ElMessage.success("上传成功");

  const path = response.data?.[0];
  if (!path) return;

  // 修改 file 的 url，让其绑定正确预览地址
  file.url = `${BaseUrl}${path}`;

  // 自动更新 fileList，不手动 push，避免重复
};


const submitPost = async () => {
  if (!title.value || !description.value || fileList.value.length === 0) {
    ElMessage.warning("请补充完整内容后再发布");
    return;
  }

  const payload = {
    title: title.value,
    type: "IMAGE",
    description: description.value,
    fileUrls: fileList.value.map((file: any) => {
      // console.log(file)
      // 获取 URL 中的相对路径部分
      return file.url.replace(BaseUrl, "");
    }),
  };

  try {
    await request.post("/contents/create", payload);
    ElMessage.success("发布成功");
    router.push("/home/find");
  } catch (error) {
    console.error("发布失败：", error);
    ElMessage.error("发布失败，请稍后重试");
  }
};

const reset = () => {
  ElMessageBox.confirm("确认要重置所有内容吗？", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      title.value = "";
      description.value = "";
      fileList.value = [];
      sessionStorage.removeItem("uploadedImages");
      ElMessage.success("内容已重置");
    })
    .catch(() => {
      ElMessage.info("已取消重置");
    });
};
</script>

<style scoped>
.post-editor {
  padding: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  display: flex;
}
.tip {
  color: #33333399;
  font-size: 10px;
  margin-left: 8px;
  font-family: "PingFang SC";
  font-style: normal;
  font-weight: 300;
}
.image-editor {
  margin-bottom: 24px;
}
.title-input {
  margin-bottom: 12px;
}
.bottom-bar {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
.content-title {
  font-weight: 400;
  font-size: 18px;
  line-height: 26px;
  color: #262626;
  margin-right: 6px;
}
</style>
