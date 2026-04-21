<template>
  <div class="poem-panel">
    <div v-if="!poem" class="empty">输入代码后，诗歌将在此生成</div>
    <template v-else>
      <div class="poem-title">{{ poem.title }}</div>
      <div class="poem-style">{{ styleLabel }}</div>
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

const visibleLines = ref(0)
const animKey = ref(0)

watch(() => props.poem, (newPoem) => {
  if (!newPoem) return
  visibleLines.value = 0
  animKey.value++
  const total = newPoem.lines?.length || 0
  let i = 0
  const tick = () => {
    if (i <= total) {
      visibleLines.value = i++
      setTimeout(tick, 150)
    }
  }
  setTimeout(tick, 50)
}, { deep: true })
</script>

<style scoped>
.poem-panel {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  color: #d1fae5;
  font-family: 'Georgia', serif;
}
.empty { color: #6b7280; font-style: italic; }
.poem-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 4px; color: #4ade80; }
.poem-style { font-size: 0.75rem; color: #6b7280; margin-bottom: 12px; }
.poem-line {
  margin: 6px 0;
  line-height: 1.8;
  font-size: 0.95rem;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.poem-line.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
