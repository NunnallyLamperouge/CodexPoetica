<template>
  <div class="share-view">
    <header class="header">
      <a href="/" class="logo">Codex Poetica</a>
      <span class="subtitle">作品分享</span>
    </header>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <template v-else-if="pub">
      <div class="content">
        <div class="left">
          <div class="poem-card">
            <h2>{{ pub.title }}</h2>
            <div class="poem-lines">
              <p v-for="(line, i) in pub.poemResult?.lines" :key="i">{{ line }}</p>
            </div>
          </div>
          <div v-if="pub.allowCodeView && pub.sourceCode" class="code-card">
            <div class="card-label">原始代码 · {{ pub.language }}</div>
            <pre class="source-code">{{ pub.sourceCode }}</pre>
          </div>
          <div class="meta">
            <span>发布于 {{ formatDate(pub.publishedAt) }}</span>
            <button v-if="pub.allowDownload" class="btn-download" @click="downloadPoem">下载诗歌</button>
          </div>
        </div>
        <div class="right">
          <div class="card-label">代码树</div>
          <CodeTree
            :astSummary="pub.astSummary"
            :theme="pub.visualConfig?.theme || 'forest_ink'"
            :width="400"
            :height="360"
          />
          <AudioPlayer
            :playing="isPlaying"
            :audioConfig="pub.audioConfig"
            @toggle="toggleAudio"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api/index.js'
import { audioGen } from '../utils/audioGen.js'
import CodeTree from '../components/CodeTree.vue'
import AudioPlayer from '../components/AudioPlayer.vue'

const route = useRoute()
const pub = ref(null)
const loading = ref(true)
const error = ref('')
const isPlaying = ref(false)

onMounted(async () => {
  try {
    const res = await api.getShare(route.params.shareCode)
    pub.value = res.data.data
  } catch (e) {
    error.value = e.response?.data?.message || '分享链接不存在或已失效'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => audioGen.stop())

function toggleAudio() {
  isPlaying.value = audioGen.toggle(pub.value?.audioConfig, pub.value?.astSummary)
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('zh-CN')
}

function downloadPoem() {
  if (!pub.value?.poemResult) return
  const text = [pub.value.title, '', ...(pub.value.poemResult.lines || [])].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  a.download = (pub.value.title || 'poem') + '.txt'
  a.click()
}
</script>

<style scoped>
.share-view { min-height: 100vh; background: #0d1117; color: #e6edf3; }
.header { display: flex; align-items: center; gap: 12px; padding: 14px 24px; background: #161b22; border-bottom: 1px solid #30363d; }
.logo { color: #4ade80; font-weight: bold; font-size: 1.1rem; text-decoration: none; }
.subtitle { color: #8b949e; font-size: 0.9rem; }
.loading, .error-msg { padding: 40px; text-align: center; color: #8b949e; }
.error-msg { color: #f85149; }
.content { display: flex; gap: 24px; padding: 24px; max-width: 1100px; margin: 0 auto; }
.left { flex: 1; }
.right { width: 420px; }
.poem-card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 24px; margin-bottom: 16px; }
.poem-card h2 { color: #4ade80; margin: 0 0 16px; }
.poem-lines p { margin: 8px 0; line-height: 1.8; font-family: Georgia, serif; }
.code-card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
.card-label { font-size: 0.75rem; color: #8b949e; margin-bottom: 8px; }
.source-code { font-size: 0.85rem; color: #e6edf3; overflow-x: auto; white-space: pre-wrap; margin: 0; }
.meta { display: flex; align-items: center; gap: 16px; color: #8b949e; font-size: 0.85rem; }
.btn-download { padding: 6px 14px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; cursor: pointer; }
</style>
