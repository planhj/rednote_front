<template>
  <el-card>
    <el-tabs v-model="activeTab">
      <!-- 上传视频 -->
      <el-tab-pane label="上传视频" name="video" class="upload">
        <el-upload
          class="upload-area"
          drag
          action="https://jsonplaceholder.typicode.com/posts/"
          multiple
          :limit="1"
          :on-exceed="handleExceed"
          :before-upload="beforeVideoUpload"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽视频到此或点击上传</div>
          <el-button color="#ff2442" class="btn">点击上传</el-button>
        </el-upload>

        <div>
          <div class="bottom" >
            <div class="bottom-left">
              <span class="title"> 视频大小</span>
              <span class="content"> 支持时长60分钟以内， </span>
              <span class="content">最大20GB的视频文件</span>
            </div>
            <el-divider direction="vertical" />
            <div class="bottom-center">
              <span class="title"> 视频格式</span>
              <span class="content"> 支持常用视频格式， </span>
              <span class="content">推荐使用mp4、mov</span>
            </div>
            <el-divider direction="vertical" border-style="dashed" />
            <div class="bottom-right">
              <span class="title"> 视频分辨率</span>
              <span class="content">
                推荐上传720P（1280*720）及以上视频，
              </span>
              <span class="content">超过1080P的视频用网页端上传画质更清晰</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 上传图文 -->
      <el-tab-pane label="上传图文" name="image" class="upload">
        <el-upload
          ref="imageUploadRef"
          class="upload-area"
          action="http://localhost:8080/files/upload/multi"
          list-type="picture-card"
          :limit="5"
          name="files"
          :before-upload="beforeImageUpload"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :on-success="handleImageSuccess"
          v-model:file-list="fileList"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>

        <div>
          <div class="bottom" >
            <div class="bottom-left">
              <span class="title"> 图片大小</span>
              <span class="content"> 支持上传的图片大小， </span>
              <span class="content">最大32MB的图片文件</span>
            </div>
            <el-divider direction="vertical" />
            <div class="bottom-center">
              <span class="title"> 支持上传的图片格式，</span>
              <span class="content"> 推荐使用png、jpg、jpeg、 </span>
              <span class="content">webp，不支持gif、live及其转化后的图片</span>
            </div>
            <el-divider direction="vertical" border-style="dashed" />
            <div class="bottom-right">
              <span class="title"> 图片分辨率</span>
              <span class="content">
                不限制宽高比例，推荐上传3:4至
              </span>
              <span class="content">2:1之间、分辨率不低于720*960的照片，</span>
              <span class="content">超过1280P的图片用网页端上传画质更清晰</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled, Plus } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const activeTab = ref("video");
const imageUploadRef = ref();
const fileList = ref([]);

const router = useRouter();

const handleImageSuccess = (response: any, file: any, uploadFileList: any) => {
  ElMessage.success("上传成功，正在跳转编辑页面...");

  console.log(response.data)

  // 存储到 sessionStorage
  sessionStorage.setItem("uploadedImages", JSON.stringify(response.data));

  console.log(fileList)

  // 跳转
  router.push("/publish/edit-post");
};

const beforeVideoUpload = (file: File) => {
  const isVideo = file.type.startsWith("video/");
  const isLt20G = file.size / 1024 / 1024 / 1024 < 20;
  if (!isVideo) ElMessage.error("请上传视频文件");
  if (!isLt20G) ElMessage.error("视频大小不能超过 20GB");
  return isVideo && isLt20G;
};

const handleExceed = () => {
  ElMessage.warning("只能上传 1 个视频文件");
};

const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) ElMessage.error("只能上传图片文件");
  return isImage;
};

const handlePreview = (file: any) => {
  window.open(file.url || file.response?.url);
};

const handleRemove = (file: any) => {
  ElMessage.info(`已移除文件 ${file.name}`);
};
</script>

<style scoped>
.upload{
  
}
.upload-area {
  height: 400px;
  margin-top: 20px;
  border: 2px dashed #dcdfe6;
  padding: 20px;
  text-align: center;
}
.el-upload__tip p {
  margin: 4px 0;
  color: #888;
  font-size: 13px;
}
.btn {
  width: 100px;
  height: 35px;
  margin-top: 10px;
}
.bottom {
  display: flex;
  justify-content:space-around;
  margin-top: 30px;
  margin-bottom: 30px;
}
.bottom-left {
  display: flex;
  flex-direction: column;
}
.bottom-center {
  display: flex;
  flex-direction: column;
}
.bottom-right {
  display: flex;
  flex-direction: column;
}
.title{
  font-size: 14px;
    line-height: 22px;
    color: #262626;
    font-family: "PingFang SC";
    margin-bottom: 4px;
}
.content{
  margin-block-end: 0;
    font-size: 12px;
    text-align: left;
    line-height: 20px;
    font-family: "PingFang SC";
    color: #8c8c8c;
}
</style>
