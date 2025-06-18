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
            <img v-else :src="currentUrl" class="media" />
          </template>

          <button
              v-if="detail?.fileUrls?.length > 1"
              class="arrow left"
              @click.stop="prev"
          >&lt;</button>
          <button
              v-if="detail?.fileUrls?.length > 1"
              class="arrow right"
              @click.stop="next"
          >&gt;</button>
        </div>

        <!-- 右侧信息面板 -->
        <div class="info-panel">
          <div class="info-header">
            <h2 class="title">{{ detail?.title }}</h2>
          </div>

          <div class="scroll-area">
            <p class="description">{{ detail?.description }}</p>
            <el-divider />

            <!-- 评论列表 -->
            <div class="comment-list">
              <div v-if="rootComments.length === 0">暂无评论</div>
              <div v-else>
                <div v-for="root in rootComments" :key="root.id" class="comment-item">
                  <p><strong>{{ root.username }}</strong>：{{ root.text }}</p>
                  <div class="comment-meta-row">
                    <p class="comment-meta">{{ formatDate(root.createdAt) }}</p>
                    <button class="reply-btn" @click="setReply(root.id)">回复</button>
                  </div>

                  <!-- 折叠/展开所有子孙回复 -->
                  <div v-if="descendantsMap[root.id]?.length">
                    <button class="reply-btn" @click="toggleReplies(root.id)">
                      {{ expanded[root.id] ? '收起' : `查看${descendantsMap[root.id].length}条回复` }}
                    </button>
                  </div>

                  <!-- 展示所有子孙回复列表 -->
                  <div
                      v-if="expanded[root.id]"
                      v-for="reply in descendantsMap[root.id]"
                      :key="reply.id"
                      class="reply-item"
                      style="margin-left: 20px"
                  >
                    <p>
                      <strong>{{ reply.username }}</strong> 回复
                      <strong>@{{ reply.parentUsername }}</strong>：{{ reply.text }}
                    </p>
                    <div class="comment-meta-row">
                      <p class="comment-meta">{{ formatDate(reply.createdAt) }}</p>
                      <button
                          class="reply-btn"
                          @click="setReply(reply.id)"
                      >回复</button>
                    </div>
                  </div>
                </div>
                <div v-if="hasMore" class="reply-btn">
                  <button @click="loadMoreComments">加载更多评论</button>
                </div>
              </div>
            </div>
          </div>

          <div class="info-footer">
            <input
                v-model="newComment"
                class="comment-input"
                :placeholder="replyParentId ? `回复 @${replyParentUsername}` : '写下评论...'"
            />
            <button class="send-button" @click="submitComment">发送</button>
            <div class="meta">
              <div class="meta-item" @click="toggleLike">
                <img :src="liked ? '/icons/HeroiconsOutlineRedHeart.svg' : '/icons/HeroiconsOutlineHeart.svg'" class="icon" />
                <span>{{ detail?.likeCount }}</span>
              </div>
              <div class="meta-item">
                <img src="/icons/HeroiconsOutlineChatBubbleLeftEllipsis.svg" class="icon" />
                <span>{{ detail?.commentCount }}</span>
              </div>
              <div class="meta-item">
                <img src="/icons/HeroiconsOutlineEye.svg" class="icon" />
                <span>{{ detail?.viewCount }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import request from '@/http/request.js'

const props = defineProps({ visible: Boolean, contentId: Number })
const emit = defineEmits(['update:visible', 'updateDetail'])

const detail = ref(null)
const activeIndex = ref(0)
const liked = ref(false)
const comments = ref([])
const newComment = ref('')
const replyParentId = ref(null)
const replyParentUsername = ref('')
const expanded = ref({})

const currentUrl = computed(() => {
  const url = detail.value?.fileUrls?.[activeIndex.value] || ''
  if (!url) return ''
  return url.startsWith('http')
      ? url
      : `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`
})

const isImage = url => /\.(jpe?g|png|webp|gif)$/i.test(url)
const prev = () => {
  const len = detail.value?.fileUrls?.length || 0
  if (!len) return
  activeIndex.value = (activeIndex.value - 1 + len) % len
}
const next = () => {
  const len = detail.value?.fileUrls?.length || 0
  if (!len) return
  activeIndex.value = (activeIndex.value + 1) % len
}
const handleClose = () => {
  emit('update:visible', false)
  activeIndex.value = 0
  detail.value = null
  comments.value = []
  newComment.value = ''
  replyParentId.value = null
  replyParentUsername.value = ''
  expanded.value = {}
}

const formatDate = str => {
  const d = new Date(str)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}

const rootComments = computed(() => comments.value.filter(c => !c.parentId))
const childrenMap = computed(() => {
  const map = {}
  comments.value.forEach(c => {
    if (c.parentId) {
      map[c.parentId] = map[c.parentId] || []
      const parent = comments.value.find(p => p.id === c.parentId)
      map[c.parentId].push({ ...c, parentUsername: parent?.username || '' })
    }
  })
  return map
})

const descendantsMap = computed(() => {
  const map = {}
  const dfs = (id, level = 1) => {
    const list = []
    const children = childrenMap.value[id] || []
    children.forEach(child => {
      list.push({ ...child, level })
      list.push(...dfs(child.id, level + 1))
    })
    return list
  }
  rootComments.value.forEach(root => {
    map[root.id] = dfs(root.id)
  })
  return map
})

const toggleReplies = id => { expanded.value[id] = !expanded.value[id] }
const setReply = id => {
  replyParentId.value = id
  const parent = comments.value.find(c => c.id === id)
  replyParentUsername.value = parent?.username || ''
}
const pageNum = ref(1)
const pageSize = 100
const total = ref(0)
const hasMore = computed(() => comments.value.length < total.value)


const fetchComments = async (id, reset = false) => {
  try {
    if (reset) {
      pageNum.value = 1
      comments.value = []
    }
    const res = await request.get(`/contents/${id}/comments`, {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize
      }
    })
    const records = res.data?.data?.records || []
    total.value = res.data?.data?.total || 0

    if (reset) {
      comments.value = records
    } else {
      comments.value.push(...records)
    }

    comments.value.forEach(c => {
      if (!c.parentId) expanded.value[c.id] = false
    })

  } catch (e) {
    console.error(e)
  }
}
const loadMoreComments = async () => {
  pageNum.value += 1
  await fetchComments(props.contentId)
}


const submitComment = async () => {
  const text = newComment.value.trim()
  if (!text) return
  try {
    await request.post(`/contents/${props.contentId}/comments`, {text, parentId: replyParentId.value})
    newComment.value = ''
    replyParentId.value = null
    replyParentUsername.value = ''
    await fetchComments(props.contentId,true)
    detail.value.commentCount++
    emit('updateDetail', {
      id: detail.value.id,
      likeCount: detail.value.likeCount,
      commentCount: detail.value.commentCount,
      viewCount: detail.value.viewCount
    })
  } catch (e) {
    console.error(e)
  }
}

const toggleLike = async () => {
  if (!detail.value?.id) return
  liked.value = !liked.value
  detail.value.likeCount += liked.value ? 1 : -1
  try {
    await request.post(`/contents/${detail.value.id}/like-switch`)
    emit('updateDetail', {
      id: detail.value.id,
      likeCount: detail.value.likeCount,
      commentCount: detail.value.commentCount,
      viewCount: detail.value.viewCount
    })
  } catch (e) {
    liked.value = !liked.value
    detail.value.likeCount += liked.value ? 1 : -1
    console.error(e)
  }
}

watch(() => [props.contentId, props.visible], async ([newId, isVisible]) => {
  if (newId && isVisible) {
    try {
      const res = await request.get(`/contents/${newId}`)
      detail.value = res.data?.data || null
      liked.value = false
      const likeRes = await request.get(`/contents/${newId}/like-status`)
      liked.value = likeRes.data?.data === true
      emit('updateDetail', {
        id: detail.value.id,
        likeCount: detail.value.likeCount,
        commentCount: detail.value.commentCount,
        viewCount: detail.value.viewCount
      })
      await fetchComments(newId, true)
    } catch (e) {
      console.error(e)
    }
  }
}, {immediate: true})
</script>

<style scoped>
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

.content-preview-dialog {
  position: relative;
  display: flex;
  border-radius: 16px;
  width: 1400px;
  height: 800px;
  overflow: visible;
  background: transparent;
}

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

.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

.comment-list {
  overflow-y: auto;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 8px 0;
}

.comment-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-item {
  margin-top: 4px;
}

.comment-meta {
  font-size: 12px;
  color: #aaa;
  margin: 0;
}

.reply-btn {
  font-size: 12px;
  color: #b80b0b;
  background: none;
  border: none;
  cursor: pointer;
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
  width: 60%;
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
  display: flex;
  flex-wrap: wrap; /* 可换行成多列 */
  justify-content: center;
  gap: 20px; /* 图标块间距 */
}

.meta-item {
  display: flex;
  flex-direction: column; /* 纵向排列：图标在上，数字在下 */
  align-items: center;
  cursor: pointer;
}

.meta-item span {
  margin-top: 4px;
  font-size: 14px;
  color: #333;
}

.meta-item .icon {
  width: 24px;
  height: 24px;
}


.custom-close {
  position: absolute;
  top: -20px;
  right: -100px;
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
