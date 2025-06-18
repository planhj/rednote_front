<template>
  <el-dialog :model-value="visible" :title="mode === 'create' ? '发布内容' : '编辑内容'" width="600px"
    @update:model-value="handleClose" :close-on-click-modal="false">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择内容类型" style="width: 100%">
          <el-option label="图文" value="image" />
          <el-option label="视频" value="video" />
          <el-option label="音频" value="audio" />
          <el-option label="文档" value="document" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入内容描述" maxlength="500"
          show-word-limit />
      </el-form-item>

      <el-form-item label="文件" prop="fileUrls">
        <div class="file-upload-container">
          <el-upload v-model:file-list="fileList" :action="uploadAction" :headers="uploadHeaders"
            :on-success="handleUploadSuccess" :on-error="handleUploadError" :on-remove="handleRemove"
            :before-upload="beforeUpload" multiple drag>
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖拽到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png/gif/mp4/mp3/pdf等格式，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === 'create' ? '发布' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { createContent, editContent } from '@/http/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'create' // create | edit
  },
  contentData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref()
const loading = ref(false)
const fileList = ref([])

const formData = reactive({
  title: '',
  type: '',
  description: '',
  fileUrls: []
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度应在1-100个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择内容类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入内容描述', trigger: 'blur' },
    { min: 1, max: 500, message: '描述长度应在1-500个字符', trigger: 'blur' }
  ]
}

// 上传配置
const uploadAction = computed(() => {
  // 这里应该是你的文件上传接口
  return `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4523/m1/6493012-6193202-973503d5'}/upload`
})

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 监听props变化，初始化表单数据
watch(
  () => props.contentData,
  (newData) => {
    if (props.mode === 'edit' && newData) {
      Object.assign(formData, {
        title: newData.title || '',
        type: newData.type || '',
        description: newData.description || '',
        fileUrls: newData.fileUrls || []
      })

      // 设置文件列表
      fileList.value = (newData.fileUrls || []).map((url, index) => ({
        uid: index,
        name: `文件${index + 1}`,
        url: url,
        status: 'success'
      }))
    }
  },
  { immediate: true, deep: true }
)

// 监听visible变化，清空表单
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm()
    }
  }
)

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    title: '',
    type: '',
    description: '',
    fileUrls: []
  })
  fileList.value = []
}

const handleClose = () => {
  emit('update:visible', false)
}

const beforeUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mp3', 'application/pdf'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('上传文件格式不正确！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB！')
    return false
  }
  return true
}

const handleUploadSuccess = (response, file) => {
  if (response.code === 200) {
    formData.fileUrls.push(response.data.url)
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error('文件上传失败')
    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

const handleUploadError = () => {
  ElMessage.error('文件上传失败')
}

const handleRemove = (file) => {
  const index = formData.fileUrls.findIndex(url => url === file.url)
  if (index > -1) {
    formData.fileUrls.splice(index, 1)
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const submitData = { ...formData }

    if (props.mode === 'create') {
      await createContent(submitData)
      ElMessage.success('发布成功！')
    } else {
      await editContent(props.contentData.id, submitData)
      ElMessage.success('编辑成功！')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(props.mode === 'create' ? '发布失败' : '编辑失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.file-upload-container {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-textarea__inner) {
  resize: none;
}
</style>