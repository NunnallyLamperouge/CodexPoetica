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

const LEAF_COLORS = [0x4ade80, 0x60a5fa, 0xf59e0b, 0xa78bfa, 0xf472b6]

const BG = 0x0d1117

const TRUNK_COLOR = 0x8B5A2B
const TRUNK_EMISSIVE = 0x3d2817

const SHAPE_CONFIG = {
  spiral:   { maxDepth: 5, trunkLen: 1.8, lenFactor: 0.68, radFactor: 0.55, forks: 2, baseAngle: 0.35, jitter: 0.25, spiralTwist: 0.6 },
  tower:    { maxDepth: 6, trunkLen: 1.6, lenFactor: 0.62, radFactor: 0.52, forks: 3, baseAngle: 0.55, jitter: 0.15, spiralTwist: 0 },
  flat:     { maxDepth: 3, trunkLen: 0.7, lenFactor: 0.75, radFactor: 0.58, forks: 3, baseAngle: 0.85, jitter: 0.3, spiralTwist: 0 },
  bush:     { maxDepth: 4, trunkLen: 0.9, lenFactor: 0.65, radFactor: 0.5, forks: 3, baseAngle: 0.7, jitter: 0.4, spiralTwist: 0 },
  balanced: { maxDepth: 4, trunkLen: 1.4, lenFactor: 0.7, radFactor: 0.55, forks: 2, baseAngle: 0.45, jitter: 0.2, spiralTwist: 0 },
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildLeafColors(astSummary) {
  const { functionCount = 0, variableCount = 0, branchCount = 0, loopCount = 0, classCount = 0 } = astSummary || {}
  const pool = []
  const add = (color, count) => { for (let i = 0; i < Math.max(count, 1); i++) pool.push(color) }
  add(NODE_COLORS.function, functionCount)
  add(NODE_COLORS.variable, variableCount)
  add(NODE_COLORS.branch, branchCount)
  add(NODE_COLORS.loop, loopCount)
  add(NODE_COLORS.class, classCount)
  if (pool.length === 0) pool.push(NODE_COLORS.other)
  return pool
}

export class ParticleTree3D {
  constructor(canvas) {
    this.canvas = canvas
    this.renderer = null
    this.scene = null
    this.camera = null
    this.animFrame = null
    this.timers = []
    this.rotY = 0
    this.time = 0
    this.branchGroups = []
    this.leafSystems = []
    this.treeGroup = null
    this.growProgress = 0
    this.growTarget = 0
  }

  init(theme) {
    const bg = BG
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false })
    this.renderer.setSize(this.canvas.width, this.canvas.height)
    this.renderer.setClearColor(bg)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(50, this.canvas.width / this.canvas.height, 0.1, 100)
    this.camera.position.set(0, 1.5, 7)
    this.camera.lookAt(0, 1.5, 0)

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const point = new THREE.PointLight(0xffffff, 1.0, 30)
    point.position.set(4, 6, 4)
    this.scene.add(point)
    const fill = new THREE.PointLight(0x8888ff, 0.3, 20)
    fill.position.set(-3, 2, -2)
    this.scene.add(fill)
  }

  animate(astSummary, theme, dna) {
    this.destroy()
    this.init(theme)

    const shape = dna?.shape || 'balanced'
    const cfg = SHAPE_CONFIG[shape] || SHAPE_CONFIG.balanced
    const nodeCount = astSummary?.nodeCount || 5
    const seed = (nodeCount * 7 + (astSummary?.maxDepth || 3) * 13 + cfg.maxDepth * 31) | 0
    const rand = seededRandom(seed)
    const leafColors = buildLeafColors(astSummary)

    this.treeGroup = new THREE.Group()
    this.scene.add(this.treeGroup)
    this.branchGroups = []
    this.leafSystems = []

    this._generateBranch(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0),
      cfg.trunkLen,
      0.12,
      0, cfg, rand, leafColors, nodeCount
    )

    this.growProgress = 0
    this.growTarget = this.branchGroups.length
    this.branchGroups.forEach((bg, i) => {
      bg.group.scale.setScalar(0)
      const t = setTimeout(() => { this.growProgress = i + 1 }, i * 80)
      this.timers.push(t)
    })

    this._loop()
  }

  _generateBranch(origin, direction, length, radius, depth, cfg, rand, leafColors, nodeCount) {
    if (depth > cfg.maxDepth || radius < 0.008) return

    const segments = 5
    const geo = new THREE.CylinderGeometry(radius * cfg.radFactor, radius, length, 6, segments)
    geo.translate(0, length / 2, 0)

    const darkness = Math.min(depth * 0.08, 0.3)
    const mat = new THREE.MeshPhongMaterial({
      color: TRUNK_COLOR,
      emissive: TRUNK_EMISSIVE,
      emissiveIntensity: 0.15 - darkness * 0.1,
      shininess: 10,
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(origin)

    const up = new THREE.Vector3(0, 1, 0)
    const quat = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize())
    mesh.quaternion.copy(quat)

    const group = new THREE.Group()
    group.add(mesh)
    this.treeGroup.add(group)
    this.branchGroups.push({ group, depth })

    const tipLocal = new THREE.Vector3(0, length, 0)
    tipLocal.applyQuaternion(quat)
    const tip = origin.clone().add(tipLocal)

    const isLeafLevel = depth >= cfg.maxDepth - 1
    if (isLeafLevel) {
      this._addLeaves(tip, leafColors, Math.max(6, Math.min(nodeCount * 2, 40)), rand, group)
    }

    const forks = cfg.forks + (rand() > 0.6 ? 1 : 0)
    for (let i = 0; i < forks; i++) {
      const angleY = (i / forks) * Math.PI * 2 + rand() * cfg.jitter * 2
      const angleOut = cfg.baseAngle + (rand() - 0.5) * cfg.jitter
      const twist = cfg.spiralTwist * depth

      const newDir = new THREE.Vector3(
        Math.sin(angleOut) * Math.cos(angleY + twist),
        Math.cos(angleOut),
        Math.sin(angleOut) * Math.sin(angleY + twist)
      ).normalize()

      const blended = new THREE.Vector3()
        .addScaledVector(direction.clone().normalize(), 0.4)
        .addScaledVector(newDir, 0.6)
        .normalize()

      this._generateBranch(
        tip, blended,
        length * cfg.lenFactor * (0.85 + rand() * 0.3),
        radius * cfg.radFactor,
        depth + 1, cfg, rand, leafColors, nodeCount
      )
    }
  }

  _addLeaves(center, colorPool, count, rand, parentGroup) {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const basePositions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2
      const phi = rand() * Math.PI
      const r = 0.15 + rand() * 0.35
      const x = center.x + r * Math.sin(phi) * Math.cos(theta)
      const y = center.y + r * Math.sin(phi) * Math.sin(theta) * 0.6 + rand() * 0.1
      const z = center.z + r * Math.cos(phi)
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      basePositions[i * 3] = x
      basePositions[i * 3 + 1] = y
      basePositions[i * 3 + 2] = z

      const c = new THREE.Color(colorPool[Math.floor(rand() * colorPool.length)])
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    })
    const points = new THREE.Points(geo, mat)
    parentGroup.add(points)
    this.leafSystems.push({ points, basePositions, count, center: center.clone() })
  }
  _loop() {
    this.time += 0.016
    this.rotY += 0.002
    if (this.treeGroup) this.treeGroup.rotation.y = this.rotY

    this.branchGroups.forEach((bg, i) => {
      if (i < this.growProgress) {
        const s = bg.group.scale.x
        if (s < 1) bg.group.scale.setScalar(Math.min(1, s + 0.06))
      }
    })

    this.leafSystems.forEach(({ points, basePositions, count }) => {
      const pos = points.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        const phase = this.time * 1.5 + basePositions[i * 3] * 3 + basePositions[i * 3 + 2] * 2
        pos[i * 3] = basePositions[i * 3] + Math.sin(phase) * 0.015
        pos[i * 3 + 1] = basePositions[i * 3 + 1] + Math.sin(phase * 0.7 + 1) * 0.01
        pos[i * 3 + 2] = basePositions[i * 3 + 2] + Math.cos(phase * 0.8) * 0.012
      }
      points.geometry.attributes.position.needsUpdate = true
    })

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
    this.animFrame = requestAnimationFrame(() => this._loop())
  }

  pulse(frequencyData) {
    if (!frequencyData || !this.treeGroup) return
    const avg = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length
    const intensity = avg / 255
    const sway = Math.sin(this.time * 3) * intensity * 0.08
    this.treeGroup.rotation.z = sway
    this.leafSystems.forEach(({ points }) => {
      points.material.size = 0.08 + intensity * 0.06
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
    if (this.scene) {
      this.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
    }
    this.scene = null
    this.camera = null
    this.branchGroups = []
    this.leafSystems = []
    this.treeGroup = null
  }
}
