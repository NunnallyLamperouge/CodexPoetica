<template>
  <div class="my-works">
    <div class="page-header">
      <h2>我的作品 <span class="count" v-if="works.length">共 {{ works.length }} 件</span></h2>
      <select v-model="sortBy" class="sort-select">
        <option value="newest">最新创建</option>
        <option value="oldest">最早创建</option>
        <option value="updated">最近更新</option>
      </select>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="works.length === 0" class="empty">
      <div class="empty-icon">✦</div>
      <p>还没有作品，去创作第一首吧</p>
      <RouterLink to="/" class="btn-create">开始创作</RouterLink>
    </div>

    <div v-else class="works-grid">
      <div v-for="work in sortedWorks" :key="work.id" class="work-card">
        <div class="card-top">
          <div class="card-title">{{ work.title || '未命名作品' }}</div>
          <div class="card-badges">
            <span class="badge lang">{{ work.language === 'javascript' ? 'JS' : 'PY' }}</span>
            <span class="badge" :class="work.status">{{ statusLabel(work.status) }}</span>
          </div>
        </div>
        <div class="card-poem" v-if="work.poemResult?.title">
          <span class="poem-icon">✦</span> {{ work.poemResult.title }}
        </div>
        <div class="card-meta">{{ formatDate(work.createdAt) }}</div>
        <div class="card-actions">
          <button class="btn-edit" @click="editWork(work)">继续编辑</button>
          <button class="btn-share" @click="shareWork(work)" :disabled="sharing === work.id">
            {{ sharing === work.id ? '发布中...' : work.status === 'published' ? '重新分享' : '发布分享' }}
          </button>
          <button class="btn-delete" @click="deleteWork(work)">删除</button>
        </div>
        <div v-if="shareLinks[work.id]" class="share-link">
          <a :href="shareLinks[work.id]" target="_blank">{{ shareLinks[work.id] }}</a>
          <button class="btn-copy" @click="copy(shareLinks[work.id])">复制</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/index.js'
import { useWorkStore } from '../stores/work.js'

const router = useRouter()
const store = useWorkStore()
const works = ref([])
const loading = ref(true)
const sortBy = ref('newest')
const sharing = ref(null)
const shareLinks = ref({})

onMounted(async () => {
  try {
    const res = await api.listWorks()
    works.value = res.data.data || []
  } catch {
    works.value = []
  } finally {
    loading.value = false
  }
})

const sortedWorks = computed(() => {
  const arr = [...works.value]
  if (sortBy.value === 'newest') return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (sortBy.value === 'oldest') return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

function statusLabel(status) {
  return { draft: '草稿', published: '已发布', archived: '已归档' }[status] || status
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function editWork(work) {
  router.push(`/?workId=${work.id}`)
}

async function shareWork(work) {
  sharing.value = work.id
  try {
    const res = await api.shareWork(work.id, { allowCodeView: 1, allowDownload: 1 })
    const shareCode = res.data.data?.shareCode
    if (shareCode) {
      shareLinks.value[work.id] = window.location.origin + '/shares/' + shareCode
      work.status = 'published'
    }
  } catch (e) {
    alert('发布失败：' + (e.response?.data?.message || e.message))
  } finally {
    sharing.value = null
  }
}

async function deleteWork(work) {
  if (!confirm(`确定删除「${work.title || '未命名作品'}」？`)) return
  try {
    await api.deleteWork(work.id)
    works.value = works.value.filter(w => w.id !== work.id)
  } catch (e) {
    alert('删除失败')
  }
}

function copy(text) {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.my-works { padding: 24px; min-height: calc(100vh - 48px); background: #0d1117; color: #e6edf3; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-header h2 { font-size: 1.3rem; color: #e6edf3; }
.count { font-size: 0.9rem; color: #8b949e; font-weight: normal; margin-left: 8px; }
.sort-select { background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; padding: 5px 10px; font-size: 0.85rem; }
.loading { color: #8b949e; padding: 40px; text-align: center; }
.empty { text-align: center; padding: 80px 20px; color: #8b949e; }
.empty-icon { font-size: 2.5rem; color: #4ade80; margin-bottom: 16px; }
.empty p { margin-bottom: 20px; font-size: 1rem; }
.btn-create { display: inline-block; padding: 10px 24px; background: #238636; color: #fff; border-radius: 8px; text-decoration: none; font-size: 0.95rem; }
.works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.work-card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.15s; }
.work-card:hover { border-color: #4ade80; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.card-title { font-size: 1rem; font-weight: 600; color: #e6edf3; flex: 1; }
.card-badges { display: flex; gap: 4px; flex-shrink: 0; }
.badge { padding: 2px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; }
.badge.lang { background: #1f3a5f; color: #60a5fa; }
.badge.draft { background: #2d2a1a; color: #f59e0b; }
.badge.published { background: #1a2e1a; color: #4ade80; }
.badge.archived { background: #21262d; color: #8b949e; }
.card-poem { font-size: 0.85rem; color: #8b949e; font-style: italic; }
.poem-icon { color: #4ade80; }
.card-meta { font-size: 0.78rem; color: #484f58; }
.card-actions { display: flex; gap: 6px; }
.btn-edit { flex: 1; padding: 6px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }
.btn-edit:hover { background: #30363d; }
.btn-share { flex: 1; padding: 6px; background: #238636; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }
.btn-share:hover:not(:disabled) { background: #2ea043; }
.btn-share:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-delete { padding: 6px 10px; background: transparent; color: #6b7280; border: 1px solid #30363d; border-radius: 6px; cursor: pointer; font-size: 0.82rem; }
.btn-delete:hover { color: #f85149; border-color: #f85149; }
.share-link { font-size: 0.78rem; color: #8b949e; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.share-link a { color: #4ade80; word-break: break-all; }
.btn-copy { padding: 2px 8px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }
</style>
