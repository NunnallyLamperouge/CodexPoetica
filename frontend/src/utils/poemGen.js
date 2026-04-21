const FUNCTION_LINES = [
  '一个名字从括号里醒来', '函数在递归中寻找自己', '调用，是另一种呼唤',
  '方法展开如花瓣', '在参数的边界处停留', '返回值是一封未寄出的信',
]
const VARIABLE_LINES = [
  '变量是容器，也是谜', '命名是第一次赋予意义', '值在赋值中流动',
  '每个标识符都是一个承诺', '数据在内存中低语',
]
const DEPTH_LINES = [
  '嵌套如俄罗斯套娃', '层层深入，直到核心', '缩进是思维的阶梯',
  '深度即是复杂的诗意', '在最深处，逻辑沉默',
]
const BRANCH_LINES = [
  '条件分叉，命运各异', '真与假之间有一道门', '选择在布尔值中颤抖',
  '分支是代码的十字路口',
]
const OPENING_LINES = [
  '代码在沉默中生长', '逻辑是另一种语言', '算法如诗，结构如歌',
  '在符号的森林里', '程序是时间的切片',
]

function pickRandom(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function generatePoem(astSummary, style = 'free_verse') {
  const { nodeCount = 0, maxDepth = 0, functionCount = 0, variableCount = 0, branchCount = 0 } = astSummary || {}

  if (nodeCount === 0) {
    return { title: '空白之诗', style, lines: ['代码尚未书写', '诗歌在等待'] }
  }

  const lines = []
  lines.push(...pickRandom(OPENING_LINES, 1))
  if (functionCount > 0) lines.push(...pickRandom(FUNCTION_LINES, Math.min(functionCount, 2)))
  if (variableCount > 0) lines.push(...pickRandom(VARIABLE_LINES, Math.min(variableCount, 2)))
  if (maxDepth > 2) lines.push(...pickRandom(DEPTH_LINES, 1))
  if (branchCount > 0) lines.push(...pickRandom(BRANCH_LINES, 1))

  if (style === 'haiku') {
    return {
      title: generateTitle(astSummary),
      style,
      lines: lines.slice(0, 3),
    }
  }
  if (style === 'epic') {
    const epicLines = [...lines, ...lines.slice(0, 2).map(l => l + '，' + pickRandom(OPENING_LINES, 1)[0])]
    return { title: generateTitle(astSummary), style, lines: epicLines }
  }
  return { title: generateTitle(astSummary), style, lines }
}

function generateTitle(ast) {
  const { functionCount = 0, maxDepth = 0 } = ast
  if (functionCount > 3) return '函数的森林'
  if (maxDepth > 5) return '深渊之代码'
  if (functionCount === 1) return '孤独的函数'
  return '代码之诗'
}
