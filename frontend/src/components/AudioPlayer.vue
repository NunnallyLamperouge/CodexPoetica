<template>
  <div class="audio-player">
    <button class="play-btn" :disabled="!supported" @click="$emit('toggle')">
      {{ playing ? '⏸ 暂停' : '▶ 播放' }}
    </button>
    <span v-if="error" class="info error">{{ error }}</span>
    <span v-else-if="!supported" class="info muted">浏览器不支持音频</span>
    <span v-else-if="audioConfig" class="info">
      {{ audioConfig.bpm }} BPM · {{ audioConfig.scale }} · {{ audioConfig.durationSec }}s
    </span>
    <span v-else class="info muted">输入代码后生成音乐</span>
  </div>
</template>

<script setup>
defineProps({
  playing: { type: Boolean, default: false },
  audioConfig: { type: Object, default: null },
  supported: { type: Boolean, default: true },
  error: { type: String, default: null },
})
defineEmits(['toggle'])
</script>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #161b22;
  border-top: 1px solid #30363d;
}
.play-btn {
  padding: 6px 16px;
  background: #238636;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.play-btn:disabled { background: #21262d; color: #484f58; cursor: not-allowed; }
.play-btn:not(:disabled):hover { background: #2ea043; }
.info { font-size: 0.8rem; color: #8b949e; }
.muted { color: #484f58; }
.error { color: #f85149; }
</style>
