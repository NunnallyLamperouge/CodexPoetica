const FUNCTION_LINES = [
  '一个名字从括号里醒来', '函数在递归中寻找自己', '调用，是另一种呼唤',
  '方法展开如花瓣', '在参数的边界处停留', '返回值是一封未寄出的信',
  '闭包把光封存在作用域里', '异步的承诺悬在空中等待兑现',
  '递归是镜子对着镜子', '每一次调用都是一次出发',
  '函数体内，逻辑在低语', '箭头指向的地方，是另一个世界',
  '参数如候鸟，飞入又飞出',
]

const VARIABLE_LINES = [
  '变量是容器，也是谜', '命名是第一次赋予意义', '值在赋值中流动',
  '每个标识符都是一个承诺', '数据在内存中低语',
  '引用是绳子，连接着两个存在', '生命周期短暂，如同一行注释',
  '常量是不变的誓言', '指针指向的地方，有另一个故事',
  '变量的名字比它的值更长久', '作用域是边界，也是庇护',
  '未定义是一种沉默', '类型是灵魂的形状',
]

const DEPTH_LINES = [
  '嵌套如俄罗斯套娃', '层层深入，直到核心', '缩进是思维的阶梯',
  '深度即是复杂的诗意', '在最深处，逻辑沉默',
  '每一层都是一个世界', '括号里还有括号，意义里还有意义',
  '深渊凝视着代码，代码也凝视着深渊', '层级是时间的切片',
  '越深越安静，越深越孤独',
]

const BRANCH_LINES = [
  '条件分叉，命运各异', '真与假之间有一道门', '选择在布尔值中颤抖',
  '分支是代码的十字路口', 'else 是另一种可能',
  '当条件成立，世界走向另一条路', '逻辑的刀锋切开现实',
  '判断是一瞬间的永恒', '开关打开，光落在某处',
]

const LOOP_LINES = [
  '循环是时间的回声', '每一次迭代都是新的开始',
  '在重复中寻找变化', '循环终止的那一刻，是解脱',
  '无限循环是一首没有结尾的诗', '计数器记录着流逝',
  '迭代器走过每一个节点，如同旅人',
]

const CLASS_LINES = [
  '类是蓝图，对象是建筑', '继承是血脉的延续',
  '封装把秘密藏在方法里', '实例化是从虚无中召唤存在',
  '对象有自己的状态和记忆', '多态是同一个名字的不同面孔',
  '构造函数是诞生的仪式',
]

const OPENING_LINES = [
  '代码在沉默中生长', '逻辑是另一种语言', '算法如诗，结构如歌',
  '在符号的森林里', '程序是时间的切片',
  '每一行代码都是一次思考的痕迹', '机器读懂了人类的意图',
  '在二进制的海洋里，意义浮现', '编译器把思想变成现实',
  '源码是写给未来的信',
]

const CLOSING_LINES = [
  '程序终止，诗意留存', '执行完毕，世界依然运转',
  '代码落幕，逻辑永恒', '最后一行，是另一个开始',
  '注释之外，是沉默的智慧',
]

function pickRandom(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function generatePoem(astSummary, style = 'free_verse') {
  const {
    nodeCount = 0, maxDepth = 0, functionCount = 0,
    variableCount = 0, branchCount = 0,
    loopCount = 0, classCount = 0,
  } = astSummary || {}

  if (nodeCount === 0) {
    return { title: '空白之诗', style, lines: ['代码尚未书写', '诗歌在等待'] }
  }

  const pool = []
  pool.push(...pickRandom(OPENING_LINES, 1))
  if (functionCount > 0) pool.push(...pickRandom(FUNCTION_LINES, Math.min(functionCount, 3)))
  if (variableCount > 0) pool.push(...pickRandom(VARIABLE_LINES, Math.min(variableCount, 2)))
  if (maxDepth > 2) pool.push(...pickRandom(DEPTH_LINES, 1))
  if (branchCount > 0) pool.push(...pickRandom(BRANCH_LINES, Math.min(branchCount, 2)))
  if (loopCount > 0) pool.push(...pickRandom(LOOP_LINES, Math.min(loopCount, 2)))
  if (classCount > 0) pool.push(...pickRandom(CLASS_LINES, Math.min(classCount, 2)))

  const title = generateTitle(astSummary)

  if (style === 'haiku') {
    return { title, style, lines: pool.slice(0, 3) }
  }

  if (style === 'epic') {
    const epicLines = [...pool]
    if (epicLines.length < 8) {
      epicLines.push(...pickRandom(OPENING_LINES, 2))
      epicLines.push(...pickRandom(FUNCTION_LINES, 2))
    }
    epicLines.push(...pickRandom(CLOSING_LINES, 1))
    return { title, style, lines: epicLines }
  }

  if (style === 'sonnet') {
    return buildSonnet(pool, title)
  }

  if (style === 'prose_poem') {
    return buildProsePoem(pool, title, astSummary)
  }

  // free_verse
  const lines = [...pool, ...pickRandom(CLOSING_LINES, 1)]
  return { title, style, lines }
}

function buildSonnet(pool, title) {
  const all = [
    ...OPENING_LINES, ...FUNCTION_LINES, ...VARIABLE_LINES,
    ...DEPTH_LINES, ...BRANCH_LINES, ...LOOP_LINES, ...CLASS_LINES,
  ]
  const shuffled = [...all].sort(() => Math.random() - 0.5)
  const lines = []
  // 前8行铺陈
  for (let i = 0; i < 8; i++) lines.push(pool[i] || shuffled[i] || OPENING_LINES[i % OPENING_LINES.length])
  // 空行分隔
  lines.push('')
  // 后6行转折
  const turn = [...CLOSING_LINES, ...pickRandom(DEPTH_LINES, 3), ...pickRandom(BRANCH_LINES, 2)]
  for (let i = 0; i < 5; i++) lines.push(turn[i] || shuffled[i + 8])
  lines.push(pickRandom(CLOSING_LINES, 1)[0])
  return { title, style: 'sonnet', lines }
}

function buildProsePoem(pool, title, ast) {
  const connectors = ['于是，', '然而，', '就这样，', '在那之后，', '终于，', '此刻，']
  const lines = []
  pool.forEach((line, i) => {
    if (i > 0 && Math.random() > 0.6) {
      lines.push(pickRandom(connectors, 1)[0] + line)
    } else {
      lines.push(line)
    }
  })
  lines.push(pickRandom(CLOSING_LINES, 1)[0])
  return { title, style: 'prose_poem', lines }
}

function generateTitle(ast) {
  const { functionCount = 0, maxDepth = 0, classCount = 0, loopCount = 0 } = ast
  if (classCount > 0) return '对象的诗篇'
  if (loopCount > 3) return '循环的咏叹调'
  if (functionCount > 3) return '函数的森林'
  if (maxDepth > 5) return '深渊之代码'
  if (functionCount === 1) return '孤独的函数'
  return '代码之诗'
}

const SHAPE_TITLES = {
  spiral:   '递归的螺旋',
  tower:    '深渊之塔',
  flat:     '平原上的代码',
  bush:     '分支的丛林',
  balanced: '均衡的宇宙',
}

export function generateFromDna(dna, style = 'free_verse') {
  if (!dna) return null
  const { shape, weights, rhythmPattern } = dna
  const title = SHAPE_TITLES[shape] || '代码之诗'

  // build pool weighted by DNA
  const pool = []
  const w = weights || {}
  if (w.function > 0.1) pool.push(...pickRandom(FUNCTION_LINES, Math.ceil(w.function * 5)))
  if (w.variable > 0.1) pool.push(...pickRandom(VARIABLE_LINES, Math.ceil(w.variable * 4)))
  if (w.branch > 0.1)   pool.push(...pickRandom(BRANCH_LINES, Math.ceil(w.branch * 4)))
  if (w.loop > 0.1)     pool.push(...pickRandom(LOOP_LINES, Math.ceil(w.loop * 4)))
  if (w.class > 0.1)    pool.push(...pickRandom(CLASS_LINES, Math.ceil(w.class * 3)))
  if (pool.length === 0) pool.push(...pickRandom(OPENING_LINES, 3))

  // apply rhythm: trim/pad lines based on rhythmPattern
  const rhythmLines = pool.map((line, i) => {
    const targetLen = rhythmPattern?.[i % (rhythmPattern?.length || 1)] || 4
    if (targetLen <= 3) return line.slice(0, Math.ceil(line.length * 0.6))
    if (targetLen >= 6) return line + '，' + pickRandom(DEPTH_LINES, 1)[0].slice(0, 4)
    return line
  })

  // shape-specific opening
  const shapeOpening = {
    spiral:   '在递归的螺旋里，时间折叠',
    tower:    '层层深入，直到光无法抵达',
    flat:     '一切铺展开来，如同平原',
    bush:     '分支蔓延，每一条路都是答案',
    balanced: '结构均衡，如同宇宙的呼吸',
  }
  const lines = [shapeOpening[shape] || pickRandom(OPENING_LINES, 1)[0], ...rhythmLines]
  lines.push(pickRandom(CLOSING_LINES, 1)[0])

  if (style === 'haiku') return { title, style, lines: lines.slice(0, 3), shape }
  if (style === 'sonnet') return buildSonnet(lines, title)
  return { title, style, lines, shape }
}
