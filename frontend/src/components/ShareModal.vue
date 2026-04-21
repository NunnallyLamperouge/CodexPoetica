<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>保存 &amp; 分享</h3>
      <label>作品标题
        <input v-model="title" placeholder="输入标题..." />
      </label>
      <div class="options">
        <label><input type="checkbox" v-model="allowCodeView" /> 允许查看源码</label>
        <label><input type="checkbox" v-model="allowDownload" /> 允许下载</label>
      </div>
      <div class="actions">
        <button class="btn-secondary" @click="handleSave" :disabled="loading">保存草稿</button>
        <button class="btn-primary" @click="handleShare" :disabled="loading">发布分享</button>
      </div>
      <div v-if="shareUrl" class="share-result">
        <span>分享链接：</span>
        <a :href="shareUrl" target="_blank">{{ shareUrl }}</a>
        <button class="btn-copy" @click="copy">复制</button>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWorkStore } from '../stores/work.js'

const emit = defineEmits(['close'])
const store = useWorkStore()

const title = ref(store.poemResult?.title || '')
const allowCodeView = ref(true)
const allowDownload = ref(true)
const loading = ref(false)
const shareUrl = ref('')
const error = ref('')

async function handleSave() {
  loading.value = true
  error.value = ''
  try {
    await store.saveDraft(title.value)
  } catch (e) {
    error.value = '保存失败：' + (e.response?.data?.message || e.message)
  } finally {
    loading.value = false
  }
}

async function handleShare() {
  loading.value = true
  error.value = ''
  try {
    await store.saveDraft(title.value)
    const result = await store.publishShare({ allowCodeView: allowCodeView.value ? 1 : 0, allowDownload: allowDownload.value ? 1 : 0 })
    shareUrl.value = window.location.origin + '/shares/' + result.shareCode
  } catch (e) {
    error.value = '发布失败：' + (e.response?.data?.message || e.message)
  } finally {
    loading.value = false
  }
}

function copy() {
  navigator.clipboard.writeText(shareUrl.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #161b22; border: 1px solid #30363d; border-radius: 10px;
  padding: 24px; width: 400px; color: #e6edf3;
}
h3 { margin: 0 0 16px; color: #4ade80; }
label { display: block; margin-bottom: 12px; font-size: 0.9rem; color: #8b949e; }
input[type=text], input:not([type=checkbox]) {
  display: block; width: 100%; margin-top: 4px; padding: 8px;
  background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
  color: #e6edf3; font-size: 0.9rem;
}
.options { display: flex; gap: 16px; margin-bottom: 16px; }
.options label { display: flex; align-items: center; gap: 6px; color: #e6edf3; }
.actions { display: flex; gap: 8px; margin-bottom: 12px; }
.btn-primary { padding: 8px 16px; background: #238636; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.btn-secondary { padding: 8px 16px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 6px; cursor: pointer; }
.btn-copy { padding: 4px 10px; background: #21262d; color: #e6edf3; border: 1px solid #30363d; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.share-result { font-size: 0.85rem; color: #8b949e; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.share-result a { color: #4ade80; }
.error { color: #f85149; font-size: 0.85rem; margin-top: 8px; }
</style>
