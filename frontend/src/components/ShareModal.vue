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
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: var(--bg-secondary); border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 28px; width: 420px; color: var(--text-primary);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(74,222,128,0.05);
  animation: modal-in 0.2s ease-out;
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
h3 { margin: 0 0 18px; color: var(--accent-green); font-size: 1.1rem; }
label { display: block; margin-bottom: 14px; font-size: 0.9rem; color: var(--text-secondary); }
input[type=text], input:not([type=checkbox]) {
  display: block; width: 100%; margin-top: 6px; padding: 9px 12px;
  background: var(--bg-primary); border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.9rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
input[type=text]:focus, input:not([type=checkbox]):focus {
  outline: none; border-color: var(--accent-green);
  box-shadow: 0 0 0 3px var(--glow-green);
}
.options { display: flex; gap: 18px; margin-bottom: 18px; }
.options label { display: flex; align-items: center; gap: 7px; color: var(--text-primary); cursor: pointer; }
.actions { display: flex; gap: 10px; margin-bottom: 14px; }
.btn-primary {
  padding: 9px 20px; background: var(--accent-green-dim); color: #fff;
  border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.9rem;
  transition: all var(--transition-fast);
}
.btn-primary:hover {
  background: var(--accent-green-hover);
  box-shadow: 0 3px 12px rgba(35,134,54,0.4);
  transform: translateY(-1px);
}
.btn-secondary {
  padding: 9px 20px; background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.9rem;
  transition: all var(--transition-fast);
}
.btn-secondary:hover {
  background: var(--border-primary); transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}
.btn-copy {
  padding: 4px 12px; background: var(--bg-tertiary); color: var(--text-primary);
  border: 1px solid var(--border-primary); border-radius: 4px; cursor: pointer; font-size: 0.8rem;
  transition: all var(--transition-fast);
}
.btn-copy:hover { border-color: var(--accent-green); color: var(--accent-green); }
.share-result {
  font-size: 0.85rem; color: var(--text-secondary);
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 12px; background: rgba(74,222,128,0.05);
  border: 1px solid rgba(74,222,128,0.15); border-radius: var(--radius-sm);
}
.share-result a { color: var(--accent-green); word-break: break-all; }
.error { color: var(--accent-red); font-size: 0.85rem; margin-top: 10px; }
</style>
