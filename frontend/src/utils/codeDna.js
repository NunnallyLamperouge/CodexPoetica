const NODE_TO_NOTE = {
  FunctionDeclaration:       67,
  FunctionExpression:        67,
  ArrowFunctionExpression:   69,
  IfStatement:               65,
  SwitchStatement:           63,
  ConditionalExpression:     64,
  ForStatement:              62,
  ForInStatement:            61,
  ForOfStatement:            61,
  WhileStatement:            60,
  DoWhileStatement:          59,
  ClassDeclaration:          72,
  ClassExpression:           72,
  VariableDeclarator:        57,
  CallExpression:            71,
  ReturnStatement:           55,
  BinaryExpression:          58,
  AssignmentExpression:      56,
  MemberExpression:          53,
  BlockStatement:            50,
  ExpressionStatement:       52,
}

const TYPE_ANGLE = {
  FunctionDeclaration: 0,
  FunctionExpression: 0.2,
  ArrowFunctionExpression: 0.4,
  IfStatement: Math.PI / 3,
  ForStatement: Math.PI * 2 / 3,
  WhileStatement: Math.PI,
  ClassDeclaration: Math.PI * 4 / 3,
  VariableDeclarator: Math.PI * 5 / 3,
}

export function extractDna(astSummary) {
  const {
    nodeCount = 0, maxDepth = 0,
    functionCount = 0, variableCount = 0,
    branchCount = 0, loopCount = 0, classCount = 0,
    sequence = [], depthCurve = [], widthByDepth = [],
  } = astSummary || {}

  if (nodeCount === 0) return null

  // determine shape
  const shape = detectShape({ nodeCount, maxDepth, functionCount, variableCount, branchCount, loopCount, classCount })

  // build note sequence from real sequence or fallback
  const noteSequence = buildNoteSequence(sequence, nodeCount, maxDepth, functionCount, branchCount, loopCount)

  // build rhythm pattern from depth curve
  const rhythmPattern = buildRhythmPattern(depthCurve, maxDepth)

  // weights
  const total = Math.max(1, functionCount + variableCount + branchCount + loopCount + classCount)
  const weights = {
    function: functionCount / total,
    variable: variableCount / total,
    branch:   branchCount / total,
    loop:     loopCount / total,
    class:    classCount / total,
  }

  return { sequence, depthCurve, widthByDepth, shape, weights, noteSequence, rhythmPattern, nodeCount, maxDepth }
}

function detectShape({ maxDepth, functionCount, branchCount, loopCount, nodeCount }) {
  if (functionCount > 0 && maxDepth > 4) return 'spiral'
  if (maxDepth > 6) return 'tower'
  if (maxDepth <= 2) return 'flat'
  if (branchCount > functionCount && branchCount > loopCount) return 'bush'
  return 'balanced'
}

function buildNoteSequence(sequence, nodeCount, maxDepth, functionCount, branchCount, loopCount) {
  if (sequence && sequence.length > 0) {
    return sequence.slice(0, 64).map(type => NODE_TO_NOTE[type] || 55)
  }
  // fallback: construct from summary
  const notes = []
  const base = 60
  for (let i = 0; i < Math.min(nodeCount, 32); i++) {
    const depthOffset = Math.floor((i / nodeCount) * maxDepth)
    if (i % Math.max(1, Math.floor(nodeCount / (functionCount + 1))) === 0) notes.push(67)
    else if (i % Math.max(1, Math.floor(nodeCount / (branchCount + 1))) === 0) notes.push(65)
    else if (i % Math.max(1, Math.floor(nodeCount / (loopCount + 1))) === 0) notes.push(62)
    else notes.push(base + depthOffset % 12)
  }
  return notes
}

function buildRhythmPattern(depthCurve, maxDepth) {
  if (!depthCurve || depthCurve.length === 0) return [4, 6, 4, 3, 5, 4]
  const sampled = sampleArray(depthCurve, 8)
  return sampled.map(d => {
    const norm = maxDepth > 0 ? d / maxDepth : 0.5
    return Math.max(2, Math.round(3 + norm * 5))
  })
}

function sampleArray(arr, n) {
  if (arr.length <= n) return arr
  const result = []
  for (let i = 0; i < n; i++) {
    result.push(arr[Math.floor(i * arr.length / n)])
  }
  return result
}

export function getShapeLabel(shape) {
  return { spiral: '螺旋递归', tower: '深渊塔形', flat: '扁平展开', bush: '放射丛林', balanced: '均衡球形' }[shape] || shape
}

export { TYPE_ANGLE, NODE_TO_NOTE }
