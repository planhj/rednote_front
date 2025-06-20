<template>
  <div class="find-page" ref="container">
    <div
        v-for="(item, index) in contentList"
        :key="item.id || index"
        class="item"
    >
      <img
          :src="item.thumb"
          class="item-img"
          @click="openPreview(item)"
      />
      <div class="item-title">{{ truncateTitle(item.title) }}</div>
      <div class="item-meta">
        <span class="meta-item">
          <img src="/icons/HeroiconsOutlineHeart.svg" class="icon" />
          {{ item.likeCount }}
        </span>
        <span class="meta-item">
          <img src="/icons/HeroiconsOutlineChatBubbleLeftEllipsis.svg" class="icon" />
          {{ item.commentCount }}
        </span>
        <span class="meta-item">
          <img src="/icons/HeroiconsOutlineEye.svg" class="icon" />
          {{ item.viewCount }}
        </span>
      </div>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="no-more" v-else-if="!hasMore">已经到底啦</div>

    <!-- 自定义回到顶部按钮 -->
    <button
        class="back-to-top"
        v-show="showBackTop"
        @click="scrollToTop"
    >
      <el-icon><ArrowUpBold /></el-icon>
    </button>

    <ContentPreview
        v-model:visible="previewVisible"
        :content-id="previewId"
        :id-list="contentList.map(item => item.id)"
        @switchNote="previewId = $event"
        @updateDetail="handleUpdateDetail"
        @deleted="fetchList"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import ContentPreview from '@/components/ContentPreview.vue'
import request from '@/http/request'
import {useRoute} from "vue-router";
const keyword = ref("")
const container = ref(null)
const contentList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = 10
const hasMore = ref(true)
const showBackTop = ref(false)

const previewVisible = ref(false)
const previewId = ref(0)

const BASE_URL = 'http://192.168.0.199:8080'

const isImage = (url) => /\.(jpe?g|png|webp|gif)$/i.test(url)

const getVideoThumbnail = (videoUrl) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.currentTime = 0.1

    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg'))
    })

    video.addEventListener('error', reject)
  })
}

const openPreview = (item) => {
  previewId.value = item.id
  previewVisible.value = true
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await request.get('contents/recommended', {
      params: {pageNum: pageNum.value, pageSize}
    })
    if (res.data.code === 200) {
      const records = await Promise.all(
          res.data.data.records.map(async (item) => {
            const url = item.fileUrls[0]
            if (!url) {
              item.thumb = '/default.png'
              return item
            }
            const fullUrl = `${BASE_URL}${url}`
            item.thumb = isImage(fullUrl)
                ? fullUrl
                : await getVideoThumbnail(fullUrl)
            return item
          })
      )
      contentList.value.push(...records)
      pageNum.value++
      if (contentList.value.length >= res.data.data.total||records.length < pageSize) {
        hasMore.value = false
      }
    }
  } catch (err) {
    console.error('加载失败', err)
  } finally {
    loading.value = false
  }
}

const handleScroll = (e) => {
  const el = e.target
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight
  const scrollHeight = el.scrollHeight

  // 上拉加载
  if (scrollTop + clientHeight >= scrollHeight - 10 && !loading.value) {
    loadMore()
  }
  // 回到顶部按钮
  showBackTop.value = scrollTop > 400
}

const scrollToTop = () => {
  if (container.value) {
    container.value.scrollTo({top: 0, behavior: 'smooth'})
  }
}

const truncateTitle = (title) => {
  return title.length > 20 ? title.slice(0, 20) + '...' : title
}

// 保证首次加载内容就能滚动
const loadUntilScrollable = async () => {
  await loadMore()
  await nextTick()
  if (
      container.value.scrollHeight <= container.value.clientHeight &&
      hasMore.value
  ) {
    await loadUntilScrollable()
  }
}
const handleUpdateDetail = (newData) => {
  const item = contentList.value.find(i => i.id === newData.id)
  if (item) {
    item.likeCount = newData.likeCount
    item.commentCount = newData.commentCount
    item.viewCount = newData.viewCount
  }
}

const fetchList = async () => {
  keyword.value = ''
  pageNum.value = 1
  hasMore.value = true
  contentList.value = []
  await loadUntilScrollable()
}
const doSearch = async (newKeyword) => {
  keyword.value = newKeyword
  pageNum.value = 1
  hasMore.value = true
  contentList.value = []
  await loadUntilScrollable()
}

// 暴露方法
defineExpose({ fetchList,doSearch })
onMounted(() => {
  loadUntilScrollable()
  if (container.value) {
    container.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('scroll', handleScroll)
  }
})
const route = useRoute()
watch(
    () => route.query.t,
    () => {
      fetchList()
    }
)
</script>

<style scoped>
.find-page {
  height: 100vh;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
}

.item {
  display: flex;
  flex-direction: column;
}

.item-img {
  width: 230px;
  height: 300px;
  object-fit: cover;
  transition: filter 0.3s ease;
  border-radius: 10px;
}

.item-img:hover {
  filter: brightness(70%);
}

.item-title {
  width: 230px;
  font-size: 16px;
  color: #333;
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  width: 230px;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  width: 16px;
  height: 16px;
}

.loading,
.no-more {
  flex-basis: 100%;
  width: 100%;
  text-align: center;
  padding: 16px;
  font-size: 14px;
  color: #999;
}


.back-to-top {
  position: fixed;
  right: 50px;
  bottom: 40px;
  background-color: rgba(232, 15, 40, 0.78);
  color: white;
  padding: 10px 14px;
  border-radius: 100%;
  font-size: 18px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.back-to-top:hover {
  background-color: rgba(232, 15, 40, 0.87);
}
</style>
