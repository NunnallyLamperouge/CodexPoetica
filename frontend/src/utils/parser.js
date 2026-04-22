import * as acorn from 'acorn'
import { simple as walkSimple } from 'acorn-walk'
import { api } from '../api/index.js'

export async function parseCode(language, sourceCode) {
  if (!sourceCode || !sourceCode.trim()) {
    return { nodeCount: 0, maxDepth: 0, functionCount: 0, variableCount: 0, branchCount: 0, loopCount: 0, classCount: 0, commentCount: 0 }
  }
  if (language === 'javascript') {
    return parseJS(sourceCode)
  } else {
    return parsePython(sourceCode)
  }
}

function parseJS(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' })
    let nodeCount = 0, maxDepth = 0, functionCount = 0, variableCount = 0
    let branchCount = 0, loopCount = 0, classCount = 0
    const sequence = []
    const depthCurve = []
    const widthByDepth = []

    function walk(node, depth) {
      if (!node || typeof node !== 'object') return
      nodeCount++
      if (depth > maxDepth) maxDepth = depth
      const type = node.type
      sequence.push(type)
      depthCurve.push(depth)
      widthByDepth[depth] = (widthByDepth[depth] || 0) + 1
      if (type === 'FunctionDeclaration' || type === 'FunctionExpression' || type === 'ArrowFunctionExpression') functionCount++
      if (type === 'VariableDeclarator') variableCount++
      if (type === 'IfStatement' || type === 'SwitchStatement' || type === 'ConditionalExpression') branchCount++
      if (type === 'ForStatement' || type === 'WhileStatement' || type === 'DoWhileStatement' || type === 'ForInStatement' || type === 'ForOfStatement') loopCount++
      if (type === 'ClassDeclaration' || type === 'ClassExpression') classCount++
      for (const key of Object.keys(node)) {
        if (key === 'type' || key === 'start' || key === 'end') continue
        const child = node[key]
        if (Array.isArray(child)) child.forEach(c => walk(c, depth + 1))
        else if (child && typeof child === 'object' && child.type) walk(child, depth + 1)
      }
    }
    walk(ast, 0)
    const commentCount = (code.match(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g) || []).length
    return { nodeCount, maxDepth, functionCount, variableCount, branchCount, loopCount, classCount, commentCount, sequence, depthCurve, widthByDepth, error: null }
  } catch (e) {
    return { nodeCount: 0, maxDepth: 0, functionCount: 0, variableCount: 0, branchCount: 0, loopCount: 0, classCount: 0, commentCount: 0, sequence: [], depthCurve: [], widthByDepth: [], error: e.message }
  }
}

async function parsePython(code) {
  try {
    const res = await api.parseCode('python', code)
    const data = res.data.data || {}
    const loopCount = (code.match(/\b(for|while)\b/g) || []).length
    const classCount = (code.match(/\bclass\s+\w+/g) || []).length
    const commentCount = (code.match(/#[^\n]*/g) || []).length
    // build depthCurve from indentation
    const lines = code.split('\n').filter(l => l.trim())
    const depthCurve = lines.map(l => Math.floor((l.match(/^(\s*)/)[1].length) / 4))
    const widthByDepth = []
    depthCurve.forEach(d => { widthByDepth[d] = (widthByDepth[d] || 0) + 1 })
    return { ...data, loopCount, classCount, commentCount, sequence: [], depthCurve, widthByDepth }
  } catch {
    const lines = code.split('\n')
    const functionCount = (code.match(/\bdef\s+\w+/g) || []).length
    const variableCount = (code.match(/^\s*\w+\s*=/gm) || []).length
    const branchCount = (code.match(/\b(if|elif|else)\b/g) || []).length
    const loopCount = (code.match(/\b(for|while)\b/g) || []).length
    const classCount = (code.match(/\bclass\s+\w+/g) || []).length
    const commentCount = (code.match(/#[^\n]*/g) || []).length
    const depthCurve = lines.filter(l => l.trim()).map(l => Math.floor((l.match(/^(\s*)/)[1].length) / 4))
    const widthByDepth = []
    depthCurve.forEach(d => { widthByDepth[d] = (widthByDepth[d] || 0) + 1 })
    const maxDepth = Math.max(...depthCurve, 0)
    return { nodeCount: lines.length, maxDepth, functionCount, variableCount, branchCount, loopCount, classCount, commentCount, sequence: [], depthCurve, widthByDepth, error: null }
  }
}
