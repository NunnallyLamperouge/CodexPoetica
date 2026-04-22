<template>
  <div class="poem-panel">
    <div v-if="!poem" class="empty">
      <div class="empty-icon">&#x2727;</div>
      <div class="empty-text">输入代码后，诗歌将在此生成</div>
    </div>
    <template v-else>
      <div class="poem-title">{{ poem.title }}</div>
      <div class="poem-meta">
        <span class="poem-style">{{ styleLabel }}</span>
        <span v-if="poem.shape" class="poem-shape">{{ shapeLabel }}</span>
      </div>
      <div class="poem-lines">
        <p
          v-for="(line, i) in poem.lines"
          :key="animKey + '-' + i"
          class="poem-line"
          :class="{ visible: visibleLines > i }"
          :style="{ transitionDelay: i * 150 + 'ms' }"
        >{{ line }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({ poem: { type: Object, default: null } })

const styleLabel = computed(() => {
  const map = { free_verse: '自由诗', haiku: '俳句', epic: '史诗', sonnet: '十四行诗', prose_poem: '散文诗' }
  return map[props.poem?.style] || ''
})

const shapeLabel = computed(() => {
  const map = { spiral: '螺旋递归', tower: '深渊塔形', flat: '平原展开', bush: '放射丛林', balanced: '均衡球形' }
  return map[props.poem?.shape] ? '✦ ' + map[props.poem.shape] : ''
})

const visibleLines = ref(0)
const animKey = ref(0)

watch(() => props.poem, (newPoem) => {
  if (!newPoem) return
  visibleLines.value = 0
  animKey.value++
  const total = newPoem.lines?.length || 0
  let i = 0
  const tick = () => {
    if (i < total) {
      visibleLines.value = i + 1
      i++
      setTimeout(tick, 150)
    }
  }
  setTimeout(tick, 50)
}, { deep: true })
</script>

<style scoped>
.poem-panel {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  color: #d1fae5;
  font-family: 'Georgia', serif;
}

.empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: var(--text-muted); gap: 12px;
}
.empty-icon {
  font-size: 2rem; color: var(--accent-green); opacity: 0.5;
  animation: empty-pulse 2.5s ease-in-out infinite;
}
@keyframes empty-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
.empty-text { font-size: 0.85rem; font-style: italic; }

.poem-title {
  font-size: 1.2rem; font-weight: bold; color: var(--accent-green);
  padding-bottom: 8px; margin-bottom: 4px;
  border-bottom: 2px solid rgba(74, 222, 128, 0.2);
  background: linear-gradient(90deg, rgba(74,222,128,0.08) 0%, transparent 100%);
  margin: -4px -8px 8px; padding: 6px 8px 8px;
  border-radius: 4px 4px 0 0;
}

.poem-meta { display: flex; gap: 8px; align-items: center; margin-bottom: 14px; }
.poem-style {
  font-size: 0.75rem; color: var(--text-secondary);
  padding: 2px 8px; background: rgba(255,255,255,0.04);
  border-radius: 10px; border: 1px solid var(--border-primary);
}
.poem-shape {
  font-size: 0.72rem; color: var(--accent-purple);
  background: rgba(167, 139, 250, 0.1); padding: 2px 9px;
  border-radius: 10px; border: 1px solid rgba(167, 139, 250, 0.2);
}

.poem-line {
  position: relative;
  margin: 0; padding: 7px 0 7px 14px;
  line-height: 1.8; font-size: 0.95rem;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  border-left: 2px solid transparent;
}
.poem-line.visible {
  opacity: 1; transform: translateY(0);
  border-left-color: rgba(74, 222, 128, 0.2);
}
.poem-line.visible:hover {
  border-left-color: var(--accent-green);
  background: rgba(74, 222, 128, 0.03);
}
</style>
