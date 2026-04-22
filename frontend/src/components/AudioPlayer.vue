<template>
  <div class="audio-player">
    <button class="play-btn" :class="{ playing }" :disabled="!supported" @click="$emit('toggle')">
      {{ playing ? '⏸ 暂停' : '▶ 播放' }}
    </button>
    <span v-if="error" class="info error">{{ error }}</span>
    <span v-else-if="!supported" class="info muted">浏览器不支持音频</span>
    <span v-else-if="audioConfig" class="info config">
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
  display: flex; align-items: center; gap: 14px;
  padding: 10px 20px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(13,17,23,0.95) 100%);
  border-top: 1px solid var(--border-primary);
}
.play-btn {
  position: relative;
  padding: 7px 20px;
  background: var(--accent-green-dim); color: #fff;
  border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-size: 0.9rem;
  transition: all var(--transition-fast);
}
.play-btn:disabled { background: var(--bg-tertiary); color: var(--text-muted); cursor: not-allowed; }
.play-btn:not(:disabled):hover {
  background: var(--accent-green-hover);
  box-shadow: 0 2px 10px rgba(35,134,54,0.4);
  transform: translateY(-1px);
}
.play-btn.playing {
  animation: pulse-glow 1.5s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(35,134,54,0.3); }
  50% { box-shadow: 0 0 16px rgba(74,222,128,0.4); }
}
.info { font-size: 0.8rem; color: var(--text-secondary); }
.info.config { font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 0.3px; }
.muted { color: var(--text-muted); }
.error { color: var(--accent-red); }
</style>
