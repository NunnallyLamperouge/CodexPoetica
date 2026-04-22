<template>
  <canvas ref="canvasEl" :width="width" :height="height" class="code-tree"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { CanvasTree } from '../utils/canvasTree.js'
import { AstVisualizer } from '../utils/astVisualizer.js'

const props = defineProps({
  astSummary: { type: Object, default: null },
  theme: { type: String, default: 'forest_ink' },
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  mode: { type: String, default: 'tree' }, // 'tree' | 'ast'
  playing: { type: Boolean, default: false },
  getFrequencyData: { type: Function, default: null },
})

const canvasEl = ref(null)
let tree = null
let astViz = null
let spectrumFrame = null

onMounted(() => {
  tree = new CanvasTree(canvasEl.value)
  astViz = new AstVisualizer(canvasEl.value)
  runVisualization()
})

function runVisualization() {
  if (!canvasEl.value) return
  if (props.mode === 'ast') {
    tree.stop()
    if (props.astSummary && props.astSummary.nodeCount > 0) astViz.animate(props.astSummary, props.theme)
    else astViz.stop()
  } else {
    astViz.stop()
    if (props.astSummary && props.astSummary.nodeCount > 0) tree.animate(props.astSummary, props.theme)
    else tree.clear()
  }
}

watch(() => [props.astSummary, props.theme, props.mode], runVisualization)

watch(() => props.playing, (isPlaying) => {
  if (isPlaying) startSpectrum()
  else stopSpectrum()
})

function startSpectrum() {
  stopSpectrum()
  const tick = () => {
    if (!props.playing || props.mode === 'ast') return
    const data = props.getFrequencyData?.()
    if (data) tree.drawSpectrum(data)
    spectrumFrame = requestAnimationFrame(tick)
  }
  spectrumFrame = requestAnimationFrame(tick)
}

function stopSpectrum() {
  if (spectrumFrame) cancelAnimationFrame(spectrumFrame)
  spectrumFrame = null
}

onBeforeUnmount(() => {
  tree?.stop()
  astViz?.destroy()
  stopSpectrum()
})
</script>

<style scoped>
.code-tree { display: block; width: 100%; height: 100%; }
</style>
