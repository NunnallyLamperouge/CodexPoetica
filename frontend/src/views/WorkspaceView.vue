<template>
  <div class="workspace">
    <header class="header">
      <span class="logo">Codex Poetica</span>
      <div class="header-actions">
        <select v-model="store.language" @change="onLanguageChange" class="lang-select">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button class="btn-ghost" @click="loadExample">示例代码</button>
        <button class="btn-ghost" @click="showShare = true">保存 / 分享</button>
      </div>
    </header>

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
              :theme="store.visualConfig?.theme"
              :width="treeWidth"
              :height="treeHeight"
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
import { useWorkStore } from '../stores/work.js'
import { api } from '../api/index.js'
import CodeEditor from '../components/CodeEditor.vue'
import PoemPanel from '../components/PoemPanel.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import CodeTree from '../components/CodeTree.vue'
import ShareModal from '../components/ShareModal.vue'

const store = useWorkStore()
const showShare = ref(false)
const code = ref('')
const treeWidth = ref(400)
const treeHeight = ref(280)

let debounceTimer = null

onMounted(async () => {
  await store.loadMappingProfiles()
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
.workspace { display: flex; flex-direction: column; height: 100vh; background: #0d1117; color: #e6edf3; }
.header { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: #161b22; border-bottom: 1px solid #30363d; }
.logo { font-size: 1.1rem; font-weight: bold; color: #4ade80; letter-spacing: 1px; }
.header-actions { display: flex; gap: 8px; align-items: center; }
.lang-select, .profile-select { background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; padding: 4px 8px; font-size: 0.85rem; }
.btn-ghost { background: transparent; color: #8b949e; border: 1px solid #30363d; border-radius: 6px; padding: 5px 12px; cursor: pointer; font-size: 0.85rem; }
.btn-ghost:hover { color: #e6edf3; border-color: #8b949e; }
.main { display: flex; flex: 1; overflow: hidden; }
.left-panel { display: flex; flex-direction: column; width: 50%; border-right: 1px solid #30363d; }
.right-panel { display: flex; flex-direction: column; flex: 1; }
.right-top { display: flex; flex: 1; overflow: hidden; }
.panel-section { display: flex; flex-direction: column; flex: 1; border-right: 1px solid #30363d; overflow: hidden; }
.tree-section { border-right: none; }
.panel-label { padding: 6px 12px; font-size: 0.75rem; color: #8b949e; background: #161b22; border-bottom: 1px solid #30363d; display: flex; align-items: center; gap: 8px; }
.parse-error { padding: 4px 12px; background: #3d1a1a; color: #f85149; font-size: 0.8rem; }
.editor { flex: 1; }
.poem-section { max-width: 50%; }
.footer { display: flex; gap: 8px; padding: 10px 16px; background: #161b22; border-top: 1px solid #30363d; }
.btn-action { padding: 7px 16px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
.btn-action:hover { background: #30363d; }
.btn-green { background: #238636; border-color: #238636; }
.btn-green:hover { background: #2ea043; }
</style>
