<template>
  <canvas ref="canvasEl" :width="width" :height="height" class="code-tree"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { CanvasTree } from '../utils/canvasTree.js'

const props = defineProps({
  astSummary: { type: Object, default: null },
  theme: { type: String, default: 'forest_ink' },
  width: { type: Number, default: 400 },
  height: { type: Number, default: 300 },
})

const canvasEl = ref(null)
let tree = null

onMounted(() => {
  tree = new CanvasTree(canvasEl.value)
  if (props.astSummary) tree.animate(props.astSummary, props.theme)
  else tree.clear()
})

watch(() => [props.astSummary, props.theme], ([summary, theme]) => {
  if (!tree) return
  if (summary && summary.nodeCount > 0) tree.animate(summary, theme)
  else tree.clear()
})

onBeforeUnmount(() => tree?.stop())
</script>

<style scoped>
.code-tree { display: block; width: 100%; height: 100%; }
</style>
