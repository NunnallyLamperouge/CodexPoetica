<template>
  <div class="canvas-wrapper">
    <canvas ref="canvas2d" :width="width" :height="height" class="code-tree" :style="{ display: mode === '3d' ? 'none' : 'block' }"></canvas>
    <canvas ref="canvas3d" :width="width" :height="height" class="code-tree" :style="{ display: mode === '3d' ? 'block' : 'none' }"></canvas>
  </div>
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
  mode: { type: String, default: 'tree' },
  playing: { type: Boolean, default: false },
  getFrequencyData: { type: Function, default: null },
})

const canvas2d = ref(null)
const canvas3d = ref(null)
let tree = null
let astViz = null
let particle3d = null
let spectrumFrame = null

onMounted(() => {
  tree = new CanvasTree(canvas2d.value)
  astViz = new AstVisualizer(canvas2d.value)
  runVisualization()
})

function stopAll() {
  tree?.stop()
  astViz?.stop()
  particle3d?.destroy()
  particle3d = null
  stopSpectrum()
}

function runVisualization() {
  stopAll()
  if (props.mode === '3d') {
    if (props.astSummary && props.astSummary.nodeCount > 0) {
      particle3d = new ParticleTree3D(canvas3d.value)
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
.canvas-wrapper { width: 100%; height: 100%; position: relative; }
.code-tree { width: 100%; height: 100%; }
</style>
