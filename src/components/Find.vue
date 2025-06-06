<template>
  <div class="find-page" ref="mainRef">
    <div class="card" v-for="(item, index) in contentList" :key="index">
      <img :src="item.img" class="card-img" />
      <div class="card-title">{{ item.title }}</div>
    </div>
    <div class="loading" v-if="loading">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const contentList = ref<any[]>([])
const loading = ref(false)
const mainRef = ref<HTMLElement | null>(null)

const loadMore = () => {
  loading.value = true
  setTimeout(() => {
    for (let i = 0; i < 20; i++) {
      contentList.value.push({
        title: `这是第 ${contentList.value.length + 1} 条内容`,
        img: `https://picsum.photos/230/300?random=${Math.random()}`,
      })
    }
    loading.value = false
  }, 800)
}

onMounted(() => {
  loadMore()
  mainRef.value?.addEventListener("scroll", () => {
    const el = mainRef.value!
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && !loading.value) {
      loadMore()
    }
  })
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
  background: #f7f7f7;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.card {
  width: 230px;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.05);
}
.card-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}
.card-title {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
}
.loading {
  width: 100%;
  text-align: center;
  padding: 16px;
  font-size: 14px;
  color: #999;
}
</style>
