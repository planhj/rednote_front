<template>
  <!-- 遮罩层：点击空白处关闭 -->
  <div v-if="visible" class="custom-overlay" @click.self="handleClose">
    <div class="content-preview-dialog">
      <!-- 自定义 × -->
      <button class="custom-close" @click="handleClose">×</button>

      <div class="content-preview-body">
        <!-- 左侧媒体区 -->
        <div class="media-container">
          <template v-if="currentUrl">
            <video
                v-if="!isImage(currentUrl)"
                :src="currentUrl"
                controls
                autoplay
                class="media"
            />
            <img
                v-else
                :src="currentUrl"
                class="media"
            />
          </template>

          <button
              v-if="detail?.fileUrls?.length > 1"
              class="arrow left"
              @click.stop="prev"
          >
            &lt;
          </button>
          <button
              v-if="detail?.fileUrls?.length > 1"
              class="arrow right"
              @click.stop="next"
          >
            &gt;
          </button>
        </div>

        <!-- 右侧信息面板 -->
        <div class="info-panel">
          <!-- 顶部：标题和描述 -->
          <div class="info-header">
            <h2 class="title">{{detail?.title}}</h2>
          </div>

          <div class="scroll-area">
            <p class="description">{{ detail?.description }}</p>
            <div class="comment-list">
              <p>这里是评论列表</p>
            </div>
          </div>

          <div class="info-footer">
            <input class="comment-input" placeholder="写下评论..." />
            <button class="send-button">发送</button>
            <div class="meta">
              <span @click="toggleLike" style="cursor: pointer">
                <img
                    :src="liked ? '/icons/HeroiconsOutlineRedHeart.svg' : '/icons/HeroiconsOutlineHeart.svg'"
                    class="icon"
                />
                {{ detail?.likeCount}}
              </span>
              <span><img src="/icons/HeroiconsOutlineChatBubbleLeftEllipsis.svg" class="icon" /> {{ detail?.commentCount }}</span>
              <span><img src="/icons/HeroiconsOutlineEye.svg" class="icon" /> {{ detail?.viewCount }}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import request from "@/http/request.js";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  contentId: {
    type: Number,
    required: true
  }
})

const detail = ref(null)
const activeIndex = ref(0)
const emit = defineEmits(['update:visible'])

const currentUrl = computed(() => {
  const url = detail.value?.fileUrls?.[activeIndex.value] || ''
  if (!url) return ''
  if (url.startsWith('http')) {d
    return url
  } else {
    console.log(`http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`)
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`
  }
})


const isImage = (url) => /\.(jpe?g|png|webp|gif)$/i.test(url)

const prev = () => {
  const len = detail.value?.fileUrls?.length || 0
  if (len === 0) return
  activeIndex.value = (activeIndex.value - 1 + len) % len
}

const next = () => {
  const len = detail.value?.fileUrls?.length || 0
  if (len === 0) return
  activeIndex.value = (activeIndex.value + 1) % len
}

const handleClose = () => {
  emit('update:visible', false)
  activeIndex.value = 0
  detail.value = null
}
watch(
    () => [props.contentId, props.visible],
    async ([newId, isVisible]) => {
      console.log(newId)
      if (newId && isVisible) {
        try {
          const res = await request.get(`/contents/${newId}`)
          detail.value = res.data?.data || null
          console.log(res)
          liked.value = false
          const likeRes = await request.get(`/contents/${newId}/like-status`)
          liked.value = likeRes.data?.data === true
        } catch (e) {
          console.error(e)
        }
      }
    },
    { immediate: true }
)
const liked = ref(false)
const toggleLike = async () => {
  if (!detail.value?.id) return

  // 本地先切换状态
  if (liked.value) {
    detail.value.likeCount--
  } else {
    detail.value.likeCount++
  }
  liked.value = !liked.value

  try {
    await request.post(`/contents/${detail.value.id}/like-switch`)
  } catch (e) {
    liked.value = !liked.value
    if (liked.value) {
      detail.value.likeCount++
    } else {
      detail.value.likeCount--
    }
    console.error(e)
  }
}
</script>

<style scoped>
/* 遮罩层 */
.custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 弹窗内容容器 */
.content-preview-dialog {
  position: relative;
  display: flex;
  border-radius: 16px;
  width: 1200px;
  height: 800px;
  overflow: visible;
  background: transparent;
}

/* 主体内部布局 */
.content-preview-body {
  display: flex;
  width: 100%;
  height: 100%;
}

.media-container {
  position: relative;
  width: 60%;
  height: 100%;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
}

.media {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(68, 73, 78, 0.45);
  color: white;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 50%;
}
.scroll-area {
  flex: 1;               /* 伸缩填充剩余高度 */
  overflow-y: auto;      /* 可滚动 */
  margin: 16px 0;        /* 与头尾留空 */
}

.left {
  left: 10px;
}

.right {
  right: 10px;
}

.info-panel {
  width: 40%;
  height: calc(100% - 30px);
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
  border-top-right-radius: 18px;
  border-bottom-right-radius: 18px;
  overflow: hidden;
}

.info-header {
  margin-bottom: 16px;
}

.info-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.comment-input {
  width: 40%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}
.send-button {
  padding: 8px 16px;
  background: #e80f28;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.meta {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 10px;
  color: #333;
}

.meta .icon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}

.title {
  font-size: 20px;
  margin-bottom: 12px;
}

.description {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.custom-close {
  position: absolute;
  top: -20px;     /* 向上 */
  right: -100px;   /* 向右 */
  background: #000;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
