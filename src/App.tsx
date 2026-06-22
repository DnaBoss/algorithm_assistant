import { useMemo, useState } from 'react'
import './App.css'
import { tutorials, type Step } from './tutorialData'

const roadmap = [
  { title: 'Blind / LeetCode 75', body: '已補齊 75 題完整清單；每題都有思路、標籤、變數表與 dry-run 步驟。' },
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
function VariableTimeline({ steps, activeIndex }: { steps: Step[]; activeIndex: number }) {
  const keys = Array.from(new Set(steps.flatMap(s => Object.keys(s.variables)))).slice(0, 8)
  return <div className="timeline"><h3>變數變化時間線</h3><div className="timeline-scroll"><table><thead><tr><th>Step</th>{keys.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{steps.map((s, i) => <tr key={s.title} className={i === activeIndex ? 'active' : ''}><td>{i + 1}. {s.title}</td>{keys.map(k => <td key={k}>{s.variables[k] === undefined ? '—' : String(s.variables[k])}</td>)}</tr>)}</tbody></table></div></div>
}

const primaryTags = ['All', 'Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Matrix', 'Heap', 'Trie', 'Stack', 'Interval']

function App() {
  const [tag, setTag] = useState('All')
  const [selectedId, setSelectedId] = useState(tutorials[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [showAllTags, setShowAllTags] = useState(false)
  const allTags = useMemo(() => ['All', ...Array.from(new Set(tutorials.flatMap(t => t.tags))).sort()], [])
  const visibleTags = showAllTags ? allTags : primaryTags.filter(t => allTags.includes(t))
  const filtered = tag === 'All' ? tutorials : tutorials.filter(t => t.tags.includes(tag))
  const tutorial = tutorials.find(t => t.id === selectedId) ?? filtered[0] ?? tutorials[0]
  const step = tutorial.steps[stepIndex] ?? tutorial.steps[0]
  const choose = (id: string) => { setSelectedId(id); setStepIndex(0) }
  const chooseTag = (nextTag: string) => {
    const nextFiltered = nextTag === 'All' ? tutorials : tutorials.filter(t => t.tags.includes(nextTag))
    setTag(nextTag)
    setSelectedId(nextFiltered[0]?.id ?? tutorials[0].id)
    setStepIndex(0)
  }
  return <main>
    <header className="nav"><div className="brand"><span className="logo">AA</span><span>Algorithm Assistant</span></div><nav><a href="#tutorials">教程</a><a href="#roadmap">路線圖</a><a href="https://labuladong.online/zh/" target="_blank">靈感來源</a></nav></header>
    <section className="hero"><div className="hero-bg" /><p className="eyebrow">WHITEBOARD DRY RUN • COMPLETE BLIND 75</p><h1>完整 Blind / LeetCode 75 互動算法教學</h1><p className="lead">每題都有多標籤、思路講解、當前變數表、白板式 dry-run 與上一頁/下一頁步驟。鏈表會畫節點與指標，樹題會畫 current node 與左右子樹狀態。</p><div className="hero-actions"><a className="btn primary" href="#tutorials">開始學 75 題</a><a className="btn secondary" href="#roadmap">查看未來規劃</a></div></section>
    <section className="stats"><div><b>{tutorials.length}</b><span>Blind 75 題完整收錄</span></div><div><b>{allTags.length - 1}</b><span>可交叉查詢標籤</span></div><div><b>{filtered.length}</b><span>目前篩選結果</span></div></section>
    <section id="tutorials" className="layout"><aside className="sidebar"><div className="sidebar-head"><div><h2>題目索引</h2><p>選分類會自動打開該分類第一題</p></div><button className="tag-toggle" onClick={() => setShowAllTags(!showAllTags)}>{showAllTags ? '收合標籤' : `更多標籤 (${allTags.length - primaryTags.length})`}</button></div><div className="active-filter">目前：<b>{tag}</b> · {filtered.length} 題</div><div className="filter">{visibleTags.map(t => <button key={t} onClick={() => chooseTag(t)} className={tag === t ? 'selected' : ''}>{t}</button>)}</div><div className="cards">{filtered.map(t => <button key={t.id} onClick={() => choose(t.id)} className={'problem-card ' + (t.id === tutorial.id ? 'active' : '')}><span>{t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div></aside>
      <article className="lesson"><div className="lesson-head"><div><p className="eyebrow">{tutorial.group} • {tutorial.difficulty}</p><h2>{tutorial.title}</h2><p>{tutorial.summary}</p></div><Tags tags={tutorial.tags} /></div>
        <div className="idea"><h3>思路講解</h3><ol>{tutorial.idea.map(i => <li key={i}>{i}</li>)}</ol><p className="complexity">{tutorial.complexity}</p></div>
        <div className="dryrun"><div className="step-panel"><div className="step-top"><span>Step {stepIndex + 1}/{tutorial.steps.length}</span><h3>{step.title}</h3><p>{step.explain}</p></div><Visualizer step={step} /><div className="controls"><button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>← 上一步</button><button onClick={() => setStepIndex(Math.min(tutorial.steps.length - 1, stepIndex + 1))} disabled={stepIndex === tutorial.steps.length - 1}>下一步 →</button></div></div>
          <div className="state-panel"><h3>當前變數</h3><div className="vars">{Object.entries(step.variables).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>)}</div><VariableTimeline steps={tutorial.steps} activeIndex={stepIndex} /><h3>對應白板程式碼</h3><pre>{tutorial.code.map(line => <code key={line} className={line === step.codeLine ? 'line active' : 'line'}>{line}</code>)}</pre></div></div>
      </article></section>
    <section id="roadmap" className="roadmap"><p className="eyebrow">CONTENT ROADMAP</p><h2>完整 75 題已建立，下一步可擴充更細緻的逐題專屬動畫</h2><div className="roadmap-grid">{roadmap.map(r => <div className="road-card" key={r.title}><h3>{r.title}</h3><p>{r.body}</p></div>)}</div></section>
  </main>
}
export default App
