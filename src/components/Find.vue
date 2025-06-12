<template>
  <div class="find-page" ref="mainRef" @scroll="handleScroll">
    <div v-for="(item, index) in contentList" :key="item.id || index">
      <img :src="item.thumb" class="item-img" />

      <div class="item-title">{{ truncateTitle(item.title) }}</div>
      <div class="item-meta">
        <span class="meta-item">
          <img src="/icons/HeroiconsOutlineHeart.svg" class="icon" /> {{ item.likeCount }}
        </span>
        <span class="meta-item">
          <img src="/icons/HeroiconsOutlineChatBubbleLeftEllipsis.svg" class="icon" /> {{ item.commentCount }}
        </span>
        <span class="meta-item">
          <img src="/icons/HeroiconsOutlineEye.svg" class="icon" /> {{ item.viewCount }}
        </span>
      </div>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="no-more" v-else-if="!hasMore">已经到底啦</div>
    <button class="back-to-top" v-show="showBackTop" @click="scrollToTop">⬆</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/http/request'
const contentList = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = 20
const hasMore = ref(true)
const mainRef = ref(null)
const showBackTop = ref(false)

// 判断是否是图片链接
const isImage = (url) => /\.(jpe?g|png|webp|gif)$/i.test(url)

// 获取视频封面图
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

const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    // const res = await request.get('/content/page', {
    //   params: {
    //     pageNum: pageNum.value,
    //     pageSize: pageSize
    //   }
    // })
    // const json = await res.json()
    //模拟数据
    const res={
      "code": 0,
      "message": "string",
      "data": {
        "records": [
          {
            "id": 0,
            "userId": 0,
            "title": "string",
            "type": "string",
            "description": "string",
            "likeCount": 0,
            "commentCount": 0,
            "viewCount": 0,
            "fileUrls": [
                "/out2.mp4",
              "https://img.shetu66.com/2023/07/18/1689659210837955.png"
            ],
            "createdAt": "2025-06-05",
            "updatedAt": "string"
          }
        ],
        "total": 0
      }
    }
    const json = res

    if (json.code === 0) {
      const records = await Promise.all(
          json.data.records.map(async (item) => {
            const url = item.fileUrls[0]
            if (!url) return item
            item.thumb = isImage(url) ? url : await getVideoThumbnail(url)
            return item
          })
      )

      contentList.value.push(...records)
      pageNum.value++
      if (contentList.value.length >= res.data.total) {
        hasMore.value = false
      }
    }
  } catch (err) {
    console.error('加载失败', err)
  } finally {
    loading.value = false
  }
}
//测试下拉
// const allMockData = Array.from({ length: 100 }, (_, i) => ({
//   id: i,
//   userId: i,
//   title: `这是第 ${i + 1} 条内容`,
//   type: "mock",
//   description: "描述信息",
//   likeCount: Math.floor(Math.random() * 100),
//   commentCount: Math.floor(Math.random() * 50),
//   viewCount: Math.floor(Math.random() * 1000),
//   fileUrls: [
//     i % 2 === 0
//         ? "HK.jpg"
//         : "/out2.mp4",
//   ],
//   createdAt: "2025-06-12",
//   updatedAt: "2025-06-12"
// }))
//
// const loadMore = async () => {
//   if (loading.value || !hasMore.value) return
//
//   loading.value = true
//   try {
//     // 模拟分页获取数据
//     const start = (pageNum.value - 1) * pageSize
//     const end = start + pageSize
//     const pageRecords = allMockData.slice(start, end)
//
//     const records = await Promise.all(
//         pageRecords.map(async (item) => {
//           const url = item.fileUrls[0]
//           if (!url) return item
//           item.thumb = isImage(url) ? url : await getVideoThumbnail(url)
//           return item
//         })
//     )
//
//     contentList.value.push(...records)
//     pageNum.value++
//
//     if (contentList.value.length >= allMockData.length) {
//       hasMore.value = false
//     }
//   } catch (err) {
//     console.error('加载失败', err)
//   } finally {
//     loading.value = false
//   }
// }

const handleScroll = () => {
  const el = mainRef.value
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && !loading.value) {
    loadMore()
  }
  showBackTop.value = el.scrollTop > 400
}

const scrollToTop = () => {
  const el = mainRef.value
  if (!el) return
  el.scrollTo({ top: 0, behavior: 'smooth' })
}

const truncateTitle = (title) => {
  return title.length > 20 ? title.slice(0, 20) + '...' : title
}

onMounted(() => {
  loadMore()
})

</script>


<style scoped>
.find-page {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #ffffff;
  height: 100%;
}

.item-img {
  width: 230px;
  height: 300px;
  object-fit: cover;
  transition: filter 0.3s ease;
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
  gap:40px
}
.meta-item {
  align-items: center;
  gap: 20px;
}

.loading,
.no-more {
  width: 100%;
  text-align: center;
  padding: 16px;
  font-size: 14px;
  color: #999;
}

.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 40px;
  background-color: #409eff;
  color: white;
  padding: 10px 14px;
  border-radius: 50%;
  font-size: 18px;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.back-to-top:hover {
  background-color: #66b1ff;
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


</style>
