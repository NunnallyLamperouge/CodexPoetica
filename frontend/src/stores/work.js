import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'
import { parseCode } from '../utils/parser.js'
import { generatePoem, generateFromDna } from '../utils/poemGen.js'
import { audioGen } from '../utils/audioGen.js'
import { extractDna } from '../utils/codeDna.js'

export const useWorkStore = defineStore('work', () => {
  const language = ref('javascript')
  const sourceCode = ref('')
  const astSummary = ref(null)
  const codeDna = ref(null)
  const poemResult = ref(null)
  const audioConfig = ref(null)
  const visualConfig = ref({ theme: 'forest_ink', seed: Date.now(), nodeCount: 0 })
  const mappingProfileId = ref('default')
  const mappingProfiles = ref([])
  const currentWorkId = ref(null)
  const parseError = ref(null)
  const isPlaying = ref(false)
  const audioSupported = ref(audioGen.supported)
  const audioError = ref(null)

  const MONACO_THEME_MAP = {
    forest_ink: 'vs-dark', ink_wash: 'hc-black', neon_circuit: 'vs-dark',
    sakura_dream: 'vs-dark', deep_ocean: 'hc-black', golden_autumn: 'vs-dark', void_purple: 'hc-black',
  }
  const monacoTheme = ref('vs-dark')

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
      codeDna.value = null
      poemResult.value = null
      parseError.value = null
      return
    }
    const summary = await parseCode(language.value, code)
    parseError.value = summary.error || null
    astSummary.value = summary

    // extract DNA
    const dna = extractDna(summary)
    codeDna.value = dna

    const profile = mappingProfiles.value.find(p => p.id === mappingProfileId.value)
    const style = profile?.poemStyle || 'free_verse'

    // use DNA-driven poem if available, fallback to summary-based
    poemResult.value = dna ? (generateFromDna(dna, style) || generatePoem(summary, style)) : generatePoem(summary, style)

    // use DNA-driven audio if available
    const cfg = audioGen.buildConfig(summary)
    audioConfig.value = cfg
    visualConfig.value = { theme: profile?.visualTheme || 'forest_ink', seed: Date.now(), nodeCount: summary.nodeCount }
    monacoTheme.value = MONACO_THEME_MAP[profile?.visualTheme] || 'vs-dark'

    if (isPlaying.value) {
      audioGen.stop()
      if (dna) audioGen.playFromDna(dna)
      else audioGen.play(cfg, summary)
    }
  }

  function toggleAudio() {
    audioError.value = null
    if (audioGen.playing) {
      audioGen.stop()
      isPlaying.value = false
      return
    }
    if (codeDna.value) {
      audioGen.error = null
      try { audioGen.ensureReady() } catch (e) { audioError.value = e.message; return }
      audioGen.playFromDna(codeDna.value)
      isPlaying.value = true
    } else {
      isPlaying.value = audioGen.toggle(audioConfig.value, astSummary.value)
    }
    if (audioGen.error) {
      audioError.value = audioGen.error
      audioSupported.value = audioGen.supported
      isPlaying.value = false
    }
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
    language, sourceCode, astSummary, codeDna, poemResult, audioConfig, visualConfig,
    mappingProfileId, mappingProfiles, currentWorkId, parseError, isPlaying,
    audioSupported, audioError, monacoTheme,
    getFrequencyData: () => audioGen.getFrequencyData(),
    loadMappingProfiles, processCode, toggleAudio, stopAudio, saveDraft, publishShare,
  }
})
