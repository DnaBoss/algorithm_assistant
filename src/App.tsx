import { useMemo, useState } from 'react'
import './App.css'

type VisualKind = 'array' | 'linked-list' | 'tree' | 'stack'
type Pointer = { label: string; index?: number; node?: string; color?: string }
type Step = {
  title: string
  explain: string
  codeLine: string
  variables: Record<string, string | number | boolean | null>
  visual: {
    kind: VisualKind
    items?: Array<number | string>
    links?: Array<{ id: string; value: number | string; next?: string | null; highlight?: boolean; faded?: boolean }>
    nodes?: Array<{ id: string; value: number | string; x: number; y: number; left?: string; right?: string; highlight?: boolean; faded?: boolean }>
    stack?: string[]
    pointers?: Pointer[]
    notes?: string[]
  }
}
type Tutorial = { id: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; group: string; summary: string; tags: string[]; idea: string[]; complexity: string; code: string[]; steps: Step[] }

const tutorials: Tutorial[] = [
  { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', group: 'Array / Hash Map', summary: '用雜湊表記錄看過的數字，遇到 target - nums[i] 就回傳答案。', tags: ['Blind 75', 'LeetCode 75', 'Array', 'Hash Map', 'Beginner'], idea: ['每次只問一件事：目前 nums[i] 需要誰當補數？', '先查表再放入，避免同一個元素被用兩次。', '白板 dry run 的重點是 map 內容與 i 的移動。'], complexity: 'Time O(n), Space O(n)', code: ['const map = new Map<number, number>()', 'for (let i = 0; i < nums.length; i++) {', '  const need = target - nums[i]', '  if (map.has(need)) return [map.get(need)!, i]', '  map.set(nums[i], i)', '}'], steps: [
    { title: '起點', explain: 'target=9，還沒看過任何數字。', codeLine: 'const map = new Map<number, number>()', variables: { i: '-', target: 9, need: '-', map: '{}' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'i 尚未開始' }], notes: ['map = {}'] } },
    { title: '看 nums[0]=2', explain: '需要 7，map 裡沒有 7，所以把 2 的索引 0 放進 map。', codeLine: '  map.set(nums[i], i)', variables: { i: 0, nums_i: 2, need: 7, map: '{2:0}' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'i', index: 0, color: '#18E299' }], notes: ['need = 9 - 2 = 7', '沒有找到，記錄 2 → 0'] } },
    { title: '看 nums[1]=7', explain: '需要 2，map 已經有 2，答案是 [0,1]。', codeLine: '  if (map.has(need)) return [map.get(need)!, i]', variables: { i: 1, nums_i: 7, need: 2, answer: '[0,1]' }, visual: { kind: 'array', items: [2, 7, 11, 15], pointers: [{ label: 'match', index: 0, color: '#a78bfa' }, { label: 'i', index: 1, color: '#18E299' }], notes: ['need = 9 - 7 = 2', 'map[2] = 0，回傳 [0,1]'] } }
  ]},
  { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', group: 'Linked List', summary: '用 dummy 節點與 tail 指標，把較小節點接到結果鏈表後面。', tags: ['Blind 75', 'Linked List', 'Two Pointers', 'Beginner'], idea: ['dummy 讓插入第一個節點不需要特判。', 'tail 永遠指向結果鏈表最後一個節點。', '比較 l1 與 l2 當前值，接上小的，該指標往後。'], complexity: 'Time O(n+m), Space O(1)', code: ['const dummy = new ListNode(0)', 'let tail = dummy', 'while (l1 && l2) {', '  if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next }', '  else { tail.next = l2; l2 = l2.next }', '  tail = tail.next', '}', 'tail.next = l1 ?? l2'], steps: [
    { title: '起點', explain: 'l1 指向 1，l2 指向 1，dummy/tail 在結果鏈表的虛擬頭。', codeLine: 'let tail = dummy', variables: { l1: 1, l2: 1, tail: 'dummy', result: 'dummy' }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: null, highlight: true }, { id: 'a1', value: 1, next: 'a2' }, { id: 'a2', value: 2, next: 'a3' }, { id: 'a3', value: 4, next: null }, { id: 'b1', value: 1, next: 'b2' }, { id: 'b2', value: 3, next: 'b3' }, { id: 'b3', value: 4, next: null }], pointers: [{ label: 'tail', node: 'd' }, { label: 'l1', node: 'a1' }, { label: 'l2', node: 'b1' }], notes: ['Result: dummy'] } },
    { title: '接上 l1 的 1', explain: 'l1.val <= l2.val，因此 tail.next 指向 l1，l1 往後到 2，tail 往後到剛接上的 1。', codeLine: '  if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next }', variables: { l1: 2, l2: 1, tail: '第一個 1', result: '1' }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: 'a1', faded: true }, { id: 'a1', value: 1, next: null, highlight: true }, { id: 'a2', value: 2, next: 'a3' }, { id: 'a3', value: 4, next: null }, { id: 'b1', value: 1, next: 'b2' }, { id: 'b2', value: 3, next: 'b3' }, { id: 'b3', value: 4, next: null }], pointers: [{ label: 'tail', node: 'a1' }, { label: 'l1', node: 'a2' }, { label: 'l2', node: 'b1' }], notes: ['Result: 1'] } },
    { title: '接上 l2 的 1', explain: '現在 l2 的 1 比 l1 的 2 小，把 l2 接到 tail 後面。', codeLine: '  else { tail.next = l2; l2 = l2.next }', variables: { l1: 2, l2: 3, tail: '第二個 1', result: '1 → 1' }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: 'a1', faded: true }, { id: 'a1', value: 1, next: 'b1', faded: true }, { id: 'b1', value: 1, next: null, highlight: true }, { id: 'a2', value: 2, next: 'a3' }, { id: 'a3', value: 4, next: null }, { id: 'b2', value: 3, next: 'b3' }, { id: 'b3', value: 4, next: null }], pointers: [{ label: 'tail', node: 'b1' }, { label: 'l1', node: 'a2' }, { label: 'l2', node: 'b2' }], notes: ['Result: 1 → 1'] } },
    { title: '後續合併完成', explain: '依序接 2、3、4、4；每次只改 tail.next，再移動來源指標與 tail。', codeLine: 'tail.next = l1 ?? l2', variables: { l1: null, l2: null, result: '1 → 1 → 2 → 3 → 4 → 4' }, visual: { kind: 'linked-list', links: [{ id: 'd', value: 'dummy', next: 'a1', faded: true }, { id: 'a1', value: 1, next: 'b1' }, { id: 'b1', value: 1, next: 'a2' }, { id: 'a2', value: 2, next: 'b2' }, { id: 'b2', value: 3, next: 'a3' }, { id: 'a3', value: 4, next: 'b3' }, { id: 'b3', value: 4, next: null, highlight: true }], pointers: [{ label: 'tail', node: 'b3' }], notes: ['答案從 dummy.next 開始'] } }
  ]},
  { id: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy', group: 'Tree / DFS', summary: '對每個節點交換 left 與 right，再遞迴處理左右子樹。', tags: ['Blind 75', 'Tree', 'DFS', 'Recursion', 'Beginner'], idea: ['白板上先標出 current node。', '在 current node 上交換左右孩子。', '再往左子樹與右子樹遞迴；圖示會顯示結構改變。'], complexity: 'Time O(n), Space O(h)', code: ['function invert(root) {', '  if (!root) return null', '  const tmp = root.left', '  root.left = root.right', '  root.right = tmp', '  invert(root.left); invert(root.right)', '  return root', '}'], steps: [
    { title: '原始樹', explain: 'current 在 root=4，左邊是 2，右邊是 7。', codeLine: '  if (!root) return null', variables: { current: 4, left: 2, right: 7 }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '2', right: '7', highlight: true }, { id: '2', value: 2, x: 28, y: 35, left: '1', right: '3' }, { id: '7', value: 7, x: 72, y: 35, left: '6', right: '9' }, { id: '1', value: 1, x: 18, y: 68 }, { id: '3', value: 3, x: 38, y: 68 }, { id: '6', value: 6, x: 62, y: 68 }, { id: '9', value: 9, x: 82, y: 68 }], pointers: [{ label: 'current', node: '4' }] } },
    { title: '交換 root 的左右', explain: '4.left 與 4.right 對調，2 與 7 位置交換。', codeLine: '  root.left = root.right', variables: { current: 4, left: 7, right: 2 }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '7', right: '2', highlight: true }, { id: '7', value: 7, x: 28, y: 35, left: '6', right: '9' }, { id: '2', value: 2, x: 72, y: 35, left: '1', right: '3' }, { id: '6', value: 6, x: 18, y: 68 }, { id: '9', value: 9, x: 38, y: 68 }, { id: '1', value: 1, x: 62, y: 68 }, { id: '3', value: 3, x: 82, y: 68 }], pointers: [{ label: 'current', node: '4' }], notes: ['只改指標，不搬值'] } },
    { title: '遞迴到 7', explain: 'current 移到 7，交換 6 與 9。', codeLine: '  invert(root.left); invert(root.right)', variables: { current: 7, left: 9, right: 6 }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '7', right: '2' }, { id: '7', value: 7, x: 28, y: 35, left: '9', right: '6', highlight: true }, { id: '2', value: 2, x: 72, y: 35, left: '1', right: '3' }, { id: '9', value: 9, x: 18, y: 68 }, { id: '6', value: 6, x: 38, y: 68 }, { id: '1', value: 1, x: 62, y: 68 }, { id: '3', value: 3, x: 82, y: 68 }], pointers: [{ label: 'current', node: '7' }] } },
    { title: '完成', explain: '7 與 2 的子節點都完成交換，得到反轉後的樹。', codeLine: '  return root', variables: { answer: '[4,7,2,9,6,3,1]' }, visual: { kind: 'tree', nodes: [{ id: '4', value: 4, x: 50, y: 8, left: '7', right: '2' }, { id: '7', value: 7, x: 28, y: 35, left: '9', right: '6' }, { id: '2', value: 2, x: 72, y: 35, left: '3', right: '1', highlight: true }, { id: '9', value: 9, x: 18, y: 68 }, { id: '6', value: 6, x: 38, y: 68 }, { id: '3', value: 3, x: 62, y: 68 }, { id: '1', value: 1, x: 82, y: 68 }], notes: ['每個節點都做同一個動作：交換 left/right'] } }
  ]},
  { id: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', group: 'Stack', summary: '左括號入 stack；右括號時檢查 stack top 是否是對應左括號。', tags: ['Blind 75', 'Stack', 'String', 'Beginner'], idea: ['stack 保存尚未被配對的左括號。', '遇到右括號就必須消掉最新的左括號。', '最後 stack 空才代表全部配對完成。'], complexity: 'Time O(n), Space O(n)', code: ['for (const ch of s) {', '  if (open.has(ch)) stack.push(ch)', '  else if (stack.pop() !== pair[ch]) return false', '}', 'return stack.length === 0'], steps: [
    { title: '讀到 (', explain: '左括號入 stack。', codeLine: '  if (open.has(ch)) stack.push(ch)', variables: { ch: '(', stack: '[(]' }, visual: { kind: 'stack', stack: ['('], pointers: [{ label: 'top', index: 0 }], notes: ['s = ()[]{}'] } },
    { title: '讀到 )', explain: '右括號需要 (，stack top 正好是 (，彈出。', codeLine: '  else if (stack.pop() !== pair[ch]) return false', variables: { ch: ')', need: '(', stack: '[]' }, visual: { kind: 'stack', stack: [], notes: ['配對成功，stack 清空'] } },
    { title: '讀到 [ 與 ]', explain: '[ 入 stack，接著 ] 讓 [ 出 stack。', codeLine: '  else if (stack.pop() !== pair[ch]) return false', variables: { ch: ']', need: '[', stack: '[]' }, visual: { kind: 'stack', stack: [], notes: ['第二組配對成功'] } },
    { title: '全部完成', explain: '最後 stack 為空，所以字串有效。', codeLine: 'return stack.length === 0', variables: { valid: true, stack: '[]' }, visual: { kind: 'stack', stack: [], notes: ['答案 true'] } }
  ]}
]

const roadmap = [
  { title: 'Blind / LeetCode 75', body: '先以 75 題建立核心題庫：陣列、字串、雙指標、樹、圖、DP、Heap。' },
  { title: 'LeetCode Top 150', body: '沿用同一份 Tutorial schema，補充面試高頻題與進階變形。' },
  { title: 'DB 教程', body: '規劃 SQL dry run：資料表、索引、JOIN 中間表、查詢計畫視覺化。' },
  { title: '分類算法教程', body: '樹、鏈結串列、圖、陣列、字串、動態規畫、回溯、貪心皆可獨立瀏覽。' },
  { title: '多標籤索引', body: '每題可同時屬於 Blind 75、Tree、Beginner、DFS 等多個 tag。' }
]

function Visualizer({ step }: { step: Step }) {
  const v = step.visual
  if (v.kind === 'array') return <div className="visual array-viz"><div className="cells">{v.items?.map((item, i) => <div key={i} className="cell-wrap"><div className={'cell ' + (v.pointers?.some(p => p.index === i) ? 'active' : '')}>{item}</div><span className="index">{i}</span>{v.pointers?.filter(p => p.index === i).map(p => <b key={p.label} className="pointer" style={{ color: p.color }}>{p.label}</b>)}</div>)}</div><Notes notes={v.notes} /></div>
  if (v.kind === 'linked-list') return <div className="visual list-viz"><div className="linked-row">{v.links?.map((n, idx) => <div className="node-wrap" key={n.id}><div className={'list-node ' + (n.highlight ? 'active ' : '') + (n.faded ? 'faded' : '')}><span>{n.value}</span><small>{n.next ? 'next' : 'null'}</small></div>{idx < (v.links?.length ?? 0) - 1 && <span className="arrow">→</span>}<div className="node-pointers">{v.pointers?.filter(p => p.node === n.id).map(p => <b key={p.label}>{p.label}</b>)}</div></div>)}</div><Notes notes={v.notes} /></div>
  if (v.kind === 'tree') return <div className="visual tree-viz"><svg viewBox="0 0 100 86" role="img" aria-label="tree dry run">{v.nodes?.flatMap(n => [n.left, n.right].filter(Boolean).map(child => { const c = v.nodes?.find(x => x.id === child)!; return <line key={n.id + '-' + child} x1={n.x} y1={n.y + 5} x2={c.x} y2={c.y - 5} className="edge" /> }))}{v.nodes?.map(n => <g key={n.id}><circle cx={n.x} cy={n.y} r="5.8" className={n.highlight ? 'tree-node active' : 'tree-node'} /><text x={n.x} y={n.y + 1.5} textAnchor="middle">{n.value}</text>{v.pointers?.filter(p => p.node === n.id).map(p => <text key={p.label} x={n.x} y={n.y - 8} textAnchor="middle" className="tree-pointer">{p.label}</text>)}</g>)}</svg><Notes notes={v.notes} /></div>
  return <div className="visual stack-viz"><div className="stack-box">{(v.stack?.length ? v.stack : ['空']).map((s, i) => <div className={s === '空' ? 'stack-empty' : 'stack-item'} key={i}>{s}</div>)}</div><Notes notes={v.notes} /></div>
}
function Notes({ notes }: { notes?: string[] }) { return notes?.length ? <div className="notes">{notes.map(n => <span key={n}>{n}</span>)}</div> : null }
function Tags({ tags }: { tags: string[] }) { return <div className="tags">{tags.map(t => <span key={t}>{t}</span>)}</div> }

function App() {
  const [tag, setTag] = useState('All')
  const [selectedId, setSelectedId] = useState(tutorials[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const allTags = useMemo(() => ['All', ...Array.from(new Set(tutorials.flatMap(t => t.tags))).sort()], [])
  const filtered = tag === 'All' ? tutorials : tutorials.filter(t => t.tags.includes(tag))
  const tutorial = tutorials.find(t => t.id === selectedId) ?? tutorials[0]
  const step = tutorial.steps[stepIndex] ?? tutorial.steps[0]
  const choose = (id: string) => { setSelectedId(id); setStepIndex(0) }
  return <main>
    <header className="nav"><div className="brand"><span className="logo">AA</span><span>Algorithm Assistant</span></div><nav><a href="#tutorials">教程</a><a href="#roadmap">路線圖</a><a href="https://labuladong.online/zh/" target="_blank">靈感來源</a></nav></header>
    <section className="hero"><div className="hero-bg" /><p className="eyebrow">WHITEBOARD DRY RUN • BLIND 75 FIRST</p><h1>像老師在白板上一步步推演的算法學習網站</h1><p className="lead">不追求真正逐行 debug，而是把面試手寫思路、變數當前值、指標移動、鏈表/樹/陣列圖形變化，拆成可上一頁/下一頁的教學步驟。</p><div className="hero-actions"><a className="btn primary" href="#tutorials">開始學 Blind 75</a><a className="btn secondary" href="#roadmap">查看未來規劃</a></div></section>
    <section className="stats"><div><b>{tutorials.length}</b><span>已建立示範教程</span></div><div><b>{allTags.length - 1}</b><span>可交叉查詢標籤</span></div><div><b>75+</b><span>後續題庫目標</span></div></section>
    <section id="tutorials" className="layout"><aside className="sidebar"><h2>題目索引</h2><div className="filter">{allTags.map(t => <button key={t} onClick={() => setTag(t)} className={tag === t ? 'selected' : ''}>{t}</button>)}</div><div className="cards">{filtered.map(t => <button key={t.id} onClick={() => choose(t.id)} className={'problem-card ' + (t.id === tutorial.id ? 'active' : '')}><span>{t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div></aside>
      <article className="lesson"><div className="lesson-head"><div><p className="eyebrow">{tutorial.group} • {tutorial.difficulty}</p><h2>{tutorial.title}</h2><p>{tutorial.summary}</p></div><Tags tags={tutorial.tags} /></div>
        <div className="idea"><h3>思路講解</h3><ol>{tutorial.idea.map(i => <li key={i}>{i}</li>)}</ol><p className="complexity">{tutorial.complexity}</p></div>
        <div className="dryrun"><div className="step-panel"><div className="step-top"><span>Step {stepIndex + 1}/{tutorial.steps.length}</span><h3>{step.title}</h3><p>{step.explain}</p></div><Visualizer step={step} /><div className="controls"><button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>← 上一步</button><button onClick={() => setStepIndex(Math.min(tutorial.steps.length - 1, stepIndex + 1))} disabled={stepIndex === tutorial.steps.length - 1}>下一步 →</button></div></div>
          <div className="state-panel"><h3>當前變數</h3><div className="vars">{Object.entries(step.variables).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>)}</div><h3>對應白板程式碼</h3><pre>{tutorial.code.map(line => <code key={line} className={line === step.codeLine ? 'line active' : 'line'}>{line}</code>)}</pre></div></div>
      </article></section>
    <section id="roadmap" className="roadmap"><p className="eyebrow">CONTENT ROADMAP</p><h2>資料模型一開始就支援多題庫、多分類、多標籤</h2><div className="roadmap-grid">{roadmap.map(r => <div className="road-card" key={r.title}><h3>{r.title}</h3><p>{r.body}</p></div>)}</div></section>
  </main>
}
export default App
