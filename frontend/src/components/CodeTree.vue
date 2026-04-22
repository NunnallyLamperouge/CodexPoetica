<template>
  <div class="canvas-wrapper" ref="wrapper">
    <canvas ref="canvas3d" class="code-tree" v-show="hasData"></canvas>
    <div v-if="!hasData" class="empty-state">
      <div class="empty-tree">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 42V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
          <path d="M24 22L16 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
          <path d="M24 22L32 28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
          <path d="M24 28L18 24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
          <path d="M24 28L30 24" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.25"/>
          <circle cx="24" cy="18" r="8" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
          <circle cx="16" cy="14" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
          <circle cx="32" cy="14" r="5" fill="none" stroke="currentColor" stroke-width="1" opacity="0.15"/>
        </svg>
      </div>
      <div class="empty-text">输入代码，生长你的树</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ParticleTree3D } from '../utils/particleTree3d.js'

const props = defineProps({
  astSummary: { type: Object, default: null },
  codeDna: { type: Object, default: null },
  theme: { type: String, default: 'forest_ink' },
  playing: { type: Boolean, default: false },
  getFrequencyData: { type: Function, default: null },
})

const wrapper = ref(null)
const canvas3d = ref(null)
let particle3d = null
let spectrumFrame = null
let resizeObserver = null

const hasData = computed(() => props.astSummary && props.astSummary.nodeCount > 0)

function syncCanvasSize() {
  if (!wrapper.value || !canvas3d.value) return
  const rect = wrapper.value.getBoundingClientRect()
  const w = Math.floor(rect.width) || 400
  const h = Math.floor(rect.height) || 300
  canvas3d.value.width = w
  canvas3d.value.height = h
}

onMounted(() => {
  syncCanvasSize()
  resizeObserver = new ResizeObserver(() => {
    syncCanvasSize()
    runVisualization()
  })
  if (wrapper.value) resizeObserver.observe(wrapper.value)
  nextTick(runVisualization)
})

function runVisualization() {
  stopAll()
  if (hasData.value && canvas3d.value) {
    particle3d = new ParticleTree3D(canvas3d.value)
    particle3d.animate(props.astSummary, props.theme, props.codeDna)
    if (props.playing) startSpectrum()
  }
}

function stopAll() {
  particle3d?.destroy()
  particle3d = null
  stopSpectrum()
}

watch(() => [props.astSummary, props.theme, props.codeDna], runVisualization, { deep: true })

watch(() => props.playing, (isPlaying) => {
  if (isPlaying) startSpectrum()
  else stopSpectrum()
})

function startSpectrum() {
  stopSpectrum()
  const tick = () => {
    const data = props.getFrequencyData?.()
    if (data) particle3d?.pulse(data)
    spectrumFrame = requestAnimationFrame(tick)
  }
  spectrumFrame = requestAnimationFrame(tick)
}

function stopSpectrum() {
  if (spectrumFrame) cancelAnimationFrame(spectrumFrame)
  spectrumFrame = null
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  particle3d?.destroy()
  stopSpectrum()
})
</script>

<style scoped>
.canvas-wrapper {
  width: 100%; height: 100%; position: relative;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.code-tree { display: block; width: 100%; height: 100%; }
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; color: var(--text-muted);
}
.empty-tree {
  color: var(--accent-green); opacity: 0.5;
  animation: tree-sway 4s ease-in-out infinite;
}
@keyframes tree-sway {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
.empty-text { font-size: 0.85rem; font-style: italic; }
</style>
