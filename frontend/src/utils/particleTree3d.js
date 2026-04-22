import * as THREE from 'three'

const NODE_COLORS = {
  function:  0x4ade80,
  variable:  0x60a5fa,
  branch:    0xf59e0b,
  loop:      0xa78bfa,
  class:     0xf472b6,
  root:      0xe6edf3,
  other:     0x6b7280,
}

const BG_COLORS = {
  forest_ink:    0x0d1117,
  ink_wash:      0x1a1a2e,
  neon_circuit:  0x0f0f23,
  sakura_dream:  0x1a0a0f,
  deep_ocean:    0x020c1b,
  golden_autumn: 0x1a0f00,
  void_purple:   0x000000,
}

function buildNodeList(astSummary) {
  const { functionCount = 0, variableCount = 0, branchCount = 0, loopCount = 0, classCount = 0 } = astSummary || {}
  const nodes = [{ id: 0, kind: 'root', parent: null }]
  let id = 1
  const add = (kind, count, max) => {
    for (let i = 0; i < Math.min(count, max); i++) nodes.push({ id: id++, kind, parent: 0 })
  }
  add('function', functionCount, 5)
  add('variable', variableCount, 5)
  add('branch', branchCount, 4)
  add('loop', loopCount, 4)
  add('class', classCount, 3)
  if (nodes.length === 1) nodes.push({ id: id++, kind: 'other', parent: 0 })
  return nodes
}

function spherePos(radius, index, total) {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total)
  const theta = Math.PI * (1 + Math.sqrt(5)) * index
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  )
}

export class ParticleTree3D {
  constructor(canvas) {
    this.canvas = canvas
    this.renderer = null
    this.scene = null
    this.camera = null
    this.meshes = []
    this.floatParticles = []
    this.animFrame = null
    this.visibleCount = 0
    this.timers = []
    this.nodeList = []
    this.rotY = 0
  }

  init(theme) {
    const bg = BG_COLORS[theme] || BG_COLORS.forest_ink
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false })
    this.renderer.setSize(this.canvas.width, this.canvas.height)
    this.renderer.setClearColor(bg)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(60, this.canvas.width / this.canvas.height, 0.1, 100)
    this.camera.position.set(0, 0, 6)

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambient)
    const point = new THREE.PointLight(0xffffff, 1.2, 20)
    point.position.set(3, 3, 3)
    this.scene.add(point)
  }

  animate(astSummary, theme) {
    this.destroy()
    this.init(theme)
    this.nodeList = buildNodeList(astSummary)
    this.meshes = []
    this.visibleCount = 0

    // build all meshes (hidden initially)
    this.nodeList.forEach((node, i) => {
      const color = NODE_COLORS[node.kind] || NODE_COLORS.other
      const size = node.kind === 'root' ? 0.22 : node.kind === 'function' ? 0.16 : 0.11
      const geo = new THREE.SphereGeometry(size, 16, 16)
      const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3, shininess: 80 })
      const mesh = new THREE.Mesh(geo, mat)

      const childNodes = this.nodeList.filter(n => n.parent === node.id)
      const siblings = this.nodeList.filter(n => n.parent === node.parent && n.id !== node.id)
      const idx = siblings.findIndex(n => n.id === node.id)
      const total = siblings.length + 1

      if (node.parent === null) {
        mesh.position.set(0, 0, 0)
      } else {
        const pos = spherePos(1.8, i, this.nodeList.length)
        mesh.position.copy(pos)
      }

      mesh.scale.setScalar(0)
      mesh.userData = { targetScale: 1, node }
      this.scene.add(mesh)
      this.meshes.push(mesh)

      // float particles around node
      this._addFloatParticles(mesh.position, color, 10)
    })

    // draw edges
    this._buildEdges()

    // reveal nodes one by one
    this.nodeList.forEach((_, i) => {
      const t = setTimeout(() => { this.visibleCount = i + 1 }, i * 100)
      this.timers.push(t)
    })

    this._loop()
  }

  _addFloatParticles(center, color, count) {
    const positions = new Float32Array(count * 3)
    const velocities = []
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = center.x + (Math.random() - 0.5) * 0.6
      positions[i * 3 + 1] = center.y + (Math.random() - 0.5) * 0.6
      positions[i * 3 + 2] = center.z + (Math.random() - 0.5) * 0.6
      velocities.push({ x: (Math.random() - 0.5) * 0.002, y: (Math.random() - 0.5) * 0.002, z: (Math.random() - 0.5) * 0.002 })
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({ color, size: 0.025, transparent: true, opacity: 0.7 })
    const points = new THREE.Points(geo, mat)
    this.scene.add(points)
    this.floatParticles.push({ points, velocities, center: center.clone(), count })
  }

  _buildEdges() {
    this.nodeList.forEach((node, i) => {
      if (node.parent === null) return
      const parentMesh = this.meshes[node.parent]
      const childMesh = this.meshes[i]
      if (!parentMesh || !childMesh) return
      const color = NODE_COLORS[node.kind] || NODE_COLORS.other
      const geo = new THREE.BufferGeometry().setFromPoints([parentMesh.position, childMesh.position])
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 })
      this.scene.add(new THREE.Line(geo, mat))
    })
  }

  _loop() {
    this.rotY += 0.003
    if (this.scene) this.scene.rotation.y = this.rotY

    // scale in visible nodes
    this.meshes.forEach((mesh, i) => {
      if (i < this.visibleCount) {
        const s = mesh.scale.x
        if (s < 1) mesh.scale.setScalar(Math.min(1, s + 0.08))
      }
    })

    // animate float particles
    this.floatParticles.forEach(({ points, velocities, center, count }) => {
      const pos = points.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3]     += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y
        pos[i * 3 + 2] += velocities[i].z
        const dx = pos[i * 3] - center.x
        const dy = pos[i * 3 + 1] - center.y
        const dz = pos[i * 3 + 2] - center.z
        if (Math.abs(dx) > 0.4) velocities[i].x *= -1
        if (Math.abs(dy) > 0.4) velocities[i].y *= -1
        if (Math.abs(dz) > 0.4) velocities[i].z *= -1
      }
      points.geometry.attributes.position.needsUpdate = true
    })

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
    this.animFrame = requestAnimationFrame(() => this._loop())
  }

  pulse(frequencyData) {
    if (!frequencyData || !this.meshes.length) return
    const avg = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length
    const scale = 1 + (avg / 255) * 0.25
    this.meshes.forEach((mesh, i) => {
      if (i < this.visibleCount) {
        const base = mesh.userData.targetScale || 1
        mesh.scale.setScalar(base * scale)
      }
    })
  }

  destroy() {
    this.timers.forEach(clearTimeout)
    this.timers = []
    if (this.animFrame) cancelAnimationFrame(this.animFrame)
    this.animFrame = null
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }
    this.scene = null
    this.camera = null
    this.meshes = []
    this.floatParticles = []
  }
}
