<template>
  <div class="content-card" @click="handleCardClick">
    <div class="card-image-container">
      <img v-if="displayImage" :src="displayImage" :alt="content.title" class="card-image" @error="handleImageError" />
      <div v-else class="no-image">
        <el-icon size="40" color="#ccc">
          <Picture />
        </el-icon>
        <span>暂无图片</span>
      </div>

      <!-- 类型标签 -->
      <div class="type-tag" :class="`type-${content.type}`">
        <el-icon size="12">
          <component :is="typeIcon" />
        </el-icon>
        {{ typeText }}
      </div>

      <!-- 编辑按钮 -->
      <div class="edit-button" @click.stop="handleEdit">
        <el-icon size="16" color="#fff">
          <Edit />
        </el-icon>
      </div>
    </div>

    <div class="card-content">
      <h3 class="card-title" :title="content.title">{{ content.title }}</h3>
      <p class="card-description" :title="content.description">{{ content.description }}</p>

      <div class="card-meta">
        <span class="file-count" v-if="content.fileUrls && content.fileUrls.length">
          <el-icon size="12">
            <Paperclip />
          </el-icon>
          {{ content.fileUrls.length }} 个文件
        </span>
        <span class="create-time" v-if="content.createTime">
          {{ formatTime(content.createTime) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  Picture,
  Edit,
  Paperclip,
  PictureRounded,
  VideoPlay,
  Document
} from '@element-plus/icons-vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['edit', 'click'])

const imageError = ref(false)

// 获取显示的图片
const displayImage = computed(() => {
  if (imageError.value) return null

  const { fileUrls, type } = props.content
  if (!fileUrls || !fileUrls.length) return null

  // 如果是图片类型，显示第一张图片
  if (type === 'image') {
    return fileUrls[0]
  }

  // 其他类型可以考虑显示缩略图或默认图片
  return null
})

// 类型图标
const typeIcon = computed(() => {
  const iconMap = {
    image: PictureRounded,
    video: VideoPlay,
    audio: VideoPlay,
    document: Document
  }
  return iconMap[props.content.type] || Document
})

// 类型文本
const typeText = computed(() => {
  const textMap = {
    image: '图文',
    video: '视频',
    audio: '音频',
    document: '文档'
  }
  return textMap[props.content.type] || '文档'
})

// 格式化时间
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

const handleImageError = () => {
  imageError.value = true
}

const handleEdit = () => {
  emit('edit', props.content)
}

const handleCardClick = () => {
  emit('click', props.content)
}
</script>

<style scoped>
.content-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: fit-content;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.content-card:hover .card-image {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ccc;
  font-size: 12px;
  gap: 8px;
}

.type-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: white;
  display: flex;
  align-items: center;
  gap: 2px;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.5);
}

.type-image {
  background: rgba(76, 175, 80, 0.8);
}

.type-video {
  background: rgba(244, 67, 54, 0.8);
}

.type-audio {
  background: rgba(156, 39, 176, 0.8);
}

.type-document {
  background: rgba(33, 150, 243, 0.8);
}

.edit-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}

.content-card:hover .edit-button {
  opacity: 1;
}

.edit-button:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: scale(1.1);
}

.card-content {
  padding: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 2.8em;
}

.card-description {
  font-size: 12px;
  color: #606266;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: 2.8em;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #909399;
}

.file-count {
  display: flex;
  align-items: center;
  gap: 2px;
}

.create-time {
  color: #C0C4CC;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .card-image-container {
    height: 150px;
  }

  .card-content {
    padding: 10px;
  }

  .card-title {
    font-size: 13px;
  }

  .card-description {
    font-size: 11px;
  }
}
</style>