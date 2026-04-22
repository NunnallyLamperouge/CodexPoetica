<template>
  <div class="workspace">
    <div class="toolbar">
      <div class="toolbar-left">
        <select v-model="store.language" @change="onLanguageChange" class="lang-select">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button class="btn-ghost" @click="loadExample">示例代码</button>
      </div>
      <div class="toolbar-right">
        <button class="btn-ghost" @click="showShare = true">保存 / 分享</button>
      </div>
    </div>

    <div class="main">
      <div class="left-panel">
        <div class="panel-label">代码编辑器</div>
        <div v-if="store.parseError" class="parse-error">{{ store.parseError }}</div>
        <CodeEditor
          v-model="code"
          :language="store.language"
          :monacoTheme="store.monacoTheme"
          class="editor"
          @update:modelValue="onCodeChange"
        />
      </div>

      <div class="right-panel">
        <div class="right-top">
          <div class="panel-section poem-section">
            <div class="panel-label">
              诗歌
              <select v-model="store.mappingProfileId" @change="onProfileChange" class="profile-select">
                <option v-for="p in store.mappingProfiles" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <PoemPanel :poem="store.poemResult" />
          </div>
          <div class="panel-section tree-section">
            <div class="panel-label">代码树</div>
            <CodeTree
              :astSummary="store.astSummary"
              :codeDna="store.codeDna"
              :theme="store.visualConfig?.theme"
              :playing="store.isPlaying"
              :getFrequencyData="store.getFrequencyData"
            />
          </div>
        </div>
        <AudioPlayer
          :playing="store.isPlaying"
          :audioConfig="store.audioConfig"
          :supported="store.audioSupported"
          :error="store.audioError"
          @toggle="store.toggleAudio()"
        />
      </div>
    </div>

    <footer class="footer">
      <button class="btn-action" @click="showShare = true">保存草稿</button>
      <button class="btn-action btn-green" @click="showShare = true">发布分享</button>
      <button class="btn-action" @click="exportPoem">导出诗歌</button>
      <button class="btn-action" @click="exportImage">导出图片</button>
      <button class="btn-action" @click="exportJSON">导出 JSON</button>
    </footer>

    <ShareModal v-if="showShare" @close="showShare = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkStore } from '../stores/work.js'
import { api } from '../api/index.js'
import CodeEditor from '../components/CodeEditor.vue'
import PoemPanel from '../components/PoemPanel.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import CodeTree from '../components/CodeTree.vue'
import ShareModal from '../components/ShareModal.vue'

const store = useWorkStore()
const route = useRoute()
const showShare = ref(false)
const code = ref('')


let debounceTimer = null

onMounted(async () => {
  await store.loadMappingProfiles()
  const workId = route.query.workId
  if (workId) {
    try {
      const res = await api.getWork(workId)
      const work = res.data.data
      if (work) {
        store.currentWorkId = work.id
        store.language = work.language || 'javascript'
        store.mappingProfileId = work.mappingProfileId || 'default'
        code.value = work.sourceCode || ''
        await store.processCode(code.value)
        return
      }
    } catch {}
  }
  const saved = localStorage.getItem('codex_draft_code')
  if (saved) {
    code.value = saved
    await store.processCode(saved)
  }
})

function onCodeChange(val) {
  localStorage.setItem('codex_draft_code', val)
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => store.processCode(val), 600)
}

function onLanguageChange() {
  if (code.value) store.processCode(code.value)
}

function onProfileChange() {
  if (code.value) store.processCode(code.value)
}

const JS_EXAMPLE = `function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const result = fibonacci(10)
const sequence = Array.from({ length: 10 }, (_, i) => fibonacci(i))
console.log(sequence)`

const PY_EXAMPLE = `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

result = fibonacci(10)
sequence = [fibonacci(i) for i in range(10)]
print(sequence)`

function loadExample() {
  code.value = store.language === 'python' ? PY_EXAMPLE : JS_EXAMPLE
  onCodeChange(code.value)
}

function exportPoem() {
  if (!store.poemResult) return
  const text = [store.poemResult.title, '', ...store.poemResult.lines].join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = (store.poemResult.title || 'poem') + '.txt'
  a.click()
  api.recordExport({ workId: store.currentWorkId, exportType: 'TXT', fileName: a.download }).catch(() => {})
}

function exportImage() {
  const canvas = document.querySelector('.code-tree')
  if (!canvas) return
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = 'code-tree.png'
  a.click()
  api.recordExport({ workId: store.currentWorkId, exportType: 'PNG', fileName: 'code-tree.png' }).catch(() => {})
}

function exportJSON() {
  if (!store.astSummary) return
  const snapshot = {
    title: store.poemResult?.title || '未命名',
    language: store.language,
    astSummary: store.astSummary,
    poemResult: store.poemResult,
    audioConfig: store.audioConfig,
    visualConfig: store.visualConfig,
    mappingProfileId: store.mappingProfileId,
    exportedAt: new Date().toISOString(),
  }
  const fileName = (store.poemResult?.title || 'work') + '.json'
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
  a.download = fileName
  a.click()
  api.recordExport({ workId: store.currentWorkId, exportType: 'JSON', fileName }).catch(() => {})
}
</script>

<style scoped>
.workspace { display: flex; flex-direction: column; height: calc(100vh - 52px); background: var(--bg-primary); color: var(--text-primary); }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 20px;
  background: linear-gradient(180deg, rgba(30,38,50,0.9) 0%, var(--bg-secondary) 100%);
  border-bottom: 1px solid var(--border-primary);
}
.toolbar-left, .toolbar-right { display: flex; gap: 10px; align-items: center; }

.lang-select, .profile-select {
  background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  padding: 5px 10px; font-size: 0.85rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  cursor: pointer;
}
.lang-select:hover, .profile-select:hover {
  border-color: var(--border-hover);
}
.lang-select:focus, .profile-select:focus {
  outline: none; border-color: var(--accent-green);
  box-shadow: 0 0 0 2px var(--glow-green);
}

.btn-ghost {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  padding: 6px 14px; cursor: pointer; font-size: 0.85rem;
  transition: all var(--transition-fast);
}
.btn-ghost:hover {
  color: var(--text-primary); border-color: var(--accent-green);
  background: rgba(74, 222, 128, 0.05);
  box-shadow: 0 0 8px var(--glow-green);
}

.main { display: flex; flex: 1; overflow: hidden; }

.left-panel {
  display: flex; flex-direction: column; width: 50%;
  border-right: 1px solid var(--border-primary);
  position: relative;
}
.left-panel::after {
  content: ''; position: absolute; top: 0; right: -1px; bottom: 0; width: 1px;
  background: linear-gradient(180deg, transparent 0%, rgba(74,222,128,0.15) 50%, transparent 100%);
  pointer-events: none;
}

.right-panel { display: flex; flex-direction: column; flex: 1; }
.right-top { display: flex; flex: 1; overflow: hidden; }

.panel-section {
  display: flex; flex-direction: column; flex: 1;
  border-right: 1px solid var(--border-primary); overflow: hidden;
}
.tree-section {
  border-right: none;
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
}

.panel-label {
  padding: 8px 14px; font-size: 0.75rem; color: var(--text-secondary);
  background: linear-gradient(180deg, rgba(22,27,34,1) 0%, rgba(13,17,23,0.8) 100%);
  border-bottom: 1px solid var(--border-primary);
  display: flex; align-items: center; gap: 8px;
  letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600;
}

.parse-error {
  padding: 6px 14px; background: rgba(248,81,73,0.1);
  color: var(--accent-red); font-size: 0.8rem;
  border-bottom: 1px solid rgba(248,81,73,0.2);
}

.editor { flex: 1; }
.poem-section { max-width: 50%; }

.footer {
  display: flex; gap: 10px; padding: 12px 20px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(22,27,34,1) 100%);
  border-top: 1px solid var(--border-primary);
}

.btn-action {
  padding: 8px 18px; background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 0.85rem;
  transition: all var(--transition-fast);
}
.btn-action:hover {
  background: var(--border-primary);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}
.btn-green {
  background: var(--accent-green-dim); border-color: var(--accent-green-dim); color: #fff;
}
.btn-green:hover {
  background: var(--accent-green-hover);
  box-shadow: 0 3px 12px rgba(35,134,54,0.4);
}
</style>
