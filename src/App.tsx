import { useMemo, useState } from 'react'
import './App.css'
import { tutorials, type SolutionLanguage, type Step, type Tutorial } from './tutorialData'
import { problemNumberFor, searchTutorials } from './search'

const primaryTags = ['All', 'Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Matrix', 'Heap', 'Trie', 'Stack', 'Interval']
const solutionLabels: Record<SolutionLanguage, string> = { cpp: 'C++', java: 'Java', js: 'JS' }

function Visualizer({ step }: { step: Step }) {
  const v = step.visual
  if (v.kind === 'array') return <div className="visual array-viz"><div className="cells">{v.items?.map((item, i) => <div key={i} className="cell-wrap"><div className={'cell ' + (v.pointers?.some(p => p.index === i) ? 'active' : '')}>{item}</div><span className="index">{i}</span>{v.pointers?.filter(p => p.index === i).map(p => <b key={p.label} className="pointer" style={{ color: p.color }}>{p.label}</b>)}</div>)}</div><Notes notes={v.notes} /></div>
  if (v.kind === 'linked-list') return <div className="visual list-viz"><div className="linked-row">{v.links?.map((n, idx) => <div className="node-wrap" key={n.id}><div className={'list-node ' + (n.highlight ? 'active ' : '') + (n.faded ? 'faded' : '')}><span>{n.value}</span><small>{n.next ? 'next' : 'null'}</small></div>{idx < (v.links?.length ?? 0) - 1 && <span className="arrow">→</span>}<div className="node-pointers">{v.pointers?.filter(p => p.node === n.id).map(p => <b key={p.label}>{p.label}</b>)}</div></div>)}</div><Notes notes={v.notes} /></div>
  if (v.kind === 'tree') {
    const nodes = v.nodes ?? []
    return <div className="visual tree-viz"><svg viewBox="0 0 100 86" role="img" aria-label="tree dry run">{nodes.flatMap(n => [n.left, n.right].filter(Boolean).flatMap(child => { const c = nodes.find(x => x.id === child); return c ? [<line key={n.id + '-' + child} x1={n.x} y1={n.y + 5} x2={c.x} y2={c.y - 5} className="edge" />] : [] }))}{nodes.map(n => <g key={n.id}><circle cx={n.x} cy={n.y} r="5.8" className={n.highlight ? 'tree-node active' : 'tree-node'} /><text x={n.x} y={n.y + 1.5} textAnchor="middle">{n.value}</text>{v.pointers?.filter(p => p.node === n.id).map(p => <text key={p.label} x={n.x} y={n.y - 8} textAnchor="middle" className="tree-pointer">{p.label}</text>)}</g>)}</svg><Notes notes={v.notes} /></div>
  }
  return <div className="visual stack-viz"><div className="stack-box">{(v.stack?.length ? v.stack : ['空']).map((s, i) => <div className={s === '空' ? 'stack-empty' : 'stack-item'} key={i}>{s}</div>)}</div><Notes notes={v.notes} /></div>
}

function Notes({ notes }: { notes?: string[] }) { return notes?.length ? <div className="notes">{notes.map(n => <span key={n}>{n}</span>)}</div> : null }
function Tags({ tags }: { tags: string[] }) { return <div className="tags">{tags.map(t => <span key={t}>{t}</span>)}</div> }

function VariableTimeline({ steps, activeIndex }: { steps: Step[]; activeIndex: number }) {
  const keys = Array.from(new Set(steps.flatMap(s => Object.keys(s.variables)))).slice(0, 8)
  return <div className="timeline"><h3>變數變化時間線</h3><div className="timeline-scroll"><table><thead><tr><th>Step</th>{keys.map(k => <th key={k}>{k}</th>)}</tr></thead><tbody>{steps.map((s, i) => <tr key={s.title} className={i === activeIndex ? 'active' : ''}><td>{i + 1}. {s.title}</td>{keys.map(k => <td key={k}>{s.variables[k] === undefined ? '—' : String(s.variables[k])}</td>)}</tr>)}</tbody></table></div></div>
}

function Solutions({ tutorial, open, language, onToggle, onLanguage }: { tutorial: Tutorial; open: boolean; language: SolutionLanguage; onToggle: () => void; onLanguage: (language: SolutionLanguage) => void }) {
  return <section className="solutions">
    <button className="solution-toggle" onClick={onToggle} aria-expanded={open}>
      <span>完整解答</span>
      <b>{open ? '收合' : '展開'}</b>
    </button>
    {open && <div className="solution-body">
      <div className="solution-tabs">{(['cpp', 'java', 'js'] as SolutionLanguage[]).map(item => <button key={item} className={language === item ? 'active' : ''} onClick={() => onLanguage(item)}>{solutionLabels[item]}</button>)}</div>
      <pre className="solution-code">{tutorial.solutions[language].map(line => <code key={line} className="line">{line}</code>)}</pre>
    </div>}
  </section>
}

function App() {
  const [tag, setTag] = useState('All')
  const [selectedId, setSelectedId] = useState(tutorials[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [showAllTags, setShowAllTags] = useState(false)
  const [query, setQuery] = useState('')
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [solutionLanguage, setSolutionLanguage] = useState<SolutionLanguage>('cpp')

  const allTags = useMemo(() => ['All', ...Array.from(new Set(tutorials.flatMap(t => t.tags))).sort()], [])
  const visibleTags = showAllTags ? allTags : primaryTags.filter(t => allTags.includes(t))
  const searched = useMemo(() => searchTutorials(tutorials, query), [query])
  const filtered = tag === 'All' ? searched : searched.filter(t => t.tags.includes(tag))
  const tutorial = tutorials.find(t => t.id === selectedId) ?? filtered[0] ?? tutorials[0]
  const step = tutorial.steps[stepIndex] ?? tutorial.steps[0]

  const choose = (id: string) => { setSelectedId(id); setStepIndex(0); setSolutionOpen(false) }
  const chooseTag = (nextTag: string) => {
    const nextFiltered = nextTag === 'All' ? searchTutorials(tutorials, query) : searchTutorials(tutorials, query).filter(t => t.tags.includes(nextTag))
    setTag(nextTag)
    setSelectedId(nextFiltered[0]?.id ?? tutorials[0].id)
    setStepIndex(0)
    setSolutionOpen(false)
  }
  const changeQuery = (nextQuery: string) => {
    const nextResults = searchTutorials(tutorials, nextQuery)
    const nextFiltered = tag === 'All' ? nextResults : nextResults.filter(t => t.tags.includes(tag))
    setQuery(nextQuery)
    setSelectedId(nextFiltered[0]?.id ?? tutorials[0].id)
    setStepIndex(0)
    setSolutionOpen(false)
  }

  return <main>
    <header className="nav"><div className="brand"><span className="logo">AL</span><span>Algo Lab</span></div><nav><a href="#tutorials">搜尋題目</a></nav></header>

    <section className="hero compact"><div className="hero-bg" /><p className="eyebrow">ALGO LAB</p><h1>先找題，再進 dry-run</h1><p className="lead">用題號、題名或分類進入教學；首頁只放能操作的入口。</p><div className="hero-actions"><a className="btn primary" href="#tutorials">搜尋題目</a></div></section>

    <section id="tutorials" className="layout"><aside className="sidebar"><div className="sidebar-head"><div><h2>題目索引</h2><p>可用 LeetCode 題號或題名 fuzzy search</p></div><button className="tag-toggle" onClick={() => setShowAllTags(!showAllTags)}>{showAllTags ? '收合標籤' : `更多標籤 (${allTags.length - primaryTags.length})`}</button></div><label className="search-box"><span>搜尋題目</span><input value={query} onChange={e => changeQuery(e.target.value)} placeholder="例：1、146、coin chnage、valid bst" /></label><div className="active-filter">目前：<b>{tag}</b> · {filtered.length} 題{query && <em> · 搜尋「{query}」</em>}</div><div className="filter">{visibleTags.map(t => <button key={t} onClick={() => chooseTag(t)} className={tag === t ? 'selected' : ''}>{t}</button>)}</div><div className="cards">{filtered.map(t => <button key={t.id} onClick={() => choose(t.id)} className={'problem-card ' + (t.id === tutorial.id ? 'active' : '')}><span>#{problemNumberFor(t.id) ?? '—'} · {t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div></aside>
      <article className="lesson"><div className="lesson-head"><div><p className="eyebrow">{tutorial.group} • {tutorial.difficulty}</p><h2>{tutorial.title}</h2><p>{tutorial.summary}</p></div><Tags tags={tutorial.tags} /></div>
        <div className="idea"><h3>思路講解</h3><ol>{tutorial.idea.map(i => <li key={i}>{i}</li>)}</ol><p className="complexity">{tutorial.complexity}</p></div>
        <div className="dryrun"><div className="step-panel"><div className="step-top"><span>Step {stepIndex + 1}/{tutorial.steps.length}</span><h3>{step.title}</h3><p>{step.explain}</p></div><Visualizer step={step} /><div className="controls"><button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>← 上一步</button><button onClick={() => setStepIndex(Math.min(tutorial.steps.length - 1, stepIndex + 1))} disabled={stepIndex === tutorial.steps.length - 1}>下一步 →</button></div></div>
          <div className="state-panel"><h3>當前變數</h3><div className="vars">{Object.entries(step.variables).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>)}</div><VariableTimeline steps={tutorial.steps} activeIndex={stepIndex} /><h3>目前步驟對應程式碼</h3><pre>{tutorial.code.map(line => <code key={line} className={line === step.codeLine ? 'line active' : 'line'}>{line}</code>)}</pre><Solutions tutorial={tutorial} open={solutionOpen} language={solutionLanguage} onToggle={() => setSolutionOpen(!solutionOpen)} onLanguage={setSolutionLanguage} /></div></div>
      </article></section>
  </main>
}
export default App
