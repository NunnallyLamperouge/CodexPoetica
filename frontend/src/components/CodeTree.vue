<template>
  <canvas ref="canvasEl" :width="width" :height="height" class="code-tree"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { CanvasTree } from '../utils/canvasTree.js'
import { AstVisualizer } from '../utils/astVisualizer.js'
import { ParticleTree3D } from '../utils/particleTree3d.js'

const props = defineProps({
  astSummary: { type: Object, default: null },
  theme: { type: String, default: 'forest_ink' },
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
  mode: { type: String, default: 'tree' }, // 'tree' | 'ast' | '3d'
  playing: { type: Boolean, default: false },
  getFrequencyData: { type: Function, default: null },
})

const canvasEl = ref(null)
let tree = null
let astViz = null
let particle3d = null
let spectrumFrame = null

onMounted(() => {
  tree = new CanvasTree(canvasEl.value)
  astViz = new AstVisualizer(canvasEl.value)
  particle3d = new ParticleTree3D(canvasEl.value)
  runVisualization()
})

function stopAll() {
  tree?.stop()
  astViz?.stop()
  particle3d?.destroy()
  stopSpectrum()
}

function runVisualization() {
  if (!canvasEl.value) return
  stopAll()

  if (props.mode === '3d') {
    if (props.astSummary && props.astSummary.nodeCount > 0) {
      particle3d = new ParticleTree3D(canvasEl.value)
      particle3d.animate(props.astSummary, props.theme)
      if (props.playing) startSpectrum3d()
    }
  } else if (props.mode === 'ast') {
    if (props.astSummary && props.astSummary.nodeCount > 0) astViz.animate(props.astSummary, props.theme)
    else astViz.stop()
  } else {
    if (props.astSummary && props.astSummary.nodeCount > 0) tree.animate(props.astSummary, props.theme)
    else tree.clear()
    if (props.playing) startSpectrum()
  }
}

watch(() => [props.astSummary, props.theme, props.mode], runVisualization)

watch(() => props.playing, (isPlaying) => {
  if (props.mode === '3d') {
    if (isPlaying) startSpectrum3d()
    else stopSpectrum()
  } else if (props.mode === 'tree') {
    if (isPlaying) startSpectrum()
    else stopSpectrum()
  }
})

function startSpectrum() {
  stopSpectrum()
  const tick = () => {
    const data = props.getFrequencyData?.()
    if (data) tree.drawSpectrum(data)
    spectrumFrame = requestAnimationFrame(tick)
  }
  spectrumFrame = requestAnimationFrame(tick)
}

function startSpectrum3d() {
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
  tree?.stop()
  astViz?.destroy()
  particle3d?.destroy()
  stopSpectrum()
})
</script>

<style scoped>
.code-tree { display: block; width: 100%; height: 100%; }
</style>
