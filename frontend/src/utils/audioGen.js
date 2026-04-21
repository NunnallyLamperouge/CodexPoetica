const SCALES = {
  D_minor: [62, 64, 65, 67, 69, 70, 72],
  C_major: [60, 62, 64, 65, 67, 69, 71],
  A_minor: [57, 59, 60, 62, 64, 65, 67],
  G_major: [55, 57, 59, 60, 62, 64, 66],
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function pickScale(maxDepth) {
  if (maxDepth <= 2) return 'C_major'
  if (maxDepth <= 4) return 'G_major'
  if (maxDepth <= 6) return 'A_minor'
  return 'D_minor'
}

export class AudioGenerator {
  constructor() {
    this.ctx = null
    this.nodes = []
    this.playing = false
    this.timeoutIds = []
    this.supported = !!(window.AudioContext || window.webkitAudioContext)
    this.error = null
  }

  _ensureCtx() {
    if (!this.supported) throw new Error('浏览器不支持 Web Audio API')
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        this.supported = false
        throw new Error('音频初始化失败：' + e.message)
      }
    }
  }

  buildConfig(astSummary) {
    const { nodeCount = 10, maxDepth = 3 } = astSummary || {}
    const bpm = Math.min(120, Math.max(60, 60 + nodeCount))
    const scale = pickScale(maxDepth)
    const durationSec = Math.min(30, Math.max(8, nodeCount / 2))
    return { enabled: true, bpm, scale, instrument: 'pad', durationSec }
  }

  play(audioConfig, astSummary) {
    this.stop()
    this.error = null
    try {
      this._ensureCtx()
    } catch (e) {
      this.error = e.message
      return
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()

    const { bpm, scale, durationSec } = audioConfig || this.buildConfig(astSummary)
    const notes = SCALES[scale] || SCALES['D_minor']
    const beatDuration = 60 / bpm
    const totalBeats = Math.floor(durationSec / beatDuration)

    this.playing = true
    for (let i = 0; i < totalBeats; i++) {
      const id = setTimeout(() => {
        if (!this.playing) return
        const midi = notes[Math.floor(Math.random() * notes.length)]
        this._playNote(midiToFreq(midi), beatDuration * 0.8)
      }, i * beatDuration * 1000)
      this.timeoutIds.push(id)
    }
  }

  _playNote(freq, duration) {
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch {}
  }

  stop() {
    this.playing = false
    this.timeoutIds.forEach(clearTimeout)
    this.timeoutIds = []
  }

  toggle(audioConfig, astSummary) {
    if (this.playing) this.stop()
    else this.play(audioConfig, astSummary)
    return this.playing
  }
}

export const audioGen = new AudioGenerator()
