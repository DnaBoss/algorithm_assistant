import { useMemo, useState } from 'react'
import './App.css'
import { tutorials, type Step, type Tutorial } from './tutorialData'
import { problemNumberFor, searchTutorials } from './search'

type TrackId = 'blind75' | 'top150' | 'db' | 'categories' | 'multi-tags'

type Track = {
  id: TrackId
  title: string
  subtitle: string
  description: string
  filter?: (tutorial: Tutorial) => boolean
  actions: string[]
}

const primaryTags = ['All', 'Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Matrix', 'Heap', 'Trie', 'Stack', 'Interval']
const categoryTags = ['Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Matrix', 'Heap', 'Trie', 'Stack', 'Interval', 'Binary Search', 'Two Pointers', 'Backtracking']

const tracks: Track[] = [
  {
    id: 'blind75',
    title: 'Blind / LeetCode 75',
    subtitle: '核心面試題組',
    description: '先把最常考的 75 題練熟；每題直接進入教學、白板 dry-run、C++ 解法與變數追蹤。',
    filter: tutorial => tutorial.tags.includes('Blind 75') || tutorial.tags.includes('LeetCode 75'),
    actions: ['從 Two Sum 開始', '用分類補弱點', '練習 linked list / tree / DP 代表題']
  },
  {
    id: 'top150',
    title: 'LeetCode Top 150',
    subtitle: '完整面試清單',
    description: '收斂到 Top 150 題目清單；適合用搜尋、題號與 tag 交叉安排每日練習。',
    filter: tutorial => tutorial.tags.includes('Top 150') || tutorial.tags.includes('LeetCode Top 150'),
    actions: ['用題號快速定位', '依難度補齊清單', '逐題 dry-run 檢查理解']
  },
  {
    id: 'db',
    title: 'DB 教程',
    subtitle: 'SQL / index / join dry-run',
    description: '規劃為資料庫專屬題組頁：查詢流程、索引命中、JOIN 中間表、交易隔離與 EXPLAIN。',
    actions: ['SQL 查詢 dry-run', '索引與查詢計畫', 'JOIN 中間結果視覺化']
  },
  {
    id: 'categories',
    title: '分類算法教程',
    subtitle: '依資料結構與技巧練習',
    description: '按 Array、Tree、Linked List、Graph、DP 等分類進入題組，不只是標籤列表。',
    actions: ['選一個分類', '看該分類所有題目', '直接打開第一題教學']
  },
  {
    id: 'multi-tags',
    title: '多標籤索引',
    subtitle: '交叉查找題目',
    description: '用 tag 看題目同時屬於哪些路線；適合找 Beginner + Tree、DP + Medium 這種交叉練習。',
    actions: ['查看所有 tag', '看每個 tag 的題數', '點 tag 切換題目索引']
  }
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

function App() {
  const [tag, setTag] = useState('All')
  const [selectedId, setSelectedId] = useState(tutorials[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [showAllTags, setShowAllTags] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTrackId, setActiveTrackId] = useState<TrackId | null>(null)

  const allTags = useMemo(() => ['All', ...Array.from(new Set(tutorials.flatMap(t => t.tags))).sort()], [])
  const tagCounts = useMemo(() => Object.fromEntries(allTags.map(t => [t, t === 'All' ? tutorials.length : tutorials.filter(item => item.tags.includes(t)).length])), [allTags])
  const visibleTags = showAllTags ? allTags : primaryTags.filter(t => allTags.includes(t))
  const searched = useMemo(() => searchTutorials(tutorials, query), [query])
  const filtered = tag === 'All' ? searched : searched.filter(t => t.tags.includes(tag))
  const tutorial = tutorials.find(t => t.id === selectedId) ?? filtered[0] ?? tutorials[0]
  const step = tutorial.steps[stepIndex] ?? tutorial.steps[0]
  const activeTrack = tracks.find(track => track.id === activeTrackId) ?? null
  const trackTutorials = activeTrack?.filter ? tutorials.filter(activeTrack.filter) : []

  const choose = (id: string) => { setSelectedId(id); setStepIndex(0) }
  const chooseTag = (nextTag: string) => {
    const nextFiltered = nextTag === 'All' ? searchTutorials(tutorials, query) : searchTutorials(tutorials, query).filter(t => t.tags.includes(nextTag))
    setTag(nextTag)
    setSelectedId(nextFiltered[0]?.id ?? tutorials[0].id)
    setStepIndex(0)
  }
  const changeQuery = (nextQuery: string) => {
    const nextResults = searchTutorials(tutorials, nextQuery)
    const nextFiltered = tag === 'All' ? nextResults : nextResults.filter(t => t.tags.includes(tag))
    setQuery(nextQuery)
    setSelectedId(nextFiltered[0]?.id ?? tutorials[0].id)
    setStepIndex(0)
  }
  const openTrack = (trackId: TrackId) => { setActiveTrackId(trackId); window.location.hash = 'track' }
  const openLessonFromTrack = (id: string) => { choose(id); setActiveTrackId(null); window.location.hash = 'tutorials' }
  const selectTrackTag = (nextTag: string) => { chooseTag(nextTag); setActiveTrackId(null); window.location.hash = 'tutorials' }

  return <main>
    <header className="nav"><div className="brand"><span className="logo">AL</span><span>Algo Lab</span></div><nav><a href="#tutorials">搜尋題目</a><a href="#tracks">題組</a><a href="https://labuladong.online/zh/" target="_blank">靈感來源</a></nav></header>

    <section className="hero compact"><div className="hero-bg" /><p className="eyebrow">ALGO LAB</p><h1>先找題，再進 dry-run</h1><p className="lead">用題號、題名或分類進入教學；首頁只放能操作的入口。</p><div className="hero-actions"><a className="btn primary" href="#tutorials">搜尋題目</a><a className="btn secondary" href="#tracks">選題組</a></div></section>

    {activeTrack && <section id="track" className="track-page" data-testid="track-page"><button className="btn secondary back-btn" data-testid="track-back" onClick={() => setActiveTrackId(null)}>← 回題組</button><p className="eyebrow">{activeTrack.subtitle}</p><h2>{activeTrack.title}</h2><p>{activeTrack.description}</p><div className="track-actions">{activeTrack.actions.map(action => <span key={action}>{action}</span>)}</div>
      {activeTrack.id === 'db' && <div className="db-modules"><article><h3>SQL dry-run</h3><p>用一張表、一個 WHERE 條件開始，顯示掃描列、過濾列與輸出列。</p></article><article><h3>Index / EXPLAIN</h3><p>對照 full scan 與 index scan，標出 cost、rows 與命中條件。</p></article><article><h3>JOIN 中間表</h3><p>逐步顯示 nested loop / hash join 的中間結果與 row 數變化。</p></article></div>}
      {activeTrack.id === 'categories' && <div className="category-grid">{categoryTags.filter(t => tagCounts[t]).map(t => <button key={t} onClick={() => selectTrackTag(t)}><b>{t}</b><span>{tagCounts[t]} 題</span></button>)}</div>}
      {activeTrack.id === 'multi-tags' && <div className="category-grid tag-index">{allTags.filter(t => t !== 'All').map(t => <button key={t} onClick={() => selectTrackTag(t)}><b>{t}</b><span>{tagCounts[t]} 題</span></button>)}</div>}
      {trackTutorials.length > 0 && <div className="track-lessons">{trackTutorials.map(t => <button key={t.id} onClick={() => openLessonFromTrack(t.id)}><span>#{problemNumberFor(t.id) ?? '—'} · {t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div>}
    </section>}

    <section id="tracks" className="tracks"><p className="eyebrow">題組入口</p><h2>每張卡都能進入專屬題組頁</h2><div className="track-grid">{tracks.map(track => <button key={track.id} className="track-card" data-track-id={track.id} onClick={() => openTrack(track.id)}><span>{track.subtitle}</span><h3>{track.title}</h3><p>{track.description}</p><b>進入題組 →</b></button>)}</div></section>

    <section id="tutorials" className="layout"><aside className="sidebar"><div className="sidebar-head"><div><h2>題目索引</h2><p>可用 LeetCode 題號或題名 fuzzy search</p></div><button className="tag-toggle" onClick={() => setShowAllTags(!showAllTags)}>{showAllTags ? '收合標籤' : `更多標籤 (${allTags.length - primaryTags.length})`}</button></div><label className="search-box"><span>搜尋題目</span><input value={query} onChange={e => changeQuery(e.target.value)} placeholder="例：1、146、coin chnage、valid bst" /></label><div className="active-filter">目前：<b>{tag}</b> · {filtered.length} 題{query && <em> · 搜尋「{query}」</em>}</div><div className="filter">{visibleTags.map(t => <button key={t} onClick={() => chooseTag(t)} className={tag === t ? 'selected' : ''}>{t}</button>)}</div><div className="cards">{filtered.map(t => <button key={t.id} onClick={() => choose(t.id)} className={'problem-card ' + (t.id === tutorial.id ? 'active' : '')}><span>#{problemNumberFor(t.id) ?? '—'} · {t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div></aside>
      <article className="lesson"><div className="lesson-head"><div><p className="eyebrow">{tutorial.group} • {tutorial.difficulty}</p><h2>{tutorial.title}</h2><p>{tutorial.summary}</p></div><Tags tags={tutorial.tags} /></div>
        <div className="idea"><h3>思路講解</h3><ol>{tutorial.idea.map(i => <li key={i}>{i}</li>)}</ol><p className="complexity">{tutorial.complexity}</p></div>
        <div className="dryrun"><div className="step-panel"><div className="step-top"><span>Step {stepIndex + 1}/{tutorial.steps.length}</span><h3>{step.title}</h3><p>{step.explain}</p></div><Visualizer step={step} /><div className="controls"><button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>← 上一步</button><button onClick={() => setStepIndex(Math.min(tutorial.steps.length - 1, stepIndex + 1))} disabled={stepIndex === tutorial.steps.length - 1}>下一步 →</button></div></div>
          <div className="state-panel"><h3>當前變數</h3><div className="vars">{Object.entries(step.variables).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>)}</div><VariableTimeline steps={tutorial.steps} activeIndex={stepIndex} /><h3>對應白板程式碼</h3><pre>{tutorial.code.map(line => <code key={line} className={line === step.codeLine ? 'line active' : 'line'}>{line}</code>)}</pre></div></div>
      </article></section>
  </main>
}
export default App
