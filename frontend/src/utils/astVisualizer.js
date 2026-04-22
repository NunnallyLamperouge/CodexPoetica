const NODE_COLORS = {
  function:  '#4ade80',
  variable:  '#60a5fa',
  branch:    '#f59e0b',
  loop:      '#a78bfa',
  class:     '#f472b6',
  root:      '#e6edf3',
  other:     '#6b7280',
}

const NODE_SHAPES = {
  function: 'circle',
  variable: 'diamond',
  branch:   'triangle',
  loop:     'hexagon',
  class:    'star',
  root:     'circle',
  other:    'circle',
}

function getNodeKind(ast) {
  const { functionCount = 0, variableCount = 0, branchCount = 0, loopCount = 0, classCount = 0 } = ast
  const kinds = []
  if (functionCount > 0) for (let i = 0; i < Math.min(functionCount, 4); i++) kinds.push('function')
  if (variableCount > 0) for (let i = 0; i < Math.min(variableCount, 4); i++) kinds.push('variable')
  if (branchCount > 0) for (let i = 0; i < Math.min(branchCount, 3); i++) kinds.push('branch')
  if (loopCount > 0) for (let i = 0; i < Math.min(loopCount, 3); i++) kinds.push('loop')
  if (classCount > 0) for (let i = 0; i < Math.min(classCount, 2); i++) kinds.push('class')
  return kinds
}

const KIND_LABELS = {
  function: 'Function', variable: 'Variable', branch: 'Branch',
  loop: 'Loop', class: 'Class', root: 'Program', other: 'Node',
}

export function buildAstNodes(astSummary, width, height) {
  const kinds = getNodeKind(astSummary || {})
  const nodes = []
  const r = 18

  // root node
  nodes.push({ id: 0, kind: 'root', label: 'Program', x: width / 2, y: 40, r, scale: 0 })

  if (kinds.length === 0) return nodes

  // layer 1: group by kind
  const groups = {}
  kinds.forEach(k => { groups[k] = (groups[k] || 0) + 1 })
  const groupKeys = Object.keys(groups)
  const layerY = 120
  const step = Math.min(width / (groupKeys.length + 1), 100)
  const startX = width / 2 - (groupKeys.length - 1) * step / 2

  groupKeys.forEach((kind, gi) => {
    const gx = startX + gi * step
    const gNode = { id: nodes.length, kind, label: KIND_LABELS[kind], x: gx, y: layerY, r, scale: 0, parent: 0 }
    nodes.push(gNode)

    // layer 2: individual nodes
    const count = groups[kind]
    const subStep = Math.min(60, (width * 0.8) / (kinds.length + 1))
    for (let i = 0; i < count - 1; i++) {
      const sx = gx + (i - (count - 2) / 2) * subStep
      const sy = layerY + 80
      nodes.push({ id: nodes.length, kind, label: KIND_LABELS[kind] + ' ' + (i + 2), x: sx, y: sy, r: 12, scale: 0, parent: gNode.id })
    }
  })

  return nodes
}

export class AstVisualizer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.nodes = []
    this.visibleCount = 0
    this.animFrame = null
    this.timers = []
    this.hoveredNode = null
    this._onMouseMove = this._onMouseMove.bind(this)
    canvas.addEventListener('mousemove', this._onMouseMove)
  }

  animate(astSummary, theme) {
    this.stop()
    this.nodes = buildAstNodes(astSummary, this.canvas.width, this.canvas.height)
    this.visibleCount = 0
    this.theme = theme || 'forest_ink'

    this.nodes.forEach((_, i) => {
      const t = setTimeout(() => {
        this.visibleCount = i + 1
        this.nodes[i].scale = 0
        this._growNode(i)
      }, i * 80)
      this.timers.push(t)
    })
    this._loop()
  }

  _growNode(i) {
    const node = this.nodes[i]
    if (!node) return
    if (node.scale < 1) {
      node.scale = Math.min(1, node.scale + 0.12)
      requestAnimationFrame(() => this._growNode(i))
    }
  }

  _loop() {
    this._draw()
    this.animFrame = requestAnimationFrame(() => this._loop())
  }

  _draw() {
    const { width, height } = this.canvas
    const bg = this._bg()
    this.ctx.fillStyle = bg
    this.ctx.fillRect(0, 0, width, height)

    const visible = this.nodes.slice(0, this.visibleCount)

    // draw edges
    visible.forEach(node => {
      if (node.parent === undefined) return
      const parent = this.nodes[node.parent]
      if (!parent || parent.scale < 0.5) return
      this.ctx.beginPath()
      this.ctx.moveTo(parent.x, parent.y)
      this.ctx.lineTo(node.x, node.y)
      this.ctx.strokeStyle = NODE_COLORS[node.kind] + '55'
      this.ctx.lineWidth = 1.5
      this.ctx.stroke()
    })

    // draw nodes
    visible.forEach(node => {
      if (node.scale <= 0) return
      this.ctx.save()
      this.ctx.translate(node.x, node.y)
      this.ctx.scale(node.scale, node.scale)
      this._drawShape(node)
      this.ctx.restore()

      // label
      if (node.scale > 0.8) {
        this.ctx.fillStyle = '#e6edf3'
        this.ctx.font = `${node.r < 15 ? 9 : 10}px sans-serif`
        this.ctx.textAlign = 'center'
        this.ctx.fillText(node.label, node.x, node.y + node.r + 12)
      }
    })

    // tooltip
    if (this.hoveredNode) {
      const n = this.hoveredNode
      this.ctx.fillStyle = 'rgba(0,0,0,0.75)'
      this.ctx.fillRect(n.x + 20, n.y - 16, 90, 22)
      this.ctx.fillStyle = '#fff'
      this.ctx.font = '11px sans-serif'
      this.ctx.textAlign = 'left'
      this.ctx.fillText(n.label, n.x + 26, n.y - 1)
    }
  }

  _drawShape(node) {
    const r = node.r
    const color = NODE_COLORS[node.kind]
    const shape = NODE_SHAPES[node.kind]
    this.ctx.fillStyle = color
    this.ctx.strokeStyle = color + 'aa'
    this.ctx.lineWidth = 2

    if (shape === 'circle') {
      this.ctx.beginPath()
      this.ctx.arc(0, 0, r, 0, Math.PI * 2)
      this.ctx.fill()
    } else if (shape === 'diamond') {
      this.ctx.beginPath()
      this.ctx.moveTo(0, -r); this.ctx.lineTo(r, 0)
      this.ctx.lineTo(0, r); this.ctx.lineTo(-r, 0)
      this.ctx.closePath(); this.ctx.fill()
    } else if (shape === 'triangle') {
      this.ctx.beginPath()
      this.ctx.moveTo(0, -r)
      this.ctx.lineTo(r * 0.866, r * 0.5)
      this.ctx.lineTo(-r * 0.866, r * 0.5)
      this.ctx.closePath(); this.ctx.fill()
    } else if (shape === 'hexagon') {
      this.ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        i === 0 ? this.ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                : this.ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      this.ctx.closePath(); this.ctx.fill()
    } else if (shape === 'star') {
      this.ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2
        const rad = i % 2 === 0 ? r : r * 0.45
        i === 0 ? this.ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad)
                : this.ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
      }
      this.ctx.closePath(); this.ctx.fill()
    }
  }

  _bg() {
    const BG = {
      forest_ink: '#0d1117', ink_wash: '#1a1a2e', neon_circuit: '#0f0f23',
      sakura_dream: '#1a0a0f', deep_ocean: '#020c1b', golden_autumn: '#1a0f00', void_purple: '#000000',
    }
    return BG[this.theme] || '#0d1117'
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    this.hoveredNode = null
    for (const node of this.nodes.slice(0, this.visibleCount)) {
      const dx = mx - node.x, dy = my - node.y
      if (Math.sqrt(dx * dx + dy * dy) < node.r + 4) {
        this.hoveredNode = node
        break
      }
    }
  }

  stop() {
    this.timers.forEach(clearTimeout)
    this.timers = []
    if (this.animFrame) cancelAnimationFrame(this.animFrame)
    this.animFrame = null
  }

  destroy() {
    this.stop()
    this.canvas.removeEventListener('mousemove', this._onMouseMove)
  }
}
