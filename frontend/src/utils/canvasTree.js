const THEMES = {
  forest_ink:    { bg: '#0d1117', branch: '#4ade80', leaf: '#86efac', line: '#22c55e', text: '#d1fae5' },
  ink_wash:      { bg: '#1a1a2e', branch: '#a78bfa', leaf: '#c4b5fd', line: '#7c3aed', text: '#ede9fe' },
  neon_circuit:  { bg: '#0f0f23', branch: '#f472b6', leaf: '#fb7185', line: '#ec4899', text: '#fce7f3' },
  sakura_dream:  { bg: '#1a0a0f', branch: '#f9a8d4', leaf: '#fce7f3', line: '#fb7185', text: '#fff1f2' },
  deep_ocean:    { bg: '#020c1b', branch: '#22d3ee', leaf: '#67e8f9', line: '#0891b2', text: '#e0f7fa' },
  golden_autumn: { bg: '#1a0f00', branch: '#fbbf24', leaf: '#fde68a', line: '#d97706', text: '#fef3c7' },
  void_purple:   { bg: '#000000', branch: '#c084fc', leaf: '#ffffff', line: '#7c3aed', text: '#f3e8ff' },
}

export class CanvasTree {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.animFrame = null
    this.progress = 0
    this.nodes = []
    this.theme = 'forest_ink'
  }

  build(astSummary, theme = 'forest_ink') {
    this.theme = theme
    const { nodeCount = 10, maxDepth = 3, functionCount = 1, variableCount = 2 } = astSummary || {}
    this.nodes = []
    const cx = this.canvas.width / 2
    const cy = this.canvas.height - 40
    this._buildNodes(cx, cy, -Math.PI / 2, 80, 0, Math.min(maxDepth, 6), functionCount, variableCount, nodeCount)
  }

  _buildNodes(x, y, angle, length, depth, maxDepth, fnCount, varCount, totalNodes) {
    if (depth > maxDepth || length < 8) return
    const ex = x + Math.cos(angle) * length
    const ey = y + Math.sin(angle) * length
    const isFn = depth < fnCount + 1
    const isVar = depth >= maxDepth - 1
    this.nodes.push({ x1: x, y1: y, x2: ex, y2: ey, depth, isFn, isVar })
    const spread = Math.PI / 4 + (depth * 0.05)
    const branches = isFn ? 3 : 2
    for (let i = 0; i < branches; i++) {
      const a = angle - spread + (spread * 2 / (branches - 1)) * i
      this._buildNodes(ex, ey, a, length * 0.7, depth + 1, maxDepth, fnCount, varCount, totalNodes)
    }
  }

  animate(astSummary, theme) {
    this.stop()
    this.build(astSummary, theme)
    this.progress = 0
    const total = this.nodes.length
    const step = () => {
      this.progress = Math.min(this.progress + 0.02, 1)
      this._draw(Math.floor(this.progress * total))
      if (this.progress < 1) this.animFrame = requestAnimationFrame(step)
    }
    this.animFrame = requestAnimationFrame(step)
  }

  _draw(visibleCount) {
    const colors = THEMES[this.theme] || THEMES.forest_ink
    const { width, height } = this.canvas
    this.ctx.fillStyle = colors.bg
    this.ctx.fillRect(0, 0, width, height)
    for (let i = 0; i < visibleCount; i++) {
      const n = this.nodes[i]
      this.ctx.beginPath()
      this.ctx.moveTo(n.x1, n.y1)
      this.ctx.lineTo(n.x2, n.y2)
      this.ctx.strokeStyle = n.isFn ? colors.branch : n.isVar ? colors.leaf : colors.line
      this.ctx.lineWidth = Math.max(1, 4 - n.depth * 0.5)
      this.ctx.stroke()
      if (n.isVar) {
        this.ctx.beginPath()
        this.ctx.arc(n.x2, n.y2, 3, 0, Math.PI * 2)
        this.ctx.fillStyle = colors.leaf
        this.ctx.fill()
      }
    }
  }

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame)
    this.animFrame = null
  }

  clear() {
    this.stop()
    const colors = THEMES[this.theme] || THEMES.forest_ink
    this.ctx.fillStyle = colors.bg
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
