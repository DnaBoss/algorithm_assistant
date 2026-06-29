import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { blogCategories, blogTags, publishedBlogPosts, searchBlogPosts, type BlogPost } from './blogData'
import { adminLogin, deleteAdminPost, fetchAdminPosts, fetchPublishedPosts, saveAdminPost, type BlogPostPayload } from './blogApi'
import { blocksToMarkdown, estimateReadMinutes, markdownToBlocks } from './blogEditor'
import { tutorials, type SolutionLanguage, type Step, type Tutorial } from './tutorialData'
import { problemNumberFor, searchTutorials } from './search'

const primaryTags = ['All', 'Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Matrix', 'Heap', 'Trie', 'Stack', 'Interval']
const solutionLabels: Record<SolutionLanguage, string> = { cpp: 'C++', java: 'Java', js: 'JS' }
type SiteSection = 'home' | 'games' | 'strategies' | 'quant' | 'learning' | 'exam' | 'algoLab' | 'onlineTool' | 'blog'

const siteSections: Array<{ id: SiteSection; label: string; eyebrow: string; title: string; summary: string; status: string }> = [
  { id: 'games', label: '遊戲', eyebrow: 'PLAY', title: '遊戲', summary: '互動遊戲與實驗作品。', status: '準備中' },
  { id: 'strategies', label: '交易策略', eyebrow: 'STRATEGY', title: '交易策略', summary: '策略研究與市場觀察。', status: '準備中' },
  { id: 'quant', label: '量化平台', eyebrow: 'QUANT', title: '量化平台', summary: '量化研究與平台入口。', status: '準備中' },
  { id: 'learning', label: '學習', eyebrow: 'LEARNING', title: '學習', summary: '學習記錄與知識整理。', status: '準備中' },
  { id: 'exam', label: '考研', eyebrow: 'EXAM', title: '考研', summary: '考研相關整理。', status: '準備中' },
  { id: 'algoLab', label: 'Algo Lab', eyebrow: 'ALGO LAB', title: 'Algo Lab', summary: '算法題目、思路講解與 dry-run。', status: '已開放' },
  { id: 'onlineTool', label: 'Online Tool', eyebrow: 'TOOLS', title: 'Online Tool', summary: '可在網站使用的小工具集合。', status: '準備中' },
  { id: 'blog', label: '個人 blog', eyebrow: 'BLOG', title: '個人 blog', summary: '文章與公開記錄。', status: '準備中' },
]

const onlineTools = [
  {
    id: 'easy-pg',
    label: 'DATABASE',
    title: 'Easy PG',
    status: '準備中',
    summary: 'PostgreSQL schema、查詢筆記和資料庫學習工具。',
    points: ['Schema browser', 'Query notes', 'PostgreSQL learning'],
  },
]

const quantPanels = [
  {
    label: 'Research',
    title: '研究',
    text: '整理量化研究、回測觀察與市場資料視圖。',
  },
  {
    label: 'Platform',
    title: '平台',
    text: '集中呈現交易系統與資料工具的公開入口。',
  },
  {
    label: 'Notes',
    title: '紀錄',
    text: '保留研究過程、假設條件與結果摘要。',
  },
  {
    label: 'Status',
    title: '準備中',
    text: '更多內容會在整理後公開。',
  },
]

function ProjectHub({ onSelect }: { onSelect: (section: SiteSection) => void }) {
  return <>
    <section className="hero compact hub-hero">
      <div className="hero-bg" />
      <p className="eyebrow">EXACTLYONE</p>
      <h1>ExactlyOne</h1>
      <p className="lead">凡人</p>
    </section>

    <section className="project-hub" aria-label="ExactlyOne sections">
      <div className="hub-head">
        <p className="eyebrow">SECTIONS</p>
        <h2>底下的專案區塊</h2>
      </div>
      <div className="project-grid">
        {siteSections.map(item => <button key={item.id} className="project-card" onClick={() => onSelect(item.id)}>
          <span>{item.eyebrow}</span>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <b>{item.status}</b>
        </button>)}
      </div>
    </section>
  </>
}

function ProjectPlaceholder({ section }: { section: Exclude<SiteSection, 'home' | 'quant' | 'algoLab' | 'blog' | 'onlineTool'> }) {
  const item = siteSections.find(entry => entry.id === section)!
  const nextBySection: Record<typeof section, string[]> = {
    games: ['內容準備中。', '公開後會出現在這裡。', '感謝等待。'],
    strategies: ['內容準備中。', '公開後會出現在這裡。', '感謝等待。'],
    learning: ['內容準備中。', '公開後會出現在這裡。', '感謝等待。'],
    exam: ['內容準備中。', '公開後會出現在這裡。', '感謝等待。'],
  }

  return <section className="project-page">
    <p className="eyebrow">{item.eyebrow}</p>
    <h1>{item.title}</h1>
    <p>{item.summary}</p>
    <div className="project-next">
      {nextBySection[section].map(next => <article key={next}><span>next</span><b>{next}</b></article>)}
    </div>
  </section>
}

function OnlineToolSection() {
  return <section className="tools-shell">
    <div className="tools-head">
      <p className="eyebrow">ONLINE TOOL</p>
      <h1>Online Tool</h1>
      <p>可直接使用的小工具集合。</p>
    </div>

    <div className="tools-grid">
      {onlineTools.map(tool => <article key={tool.id} className="tool-card">
        <span>{tool.label}</span>
        <div className="tool-title-row">
          <h2>{tool.title}</h2>
          <b>{tool.status}</b>
        </div>
        <p>{tool.summary}</p>
        <div className="tool-points">
          {tool.points.map(point => <em key={point}>{point}</em>)}
        </div>
      </article>)}
    </div>

    <div className="easy-pg-plan">
      <section>
        <h3>Easy PG</h3>
        <ol>
          <li>Schema browsing</li>
          <li>Query notes</li>
          <li>PostgreSQL learning</li>
        </ol>
      </section>
      <section>
        <h3>狀態</h3>
        <ol>
          <li>工具準備中</li>
          <li>公開後會出現在這裡</li>
        </ol>
      </section>
    </div>
  </section>
}

function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(publishedBlogPosts)
  const [selectedPostId, setSelectedPostId] = useState(publishedBlogPosts[0]?.id ?? '')
  const [activeTag, setActiveTag] = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')
  const [blogQuery, setBlogQuery] = useState('')
  const [loadingPosts, setLoadingPosts] = useState(true)
  const categories = ['All', ...blogCategories(posts)]
  const tags = ['All', ...blogTags(posts)]
  const visiblePosts = useMemo(() => {
    const categoryPosts = activeCategory === 'All'
      ? posts
      : posts.filter(post => post.category === activeCategory)
    const tagPosts = activeTag === 'All' ? categoryPosts : categoryPosts.filter(post => post.tags.includes(activeTag))
    return searchBlogPosts(tagPosts, blogQuery)
  }, [activeCategory, activeTag, blogQuery, posts])
  const selectedPost = visiblePosts.find(post => post.id === selectedPostId) ?? visiblePosts[0]
  const hasPublishedPosts = posts.length > 0
  const isFiltered = activeTag !== 'All' || activeCategory !== 'All' || blogQuery.trim().length > 0

  useEffect(() => {
    let alive = true
    fetchPublishedPosts().then(nextPosts => {
      if (!alive) return
      setPosts(nextPosts)
      setSelectedPostId(nextPosts[0]?.id ?? '')
      setLoadingPosts(false)
    })
    return () => { alive = false }
  }, [])

  const chooseTag = (tag: string) => {
    setActiveTag(tag)
    setSelectedPostId('')
  }

  const chooseCategory = (category: string) => {
    setActiveCategory(category)
    setSelectedPostId('')
  }

  return <section className="blog-shell">
    <div className="blog-index">
      <p className="eyebrow">PERSONAL BLOG</p>
      <h1>個人 blog</h1>
      <p>公開文章會出現在這裡。</p>
      <div className="blog-stats" aria-label="blog stats">
        <div><b>{posts.length}</b><span>已公開</span></div>
        <div><b>{blogCategories(posts).length}</b><span>分類</span></div>
        <div><b>{blogTags(posts).length}</b><span>標籤</span></div>
      </div>
      {hasPublishedPosts && <label className="blog-search">
        <span>搜尋文章</span>
        <input value={blogQuery} onChange={event => { setBlogQuery(event.target.value); setSelectedPostId('') }} placeholder="輸入標題、標籤或內文" />
      </label>}
      {hasPublishedPosts && <div className="blog-filter-group">
        <span>分類</span>
        <div className="blog-filters">
          {categories.map(category => <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => chooseCategory(category)}>{category}</button>)}
        </div>
      </div>}
      {hasPublishedPosts && <div className="blog-filter-group">
        <span>標籤</span>
        <div className="blog-filters">
        {tags.map(tag => <button key={tag} className={activeTag === tag ? 'active' : ''} onClick={() => chooseTag(tag)}>{tag}</button>)}
        </div>
      </div>}
      {loadingPosts ? <div className="blog-empty"><b>讀取中</b><span>正在取得公開文章。</span></div> : visiblePosts.length > 0 ? <div className="blog-list">
        {visiblePosts.map(post => <button key={post.id} className={selectedPost.id === post.id ? 'active' : ''} onClick={() => setSelectedPostId(post.id)}>
          <span>{post.category} · {post.date} · {post.readMinutes} min</span>
          <b>{post.title}</b>
          <small>{post.excerpt}</small>
        </button>)}
      </div> : <BlogEmptyState filtered={isFiltered} />}
    </div>
    {selectedPost ? <article className="blog-post">
      <div className="blog-meta"><span>{selectedPost.category}</span><span>{selectedPost.date}</span><span>{selectedPost.readMinutes} min read</span><span>Updated {selectedPost.updatedAt}</span></div>
      <h2>{selectedPost.title}</h2>
      <p className="blog-excerpt">{selectedPost.excerpt}</p>
      <div className="blog-tags">{selectedPost.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <BlogToc post={selectedPost} />
      <BlogBody post={selectedPost} />
    </article> : <article className="blog-post empty-post"><p className="eyebrow">NO POSTS</p><h2>{isFiltered ? '沒有符合條件的文章' : '尚未公開文章'}</h2><p className="blog-excerpt">{isFiltered ? '調整搜尋、分類或標籤後再看看。' : '這裡只會顯示已確認可以公開的內容。'}</p></article>}
  </section>
}

const emptyEditorPost: BlogPostPayload = {
  status: 'draft',
  title: '',
  excerpt: '',
  category: 'General',
  tags: [],
  readMinutes: 3,
  body: [{ kind: 'paragraph', text: '' }],
}

function AdminBlogSection() {
  const [token, setToken] = useState(() => localStorage.getItem('exactlyone_admin_token') ?? '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editingId, setEditingId] = useState<string | undefined>()
  const [draft, setDraft] = useState<BlogPostPayload>(emptyEditorPost)
  const [markdown, setMarkdown] = useState(blocksToMarkdown(emptyEditorPost.body))
  const [message, setMessage] = useState('')
  const previewPost: BlogPost = {
    id: editingId ?? 'preview',
    slug: draft.slug ?? 'preview',
    status: draft.status,
    title: draft.title || 'Untitled',
    excerpt: draft.excerpt,
    category: draft.category || 'General',
    tags: draft.tags,
    date: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    readMinutes: draft.readMinutes,
    body: markdownToBlocks(markdown),
  }

  const loadPosts = async (nextToken = token) => {
    if (!nextToken) return
    const nextPosts = await fetchAdminPosts(nextToken)
    setPosts(nextPosts)
  }

  useEffect(() => {
    if (!token) return undefined
    const timer = window.setTimeout(() => {
      loadPosts().catch(() => undefined)
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = async () => {
    setMessage('')
    const nextToken = await adminLogin(email, password)
    localStorage.setItem('exactlyone_admin_token', nextToken)
    setToken(nextToken)
    await loadPosts(nextToken)
  }

  const editPost = (post: BlogPost) => {
    setEditingId(post.id)
    const nextDraft: BlogPostPayload = {
      slug: post.slug,
      status: post.status,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      readMinutes: post.readMinutes,
      body: post.body,
    }
    setDraft(nextDraft)
    setMarkdown(blocksToMarkdown(post.body))
  }

  const savePost = async () => {
    setMessage('')
    const parsedBody = markdownToBlocks(markdown)
    const saved = await saveAdminPost(token, { ...draft, body: parsedBody }, editingId)
    setMessage(saved.status === 'published' ? '已發布' : '已儲存草稿')
    setEditingId(saved.id)
    await loadPosts()
  }

  const startNewPost = () => {
    setEditingId(undefined)
    setDraft(emptyEditorPost)
    setMarkdown(blocksToMarkdown(emptyEditorPost.body))
    setMessage('')
  }

  const deletePost = async () => {
    if (!editingId) return
    setMessage('')
    await deleteAdminPost(token, editingId)
    setMessage('已刪除')
    startNewPost()
    await loadPosts()
  }

  const updateMarkdown = (value: string) => {
    setMarkdown(value)
    setDraft({ ...draft, readMinutes: estimateReadMinutes(value) })
  }

  if (!token) return <section className="admin-shell">
    <div className="admin-panel">
      <p className="eyebrow">ADMIN</p>
      <h1>Blog Admin</h1>
      <label><span>Email</span><input value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label><span>Password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      <button className="primary" onClick={() => login().catch(() => setMessage('登入失敗'))}>登入</button>
      {message && <p className="admin-message">{message}</p>}
    </div>
  </section>

  return <section className="admin-shell">
    <aside className="admin-panel admin-list">
      <div className="admin-head-row"><div><p className="eyebrow">ADMIN</p><h1>Blog Admin</h1></div><button className="secondary" onClick={startNewPost}>新增</button></div>
      {posts.map(post => <button key={post.id} className={editingId === post.id ? 'active' : ''} onClick={() => editPost(post)}>
        <span>{post.status}</span>
        <b>{post.title || 'Untitled'}</b>
        <small>{post.updatedAt}</small>
      </button>)}
    </aside>
    <article className="admin-editor">
      <label><span>Title</span><input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label><span>Slug</span><input value={draft.slug ?? ''} onChange={event => setDraft({ ...draft, slug: event.target.value })} /></label>
      <label><span>Excerpt</span><textarea value={draft.excerpt} onChange={event => setDraft({ ...draft, excerpt: event.target.value })} /></label>
      <div className="admin-grid">
        <label><span>Category</span><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} /></label>
        <label><span>Tags</span><input value={draft.tags.join(', ')} onChange={event => setDraft({ ...draft, tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })} /></label>
        <label><span>Read minutes</span><input type="number" min="1" value={draft.readMinutes} onChange={event => setDraft({ ...draft, readMinutes: Number(event.target.value) })} /></label>
        <label><span>Status</span><select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as BlogPostPayload['status'] })}><option value="draft">draft</option><option value="published">published</option></select></label>
      </div>
      <label><span>Markdown</span><textarea className="body-markdown" value={markdown} onChange={event => updateMarkdown(event.target.value)} placeholder={'## 小標題\n\n寫下段落。\n\n- 條列\n\n> 引用\n\n```rust\nfn main() {}\n```'} /></label>
      <section className="admin-preview" aria-label="article preview">
        <span>Preview</span>
        <h2>{previewPost.title}</h2>
        {previewPost.excerpt && <p className="blog-excerpt">{previewPost.excerpt}</p>}
        <BlogBody post={previewPost} />
      </section>
      <div className="admin-actions"><button className="primary" onClick={() => savePost().catch(error => setMessage(error instanceof Error ? error.message : '儲存失敗'))}>儲存</button>{editingId && <button className="danger" onClick={() => deletePost().catch(error => setMessage(error instanceof Error ? error.message : '刪除失敗'))}>刪除</button>}<button className="secondary" onClick={() => { localStorage.removeItem('exactlyone_admin_token'); setToken('') }}>登出</button></div>
      {message && <p className="admin-message">{message}</p>}
    </article>
  </section>
}

function BlogEmptyState({ filtered }: { filtered: boolean }) {
  return <div className="blog-empty">
    <b>{filtered ? '沒有符合條件的文章' : '尚未公開文章'}</b>
    <span>{filtered ? '調整搜尋、分類或標籤後再看看。' : '文章整理好後會顯示在這裡。'}</span>
  </div>
}

function BlogToc({ post }: { post: BlogPost }) {
  const headings = post.body
    .map((block, index) => block.kind === 'heading' ? { id: `blog-section-${index}`, text: block.text } : null)
    .filter((item): item is { id: string; text: string } => item !== null)

  if (headings.length === 0) return null

  return <nav className="blog-toc" aria-label="文章目錄">
    <span>本文目錄</span>
    {headings.map(heading => <a key={heading.id} href={`#${heading.id}`}>{heading.text}</a>)}
  </nav>
}

function BlogBody({ post }: { post: BlogPost }) {
  return <div className="blog-body">
    {post.body.map((block, index) => {
      if (block.kind === 'heading') return <h3 id={`blog-section-${index}`} key={index}>{block.text}</h3>
      if (block.kind === 'list') return <ul key={index}>{block.items.map(item => <li key={item}>{item}</li>)}</ul>
      if (block.kind === 'code') return <pre key={index}><code>{block.code}</code></pre>
      if (block.kind === 'quote') return <blockquote key={index}>{block.text}</blockquote>
      return <p key={index}>{block.text}</p>
    })}
  </div>
}

function QuantPlatformSection() {
  return <>
    <section className="hero compact quant-hero">
      <p className="eyebrow">QUANT</p>
      <h1>量化平台</h1>
      <p className="lead">量化研究與平台入口。</p>
      <div className="quant-status" aria-label="Quant platform status">
        <div><span>research</span><b>market data</b></div>
        <div><span>platform</span><b>quant tools</b></div>
        <div><span>status</span><b>preparing</b></div>
      </div>
    </section>

    <section className="quant-shell">
      <div className="quant-head">
        <div>
          <p className="eyebrow">QUANT PLATFORM</p>
          <h2>量化研究與工具入口</h2>
        </div>
        <p>公開內容整理後會逐步放到這裡。</p>
      </div>

      <div className="quant-grid">
        {quantPanels.map(panel => <article key={panel.label} className="quant-panel">
          <span>{panel.label}</span>
          <h3>{panel.title}</h3>
          <p>{panel.text}</p>
        </article>)}
      </div>

      <div className="quant-runtime">
        <section>
          <h3>內容</h3>
          <ol>
            <li>研究摘要</li>
            <li>工具入口</li>
            <li>公開紀錄</li>
          </ol>
        </section>
        <section>
          <h3>狀態</h3>
          <ol>
            <li>準備中</li>
            <li>公開後會出現在這裡</li>
          </ol>
        </section>
      </div>
    </section>
  </>
}

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
  const isAdminPage = window.location.pathname.startsWith('/admin')
  const [section, setSection] = useState<SiteSection>('home')
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

  const renderSection = () => {
    if (section === 'home') return <ProjectHub onSelect={setSection} />
    if (section === 'quant') return <QuantPlatformSection />
    if (section === 'blog') return <BlogSection />
    if (section === 'onlineTool') return <OnlineToolSection />
    if (section !== 'algoLab') return <ProjectPlaceholder section={section} />
    return <>
      <section className="hero compact"><div className="hero-bg" /><p className="eyebrow">ALGO LAB</p><h1>先找題，再進 dry-run</h1><p className="lead">用題號、題名或分類進入教學；首頁只放能操作的入口。</p><div className="hero-actions"><a className="btn primary" href="#tutorials">搜尋題目</a></div></section>

      <section id="tutorials" className="layout"><aside className="sidebar"><div className="sidebar-head"><div><h2>題目索引</h2><p>可用 LeetCode 題號或題名 fuzzy search</p></div><button className="tag-toggle" onClick={() => setShowAllTags(!showAllTags)}>{showAllTags ? '收合標籤' : `更多標籤 (${allTags.length - primaryTags.length})`}</button></div><label className="search-box"><span>搜尋題目</span><input value={query} onChange={e => changeQuery(e.target.value)} placeholder="例：1、146、coin chnage、valid bst" /></label><div className="active-filter">目前：<b>{tag}</b> · {filtered.length} 題{query && <em> · 搜尋「{query}」</em>}</div><div className="filter">{visibleTags.map(t => <button key={t} onClick={() => chooseTag(t)} className={tag === t ? 'selected' : ''}>{t}</button>)}</div><div className="cards">{filtered.map(t => <button key={t.id} onClick={() => choose(t.id)} className={'problem-card ' + (t.id === tutorial.id ? 'active' : '')}><span>#{problemNumberFor(t.id) ?? '—'} · {t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div></aside>
      <article className="lesson"><div className="lesson-head"><div><p className="eyebrow">{tutorial.group} • {tutorial.difficulty}</p><h2>{tutorial.title}</h2><p>{tutorial.summary}</p></div><Tags tags={tutorial.tags} /></div>
        <div className="idea"><h3>思路講解</h3><ol>{tutorial.idea.map(i => <li key={i}>{i}</li>)}</ol><p className="complexity">{tutorial.complexity}</p></div>
        <div className="dryrun"><div className="step-panel"><div className="step-top"><span>Step {stepIndex + 1}/{tutorial.steps.length}</span><h3>{step.title}</h3><p>{step.explain}</p></div><Visualizer step={step} /><div className="controls"><button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>← 上一步</button><button onClick={() => setStepIndex(Math.min(tutorial.steps.length - 1, stepIndex + 1))} disabled={stepIndex === tutorial.steps.length - 1}>下一步 →</button></div></div>
          <div className="state-panel"><h3>當前變數</h3><div className="vars">{Object.entries(step.variables).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>)}</div><VariableTimeline steps={tutorial.steps} activeIndex={stepIndex} /><h3>目前步驟對應程式碼</h3><pre>{tutorial.code.map(line => <code key={line} className={line === step.codeLine ? 'line active' : 'line'}>{line}</code>)}</pre><Solutions tutorial={tutorial} open={solutionOpen} language={solutionLanguage} onToggle={() => setSolutionOpen(!solutionOpen)} onLanguage={setSolutionLanguage} /></div></div>
      </article></section>
    </>
  }

  if (isAdminPage) return <main><AdminBlogSection /></main>

  return <main>
    <header className="nav"><button className="brand brand-button" onClick={() => setSection('home')}><span className="logo">EO</span><span>ExactlyOne</span></button><nav><button className={section === 'home' ? 'active' : ''} onClick={() => setSection('home')}>首頁</button>{siteSections.map(item => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>{item.label}</button>)}</nav></header>

    {renderSection()}
  </main>
}
export default App
