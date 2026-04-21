import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'
import { parseCode } from '../utils/parser.js'
import { generatePoem } from '../utils/poemGen.js'
import { audioGen } from '../utils/audioGen.js'

export const useWorkStore = defineStore('work', () => {
  const language = ref('javascript')
  const sourceCode = ref('')
  const astSummary = ref(null)
  const poemResult = ref(null)
  const audioConfig = ref(null)
  const visualConfig = ref({ theme: 'forest_ink', seed: Date.now(), nodeCount: 0 })
  const mappingProfileId = ref('default')
  const mappingProfiles = ref([])
  const currentWorkId = ref(null)
  const parseError = ref(null)
  const isPlaying = ref(false)

  async function loadMappingProfiles() {
    try {
      const res = await api.getMappingProfiles()
      mappingProfiles.value = res.data.data || []
    } catch {}
  }

  async function processCode(code) {
    sourceCode.value = code
    if (!code.trim()) {
      astSummary.value = null
      poemResult.value = null
      parseError.value = null
      return
    }
    const summary = await parseCode(language.value, code)
    parseError.value = summary.error || null
    astSummary.value = summary

    const profile = mappingProfiles.value.find(p => p.id === mappingProfileId.value)
    const style = profile?.poemStyle || 'free_verse'
    poemResult.value = generatePoem(summary, style)

    const cfg = audioGen.buildConfig(summary)
    audioConfig.value = cfg
    visualConfig.value = { theme: profile?.visualTheme || 'forest_ink', seed: Date.now(), nodeCount: summary.nodeCount }

    if (isPlaying.value) {
      audioGen.stop()
      audioGen.play(cfg, summary)
    }
  }

  function toggleAudio() {
    isPlaying.value = audioGen.toggle(audioConfig.value, astSummary.value)
  }

  function stopAudio() {
    audioGen.stop()
    isPlaying.value = false
  }

  async function saveDraft(title) {
    const payload = {
      title: title || poemResult.value?.title || '未命名作品',
      language: language.value,
      sourceCode: sourceCode.value,
      mappingProfileId: mappingProfileId.value,
      astSummary: astSummary.value,
      poemResult: poemResult.value,
      audioConfig: audioConfig.value,
      visualConfig: visualConfig.value,
    }
    if (currentWorkId.value) {
      const res = await api.updateWork(currentWorkId.value, payload)
      return res.data
    } else {
      const res = await api.createWork(payload)
      currentWorkId.value = res.data.data?.id
      return res.data
    }
  }

  async function publishShare(options = {}) {
    if (!currentWorkId.value) await saveDraft()
    const res = await api.shareWork(currentWorkId.value, options)
    return res.data.data
  }

  return {
    language, sourceCode, astSummary, poemResult, audioConfig, visualConfig,
    mappingProfileId, mappingProfiles, currentWorkId, parseError, isPlaying,
    loadMappingProfiles, processCode, toggleAudio, stopAudio, saveDraft, publishShare,
  }
})
