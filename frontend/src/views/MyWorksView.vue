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
.my-works { padding: 28px; min-height: calc(100vh - 52px); background: var(--bg-primary); color: var(--text-primary); }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.page-header h2 { font-size: 1.3rem; color: var(--text-primary); }
.count { font-size: 0.9rem; color: var(--text-secondary); font-weight: normal; margin-left: 8px; }
.sort-select {
  background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  padding: 6px 12px; font-size: 0.85rem; cursor: pointer;
  transition: border-color var(--transition-fast);
}
.sort-select:hover { border-color: var(--border-hover); }
.sort-select:focus { outline: none; border-color: var(--accent-green); box-shadow: 0 0 0 2px var(--glow-green); }

.loading { color: var(--text-secondary); padding: 40px; text-align: center; }

.empty { text-align: center; padding: 80px 20px; color: var(--text-secondary); }
.empty-icon {
  font-size: 3rem; color: var(--accent-green); margin-bottom: 18px; opacity: 0.6;
  animation: empty-float 3s ease-in-out infinite;
}
@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.empty p { margin-bottom: 22px; font-size: 1rem; }
.btn-create {
  display: inline-block; padding: 11px 28px;
  background: var(--accent-green-dim); color: #fff;
  border-radius: var(--radius-md); text-decoration: none; font-size: 0.95rem;
  transition: all var(--transition-fast);
}
.btn-create:hover {
  background: var(--accent-green-hover);
  box-shadow: 0 4px 16px rgba(35,134,54,0.4);
  transform: translateY(-2px);
}

.works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }

.work-card {
  background: var(--bg-secondary); border: 1px solid var(--border-primary);
  border-radius: var(--radius-md); padding: 18px;
  display: flex; flex-direction: column; gap: 10px;
  transition: all var(--transition-normal);
}
.work-card:hover {
  border-color: rgba(74, 222, 128, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 20px var(--glow-green);
}

.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.card-title { font-size: 1rem; font-weight: 600; color: var(--text-primary); flex: 1; }
.card-badges { display: flex; gap: 5px; flex-shrink: 0; }
.badge {
  padding: 2px 9px; border-radius: 12px; font-size: 0.72rem; font-weight: 600;
  border: 1px solid transparent;
}
.badge.lang { background: rgba(96,165,250,0.1); color: var(--accent-blue); border-color: rgba(96,165,250,0.2); }
.badge.draft { background: rgba(245,158,11,0.1); color: var(--accent-amber); border-color: rgba(245,158,11,0.2); }
.badge.published { background: rgba(74,222,128,0.1); color: var(--accent-green); border-color: rgba(74,222,128,0.2); }
.badge.archived { background: rgba(139,148,158,0.1); color: var(--text-secondary); border-color: var(--border-primary); }

.card-poem { font-size: 0.85rem; color: var(--text-secondary); font-style: italic; }
.poem-icon { color: var(--accent-green); }
.card-meta { font-size: 0.78rem; color: var(--text-muted); }

.card-actions { display: flex; gap: 7px; }
.btn-edit {
  flex: 1; padding: 7px; background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 0.82rem; transition: all var(--transition-fast);
}
.btn-edit:hover { background: var(--border-primary); transform: translateY(-1px); }
.btn-share {
  flex: 1; padding: 7px; background: var(--accent-green-dim); color: #fff;
  border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.82rem;
  transition: all var(--transition-fast);
}
.btn-share:hover:not(:disabled) {
  background: var(--accent-green-hover);
  box-shadow: 0 2px 8px rgba(35,134,54,0.3);
  transform: translateY(-1px);
}
.btn-share:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-delete {
  padding: 7px 12px; background: transparent; color: var(--text-muted);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 0.82rem; transition: all var(--transition-fast);
}
.btn-delete:hover { color: var(--accent-red); border-color: var(--accent-red); background: rgba(248,81,73,0.05); }

.share-link {
  font-size: 0.78rem; color: var(--text-secondary);
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 8px 10px; background: rgba(74,222,128,0.04);
  border: 1px solid rgba(74,222,128,0.12); border-radius: var(--radius-sm);
}
.share-link a { color: var(--accent-green); word-break: break-all; }
.btn-copy {
  padding: 3px 9px; background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: 4px;
  cursor: pointer; font-size: 0.75rem; transition: all var(--transition-fast);
}
.btn-copy:hover { border-color: var(--accent-green); color: var(--accent-green); }
</style>
