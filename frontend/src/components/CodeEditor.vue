<template>
  <div ref="editorEl" class="editor-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  monacoTheme: { type: String, default: 'vs-dark' },
})
const emit = defineEmits(['update:modelValue'])

const editorEl = ref(null)
let editor = null

onMounted(() => {
  editor = monaco.editor.create(editorEl.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.monacoTheme,
    fontSize: 14,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
  })
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
})

watch(() => props.language, (lang) => {
  if (editor) monaco.editor.setModelLanguage(editor.getModel(), lang)
})

watch(() => props.monacoTheme, (theme) => {
  if (editor) monaco.editor.setTheme(theme)
})

watch(() => props.modelValue, (val) => {
  if (editor && editor.getValue() !== val) editor.setValue(val)
})

onBeforeUnmount(() => editor?.dispose())
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
