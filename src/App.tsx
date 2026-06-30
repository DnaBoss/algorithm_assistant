import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import './App.css'
import { blogCategories, blogTags, publishedBlogPosts, searchBlogPosts, type BlogPost } from './blogData'
import {
  adminLogin,
  changeAdminPassword,
  createAlgoComment,
  createAlgoReaction,
  createBlogComment,
  createBlogReaction,
  deleteAdminAlgoNote,
  deleteAdminPost,
  disableAdminTotp,
  enableAdminTotp,
  fetchAlgoProblemNote,
  fetchAdminAlgoNotes,
  fetchBlogInteractions,
  fetchAdminPosts,
  fetchAdminSecurity,
  fetchPublishedPosts,
  saveAdminAlgoNote,
  saveAdminPost,
  setupAdminTotp,
  type AlgoNotePayload,
  type AlgoProblemNote,
  type AdminSecurity,
  type BlogInteractions,
  type BlogPostPayload,
  type BlogReactionType,
  type TotpSetup,
} from './blogApi'
import { blocksToMarkdown, estimateReadMinutes, markdownToBlocks } from './blogEditor'
import { easyDbCapabilities, easyDbExampleSchema, easyDbWorkflow, filterEasyDbTables } from './easyDbData'
import { heliosMetrics, heliosPipeline, heliosQualityRules, heliosResearchLanes } from './heliosData'
import { areaCompletionCount, corePlatformAreas, releaseRhythm, type PlatformAreaId } from './platformProgressData'
import { tutorials, type SolutionLanguage, type Step, type Tutorial } from './tutorialData'
import { problemNumberFor, searchTutorials } from './search'

const primaryTags = ['All', 'Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Matrix', 'Heap', 'Trie', 'Stack', 'Interval']
const solutionLabels: Record<SolutionLanguage, string> = { cpp: 'C++', java: 'Java', js: 'JS' }
const reactionLabels: Record<BlogReactionType, string> = {
  like: '喜歡',
  useful: '有用',
  inspired: '有啟發',
  thoughtful: '值得想',
}
const reactionTypes = Object.keys(reactionLabels) as BlogReactionType[]
const emptyInteractions: BlogInteractions = {
  comments: [],
  reactions: reactionTypes.map(reactionType => ({ reactionType, count: 0, reacted: false })),
}
type SiteSection = 'home' | 'games' | 'strategies' | 'helios' | 'learning' | 'exam' | 'algoLab' | 'easyDb' | 'blog'

const siteSections: Array<{ id: SiteSection; label: string; eyebrow: string; title: string; summary: string; status: string }> = [
  { id: 'games', label: '遊戲', eyebrow: 'PLAY', title: '遊戲', summary: '互動遊戲與實驗作品。', status: '準備中' },
  { id: 'strategies', label: '交易策略', eyebrow: 'STRATEGY', title: '交易策略', summary: '策略研究與市場觀察。', status: '準備中' },
  { id: 'helios', label: 'Helios', eyebrow: 'HELIOS', title: 'Helios', summary: '量化研究、市場資料與平台狀態。', status: '規劃中' },
  { id: 'learning', label: '學習', eyebrow: 'LEARNING', title: '學習', summary: '學習記錄與知識整理。', status: '準備中' },
  { id: 'exam', label: '考研', eyebrow: 'EXAM', title: '考研', summary: '考研相關整理。', status: '準備中' },
  { id: 'algoLab', label: 'Algo Lab', eyebrow: 'ALGO LAB', title: 'Algo Lab', summary: '算法題目、思路講解與 dry-run。', status: '已開放' },
  { id: 'easyDb', label: 'Easy DB', eyebrow: 'DATABASE', title: 'Easy DB', summary: 'PostgreSQL schema、查詢筆記與資料庫學習工具。', status: '規劃中' },
  { id: 'blog', label: '個人 blog', eyebrow: 'BLOG', title: '個人 blog', summary: '文章與公開記錄。', status: '準備中' },
]

function blogAnonymousKey() {
  const storageKey = 'exactlyone_blog_visitor'
  const existing = localStorage.getItem(storageKey)
  if (existing) return existing
  const next = globalThis.crypto?.randomUUID?.() ?? `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`
  localStorage.setItem(storageKey, next)
  return next
}

function ProjectHub({ onSelect }: { onSelect: (section: SiteSection) => void }) {
  const directorySections = siteSections.filter(item => item.id !== 'blog')
  const openArea = (id: PlatformAreaId) => onSelect(id)

  return <>
    <section className="hero compact hub-hero">
      <div className="hero-bg" />
      <p className="eyebrow">EXACTLYONE BLOG</p>
      <h1>個人 blog</h1>
      <p className="lead">Per aspera ad astra.</p>
      <div className="hero-actions">
        <button className="btn primary" onClick={() => onSelect('blog')}>閱讀 blog</button>
        <button className="btn secondary" onClick={() => onSelect('algoLab')}>進入 Algo Lab</button>
      </div>
    </section>

    <BlogSection />

    <section className="platform-progress" aria-label="ExactlyOne platform progress">
      <div className="progress-head">
        <div>
          <p className="eyebrow">PLATFORM</p>
          <h2>整合進度</h2>
        </div>
        <div className="release-card">
          <span>{releaseRhythm.title}</span>
          <b>{releaseRhythm.status}</b>
          <p>{releaseRhythm.summary}</p>
        </div>
      </div>
      <div className="progress-metrics">
        <div><b>{corePlatformAreas.length}</b><span>core areas</span></div>
        <div><b>{areaCompletionCount()}</b><span>completed slices</span></div>
        <div><b>1</b><span>public domain</span></div>
      </div>
      <div className="progress-grid">
        {corePlatformAreas.map(area => <article key={area.id} className="progress-card">
          <div className="progress-card-head">
            <span>{area.eyebrow}</span>
            <b>{area.status}</b>
          </div>
          <h3>{area.title}</h3>
          <p>{area.publicSurface}</p>
          <div className="progress-done">
            {area.completed.map(item => <em key={item}>{item}</em>)}
          </div>
          <div className="progress-next"><span>next</span><strong>{area.next}</strong></div>
          <button onClick={() => openArea(area.id)}>開啟</button>
        </article>)}
      </div>
    </section>

    <section className="project-hub" aria-label="ExactlyOne sections">
      <div className="hub-head">
        <p className="eyebrow">SECTIONS</p>
        <h2>其他主要區塊</h2>
      </div>
      <div className="project-grid">
        {directorySections.map(item => <button key={item.id} className="project-card" onClick={() => onSelect(item.id)}>
          <span>{item.eyebrow}</span>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          <b>{item.status}</b>
        </button>)}
      </div>
    </section>
  </>
}

function ProjectPlaceholder({ section }: { section: Exclude<SiteSection, 'home' | 'helios' | 'algoLab' | 'blog' | 'easyDb'> }) {
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

function EasyDbSection() {
  const [schemaQuery, setSchemaQuery] = useState('')
  const [selectedTableName, setSelectedTableName] = useState(easyDbExampleSchema[0].name)
  const visibleTables = filterEasyDbTables(easyDbExampleSchema, schemaQuery)
  const selectedTable = visibleTables.find(table => table.name === selectedTableName) ?? visibleTables[0] ?? easyDbExampleSchema[0]
  const relationCount = easyDbExampleSchema.flatMap(table => table.columns).filter(column => column.foreign).length

  const selectTable = (name: string) => {
    setSelectedTableName(name)
  }

  return <section className="tools-shell">
    <div className="tools-head">
      <p className="eyebrow">EASY DB</p>
      <h1>Easy DB</h1>
      <p>PostgreSQL schema browser、欄位搜尋與查詢筆記整理。公開頁只放安全範例與流程；真實 connection profiles、SSH tunnel、SQL import/export 和資料查詢留在登入後。</p>
    </div>

    <div className="tool-metrics" aria-label="Easy DB metrics">
      <div><b>{easyDbExampleSchema.length}</b><span>example tables</span></div>
      <div><b>{easyDbExampleSchema.reduce((sum, table) => sum + table.columns.length, 0)}</b><span>columns</span></div>
      <div><b>{relationCount}</b><span>relations</span></div>
    </div>

    <div className="tools-grid capability-grid">
      {easyDbCapabilities.map(tool => <article key={tool.title} className="tool-card">
        <span>{tool.label}</span>
        <div className="tool-title-row">
          <h2>{tool.title}</h2>
        </div>
        <p>{tool.summary}</p>
      </article>)}
    </div>

    <div className="schema-browser">
      <aside>
        <div className="schema-browser-head">
          <span>SCHEMA</span>
          <b>public example</b>
        </div>
        <label className="schema-search">
          <span>搜尋 table / column</span>
          <input value={schemaQuery} onChange={event => { setSchemaQuery(event.target.value); setSelectedTableName('') }} placeholder="例：owner_id、users、jsonb" />
        </label>
        <div className="schema-table-list">
          {visibleTables.map(table => <button key={table.name} className={selectedTable.name === table.name ? 'active' : ''} onClick={() => selectTable(table.name)}>
            <span>{table.schema}</span>
            <b>{table.name}</b>
            <small>{table.columns.length} columns</small>
          </button>)}
        </div>
        {visibleTables.length === 0 && <p className="schema-empty">沒有符合條件的 table。</p>}
      </aside>
      <article>
        <div className="schema-selected-head">
          <div>
            <span>{selectedTable.schema}</span>
            <h2>{selectedTable.name}</h2>
          </div>
          <p>{selectedTable.purpose}</p>
        </div>
        <div className="column-table">
          <div className="column-row header"><span>Column</span><span>Type</span><span>Key</span><span>Note</span></div>
          {selectedTable.columns.map(column => <div className="column-row" key={column.name}>
            <span><b>{column.name}</b>{!column.nullable && <em>not null</em>}</span>
            <span>{column.type}</span>
            <span>{column.primary ? 'PK' : column.foreign ? `FK -> ${column.foreign.table}.${column.foreign.column}` : '-'}</span>
            <span>{column.note}</span>
          </div>)}
        </div>
      </article>
    </div>

    <div className="easy-pg-plan easy-db-workflow">
      <section>
        <h3>Workflow</h3>
        <ol>
          {easyDbWorkflow.map(item => <li key={item}>{item}</li>)}
        </ol>
      </section>
      <section>
        <h3>Boundary</h3>
        <ol>
          <li>公開頁不保存、不顯示真實 host、帳號、密碼或資料列。</li>
          <li>Schema export 可以轉成文章或查詢筆記。</li>
          <li>真實 DB 操作只放在 owner admin 內。</li>
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
  const [anonymousKey] = useState(blogAnonymousKey)
  const [interactions, setInteractions] = useState<BlogInteractions>(emptyInteractions)
  const [commentName, setCommentName] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [submittingReaction, setSubmittingReaction] = useState<BlogReactionType | null>(null)
  const [interactionMessage, setInteractionMessage] = useState('')
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
  const selectedPostSlug = selectedPost?.slug ?? ''
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

  useEffect(() => {
    if (!selectedPostSlug) {
      return
    }
    let alive = true
    fetchBlogInteractions(selectedPostSlug, anonymousKey)
      .then(nextInteractions => {
        if (alive) setInteractions(nextInteractions)
      })
      .catch(() => {
        if (alive) setInteractions(emptyInteractions)
      })
    return () => { alive = false }
  }, [anonymousKey, selectedPostSlug])

  const chooseTag = (tag: string) => {
    setActiveTag(tag)
    setSelectedPostId('')
  }

  const chooseCategory = (category: string) => {
    setActiveCategory(category)
    setSelectedPostId('')
  }

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedPostSlug || !commentBody.trim()) return
    setSubmittingComment(true)
    setInteractionMessage('')
    try {
      await createBlogComment(selectedPostSlug, commentName, commentBody)
      const nextInteractions = await fetchBlogInteractions(selectedPostSlug, anonymousKey)
      setInteractions(nextInteractions)
      setCommentBody('')
      setInteractionMessage('留言已送出')
    } catch {
      setInteractionMessage('留言送出失敗，請稍後再試')
    } finally {
      setSubmittingComment(false)
    }
  }

  const chooseReaction = async (reactionType: BlogReactionType) => {
    if (!selectedPostSlug || submittingReaction) return
    setSubmittingReaction(reactionType)
    setInteractionMessage('')
    try {
      const nextInteractions = await createBlogReaction(selectedPostSlug, reactionType, anonymousKey)
      setInteractions(nextInteractions)
    } catch {
      setInteractionMessage('反應送出失敗，請稍後再試')
    } finally {
      setSubmittingReaction(null)
    }
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
      <BlogInteractionsPanel
        interactions={interactions}
        commentName={commentName}
        commentBody={commentBody}
        message={interactionMessage}
        submittingComment={submittingComment}
        submittingReaction={submittingReaction}
        onCommentNameChange={setCommentName}
        onCommentBodyChange={setCommentBody}
        onSubmitComment={submitComment}
        onReact={chooseReaction}
      />
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

const emptyAlgoNote: AlgoNotePayload = {
  status: 'draft',
  title: '',
  body: [{ kind: 'paragraph', text: '' }],
}

type AdminView = 'blog' | 'algo'

function AdminBlogSection() {
  const [token, setToken] = useState(() => localStorage.getItem('exactlyone_admin_token') ?? '')
  const [adminView, setAdminView] = useState<AdminView>('blog')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [algoNotes, setAlgoNotes] = useState<AlgoProblemNote[]>([])
  const [editingId, setEditingId] = useState<string | undefined>()
  const [draft, setDraft] = useState<BlogPostPayload>(emptyEditorPost)
  const [markdown, setMarkdown] = useState(blocksToMarkdown(emptyEditorPost.body))
  const [selectedAlgoProblemId, setSelectedAlgoProblemId] = useState(tutorials[0]?.id ?? '')
  const [algoDraft, setAlgoDraft] = useState<AlgoNotePayload>(emptyAlgoNote)
  const [algoMarkdown, setAlgoMarkdown] = useState(blocksToMarkdown(emptyAlgoNote.body))
  const [message, setMessage] = useState('')
  const [security, setSecurity] = useState<AdminSecurity | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [totpSetup, setTotpSetup] = useState<TotpSetup | null>(null)
  const [totpVerifyCode, setTotpVerifyCode] = useState('')
  const [totpDisablePassword, setTotpDisablePassword] = useState('')
  const [totpDisableCode, setTotpDisableCode] = useState('')
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
  const selectedAlgoTutorial = tutorials.find(tutorial => tutorial.id === selectedAlgoProblemId) ?? tutorials[0]
  const selectedAlgoNote = algoNotes.find(note => note.problemId === selectedAlgoProblemId)
  const previewAlgoNote: AlgoProblemNote = {
    id: selectedAlgoNote?.id ?? 'preview',
    problemId: selectedAlgoProblemId,
    status: algoDraft.status,
    title: algoDraft.title || selectedAlgoTutorial?.title || 'Untitled',
    updatedAt: selectedAlgoNote?.updatedAt ?? new Date().toISOString().slice(0, 10),
    body: markdownToBlocks(algoMarkdown),
  }

  const loadPosts = async (nextToken = token) => {
    if (!nextToken) return
    const nextPosts = await fetchAdminPosts(nextToken)
    setPosts(nextPosts)
  }

  const loadAlgoNotes = async (nextToken = token) => {
    if (!nextToken) return
    const nextNotes = await fetchAdminAlgoNotes(nextToken)
    setAlgoNotes(nextNotes)
  }

  const loadSecurity = async (nextToken = token) => {
    if (!nextToken) return
    setSecurity(await fetchAdminSecurity(nextToken))
  }

  useEffect(() => {
    if (!token) return undefined
    const timer = window.setTimeout(() => {
      loadPosts().catch(() => undefined)
      loadAlgoNotes().catch(() => undefined)
      loadSecurity().catch(() => undefined)
    }, 0)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = async () => {
    setMessage('')
    const nextToken = await adminLogin(email, password, totpCode)
    localStorage.setItem('exactlyone_admin_token', nextToken)
    setToken(nextToken)
    await loadPosts(nextToken)
    await loadAlgoNotes(nextToken)
    await loadSecurity(nextToken)
  }

  const changePassword = async () => {
    setMessage('')
    await changeAdminPassword(token, currentPassword, newPassword)
    setCurrentPassword('')
    setNewPassword('')
    await loadSecurity()
    setMessage('密碼已更新')
  }

  const startTotpSetup = async () => {
    setMessage('')
    const setup = await setupAdminTotp(token)
    setTotpSetup(setup)
    setTotpVerifyCode('')
    await loadSecurity()
  }

  const enableTotp = async () => {
    setMessage('')
    await enableAdminTotp(token, totpVerifyCode)
    setTotpSetup(null)
    setTotpVerifyCode('')
    await loadSecurity()
    setMessage('TOTP 已啟用')
  }

  const disableTotp = async () => {
    setMessage('')
    await disableAdminTotp(token, totpDisablePassword, totpDisableCode)
    setTotpDisablePassword('')
    setTotpDisableCode('')
    setTotpSetup(null)
    await loadSecurity()
    setMessage('TOTP 已停用')
  }

  const editPost = (post: BlogPost) => {
    setAdminView('blog')
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
    setAdminView('blog')
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

  const editAlgoNote = (problemId: string) => {
    setAdminView('algo')
    const note = algoNotes.find(item => item.problemId === problemId)
    const tutorial = tutorials.find(item => item.id === problemId)
    setSelectedAlgoProblemId(problemId)
    if (note) {
      setAlgoDraft({ status: note.status, title: note.title, body: note.body })
      setAlgoMarkdown(blocksToMarkdown(note.body))
    } else {
      const nextDraft = {
        ...emptyAlgoNote,
        title: tutorial ? `${tutorial.title} 筆記` : '',
      }
      setAlgoDraft(nextDraft)
      setAlgoMarkdown(blocksToMarkdown(nextDraft.body))
    }
    setMessage('')
  }

  const updateAlgoMarkdown = (value: string) => {
    setAlgoMarkdown(value)
    setAlgoDraft({ ...algoDraft, body: markdownToBlocks(value) })
  }

  const saveAlgoNote = async () => {
    setMessage('')
    const parsedBody = markdownToBlocks(algoMarkdown)
    const saved = await saveAdminAlgoNote(token, selectedAlgoProblemId, { ...algoDraft, body: parsedBody })
    await loadAlgoNotes()
    setMessage(saved?.status === 'published' ? 'Algo 筆記已發布' : 'Algo 筆記已儲存草稿')
  }

  const deleteAlgoNote = async () => {
    if (!selectedAlgoNote) return
    setMessage('')
    await deleteAdminAlgoNote(token, selectedAlgoProblemId)
    await loadAlgoNotes()
    const tutorial = tutorials.find(item => item.id === selectedAlgoProblemId)
    const nextDraft = {
      ...emptyAlgoNote,
      title: tutorial ? `${tutorial.title} 筆記` : '',
    }
    setAlgoDraft(nextDraft)
    setAlgoMarkdown(blocksToMarkdown(nextDraft.body))
    setMessage('Algo 筆記已刪除')
  }

  if (!token) return <section className="admin-shell">
    <div className="admin-panel">
      <p className="eyebrow">ADMIN</p>
      <h1>ExactlyOne Admin</h1>
      <label><span>Email</span><input value={email} onChange={event => setEmail(event.target.value)} /></label>
      <label><span>Password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      <label><span>TOTP code</span><input inputMode="numeric" value={totpCode} onChange={event => setTotpCode(event.target.value)} placeholder="啟用二階段後需要" /></label>
      <button className="primary" onClick={() => login().catch(() => setMessage('登入失敗'))}>登入</button>
      {message && <p className="admin-message">{message}</p>}
    </div>
  </section>

  return <section className="admin-shell">
    <aside className="admin-panel admin-list">
      <div className="admin-head-row"><div><p className="eyebrow">ADMIN</p><h1>ExactlyOne Admin</h1></div>{adminView === 'blog' && <button className="secondary" onClick={startNewPost}>新增</button>}</div>
      <section className="admin-security-card">
        <span>Security</span>
        <b>{security?.email ?? 'Owner'}</b>
        <small>TOTP：{security?.totpEnabled ? '已啟用' : '未啟用'}</small>
        {security?.passwordChangedAt && <small>密碼更新：{security.passwordChangedAt}</small>}
      </section>
      <div className="admin-tabs">
        <button className={adminView === 'blog' ? 'active' : ''} onClick={() => setAdminView('blog')}>Blog</button>
        <button className={adminView === 'algo' ? 'active' : ''} onClick={() => editAlgoNote(selectedAlgoProblemId)}>Algo</button>
      </div>
      {adminView === 'blog' && posts.map(post => <button key={post.id} className={editingId === post.id ? 'active' : ''} onClick={() => editPost(post)}>
        <span>{post.status}</span>
        <b>{post.title || 'Untitled'}</b>
        <small>{post.updatedAt}</small>
      </button>)}
      {adminView === 'algo' && <div className="admin-note-list">
        <label><span>題目</span><select value={selectedAlgoProblemId} onChange={event => editAlgoNote(event.target.value)}>
          {tutorials.map(tutorial => <option key={tutorial.id} value={tutorial.id}>{tutorial.title}</option>)}
        </select></label>
        {algoNotes.map(note => <button key={note.id} className={selectedAlgoProblemId === note.problemId ? 'active' : ''} onClick={() => editAlgoNote(note.problemId)}>
          <span>{note.status}</span>
          <b>{note.title || note.problemId}</b>
          <small>{note.problemId} · {note.updatedAt}</small>
        </button>)}
      </div>}
    </aside>
    {adminView === 'blog' ? <article className="admin-editor">
      <label><span>Title</span><input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label><span>Slug</span><input value={draft.slug ?? ''} onChange={event => setDraft({ ...draft, slug: event.target.value })} /></label>
      <label><span>Excerpt</span><textarea value={draft.excerpt} onChange={event => setDraft({ ...draft, excerpt: event.target.value })} /></label>
      <div className="admin-grid">
        <label><span>Category</span><input value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} /></label>
        <label><span>Tags</span><input value={draft.tags.join(', ')} onChange={event => setDraft({ ...draft, tags: event.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })} /></label>
        <label><span>Read minutes</span><input type="number" min="1" value={draft.readMinutes} onChange={event => setDraft({ ...draft, readMinutes: Number(event.target.value) })} /></label>
        <label><span>Status</span><select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as BlogPostPayload['status'] })}><option value="draft">draft</option><option value="published">published</option></select></label>
      </div>
      <label><span>Markdown</span><textarea className="body-markdown" value={markdown} onChange={event => updateMarkdown(event.target.value)} placeholder={'## 小標題\n\n寫下段落，也可以放 [超連結](https://example.com)。\n\n@[影片標題](https://www.youtube.com/watch?v=...)\n\n- 條列\n\n> 引用\n\n```rust\nfn main() {}\n```'} /></label>
      <section className="admin-preview" aria-label="article preview">
        <span>Preview</span>
        <h2>{previewPost.title}</h2>
        {previewPost.excerpt && <p className="blog-excerpt">{previewPost.excerpt}</p>}
        <BlogBody post={previewPost} />
      </section>
      <div className="admin-actions"><button className="primary" onClick={() => savePost().catch(error => setMessage(error instanceof Error ? error.message : '儲存失敗'))}>儲存</button>{editingId && <button className="danger" onClick={() => deletePost().catch(error => setMessage(error instanceof Error ? error.message : '刪除失敗'))}>刪除</button>}<button className="secondary" onClick={() => { localStorage.removeItem('exactlyone_admin_token'); setToken('') }}>登出</button></div>
      {message && <p className="admin-message">{message}</p>}
      <section className="admin-security">
        <div>
          <p className="eyebrow">SECURITY</p>
          <h2>Owner security</h2>
        </div>
        <div className="admin-security-grid">
          <section>
            <h3>密碼修改</h3>
            <label><span>Current password</span><input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label>
            <label><span>New password</span><input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="至少 12 字元" /></label>
            <button className="secondary" onClick={() => changePassword().catch(error => setMessage(error instanceof Error ? error.message : '密碼更新失敗'))}>更新密碼</button>
          </section>
          <section>
            <h3>TOTP 二階段驗證</h3>
            <p>{security?.totpEnabled ? '目前已啟用。登入時會要求 6 位數驗證碼。' : '目前未啟用。先產生 secret，加入驗證器後輸入 6 位數驗證碼。'}</p>
            {!security?.totpEnabled && <button className="secondary" onClick={() => startTotpSetup().catch(error => setMessage(error instanceof Error ? error.message : 'TOTP setup 失敗'))}>產生 TOTP secret</button>}
            {totpSetup && <div className="totp-setup">
              <span>Secret</span>
              <code>{totpSetup.secret}</code>
              <span>otpauth URL</span>
              <code>{totpSetup.otpauthUrl}</code>
              <label><span>Verify code</span><input inputMode="numeric" value={totpVerifyCode} onChange={event => setTotpVerifyCode(event.target.value)} /></label>
              <button className="primary" onClick={() => enableTotp().catch(error => setMessage(error instanceof Error ? error.message : 'TOTP 啟用失敗'))}>啟用 TOTP</button>
            </div>}
            {security?.totpEnabled && <div className="totp-setup">
              <label><span>Password</span><input type="password" value={totpDisablePassword} onChange={event => setTotpDisablePassword(event.target.value)} /></label>
              <label><span>TOTP code</span><input inputMode="numeric" value={totpDisableCode} onChange={event => setTotpDisableCode(event.target.value)} /></label>
              <button className="danger" onClick={() => disableTotp().catch(error => setMessage(error instanceof Error ? error.message : 'TOTP 停用失敗'))}>停用 TOTP</button>
            </div>}
          </section>
        </div>
      </section>
    </article> : <article className="admin-editor">
      <div className="admin-head-row">
        <div>
          <p className="eyebrow">ALGO NOTE</p>
          <h2>{selectedAlgoTutorial?.title ?? 'Algo note'}</h2>
        </div>
        <small>{selectedAlgoProblemId}</small>
      </div>
      <label><span>題目</span><select value={selectedAlgoProblemId} onChange={event => editAlgoNote(event.target.value)}>
        {tutorials.map(tutorial => <option key={tutorial.id} value={tutorial.id}>{tutorial.title}</option>)}
      </select></label>
      <div className="admin-grid compact">
        <label><span>Status</span><select value={algoDraft.status} onChange={event => setAlgoDraft({ ...algoDraft, status: event.target.value as AlgoNotePayload['status'] })}><option value="draft">draft</option><option value="published">published</option></select></label>
        <label><span>Title</span><input value={algoDraft.title} onChange={event => setAlgoDraft({ ...algoDraft, title: event.target.value })} /></label>
      </div>
      <label><span>Markdown</span><textarea className="body-markdown" value={algoMarkdown} onChange={event => updateAlgoMarkdown(event.target.value)} placeholder={'## 解題觀察\n\n寫下這題真正需要記住的思路、反例、複雜度取捨。'} /></label>
      <section className="admin-preview" aria-label="algo note preview">
        <span>Preview</span>
        <h2>{previewAlgoNote.title}</h2>
        <ContentBlocks body={previewAlgoNote.body} />
      </section>
      <div className="admin-actions">
        <button className="primary" onClick={() => saveAlgoNote().catch(error => setMessage(error instanceof Error ? error.message : '儲存失敗'))}>儲存 Algo 筆記</button>
        {selectedAlgoNote && <button className="danger" onClick={() => deleteAlgoNote().catch(error => setMessage(error instanceof Error ? error.message : '刪除失敗'))}>刪除</button>}
        <button className="secondary" onClick={() => { localStorage.removeItem('exactlyone_admin_token'); setToken('') }}>登出</button>
      </div>
      {message && <p className="admin-message">{message}</p>}
    </article>}
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
  return <ContentBlocks body={post.body} />
}

function ContentBlocks({ body }: { body: BlogPost['body'] }) {
  return <div className="blog-body">
    {body.map((block, index) => {
      if (block.kind === 'heading') return <h3 id={`blog-section-${index}`} key={index}>{block.text}</h3>
      if (block.kind === 'list') return <ul key={index}>{block.items.map(item => <li key={item}>{renderInlineMarkdown(item)}</li>)}</ul>
      if (block.kind === 'code') return <pre key={index}><code>{block.code}</code></pre>
      if (block.kind === 'quote') return <blockquote key={index}>{renderInlineMarkdown(block.text)}</blockquote>
      if (block.kind === 'video') return <BlogVideo key={index} url={block.url} title={block.title} />
      return <p key={index}>{renderInlineMarkdown(block.text)}</p>
    })}
  </div>
}

function AlgoNotePanel({ note }: { note?: AlgoProblemNote | null }) {
  return <section className="algo-note">
    <div className="algo-note-head">
      <span>PERSONAL NOTE</span>
      {note && <b>Updated {note.updatedAt}</b>}
    </div>
    {note ? <>
      <h3>{note.title}</h3>
      <ContentBlocks body={note.body} />
    </> : <>
      <h3>個人筆記</h3>
      <p>這題的筆記尚未公開。</p>
    </>}
  </section>
}

function BlogInteractionsPanel({
  interactions,
  commentName,
  commentBody,
  message,
  submittingComment,
  submittingReaction,
  onCommentNameChange,
  onCommentBodyChange,
  onSubmitComment,
  onReact,
}: {
  interactions: BlogInteractions
  commentName: string
  commentBody: string
  message: string
  submittingComment: boolean
  submittingReaction: BlogReactionType | null
  onCommentNameChange: (value: string) => void
  onCommentBodyChange: (value: string) => void
  onSubmitComment: (event: FormEvent) => void
  onReact: (reactionType: BlogReactionType) => void
}) {
  return <section className="blog-interactions">
    <div className="reaction-row" aria-label="文章反應">
      {reactionTypes.map(reactionType => {
        const reaction = interactions.reactions.find(item => item.reactionType === reactionType)
        const busy = submittingReaction === reactionType
        return <button
          key={reactionType}
          className={reaction?.reacted ? 'active' : ''}
          onClick={() => onReact(reactionType)}
          disabled={busy}
        >
          <span>{reactionLabels[reactionType]}</span>
          <b>{reaction?.count ?? 0}</b>
        </button>
      })}
    </div>
    <div className="comment-section">
      <div className="comment-head">
        <h3>留言</h3>
        <span>{interactions.comments.length} 則</span>
      </div>
      <form className="comment-form" onSubmit={onSubmitComment}>
        <input value={commentName} onChange={event => onCommentNameChange(event.target.value)} placeholder="暱稱，可留空" maxLength={80} />
        <textarea value={commentBody} onChange={event => onCommentBodyChange(event.target.value)} placeholder="寫下你的想法" maxLength={2000} />
        <div className="comment-actions">
          {message && <span>{message}</span>}
          <button className="primary" disabled={submittingComment || !commentBody.trim()}>{submittingComment ? '送出中' : '送出留言'}</button>
        </div>
      </form>
      <div className="comment-list">
        {interactions.comments.length > 0 ? interactions.comments.map(comment => <article key={comment.id}>
          <div><b>{comment.displayName}</b><span>{comment.createdAt}</span></div>
          <p>{comment.body}</p>
        </article>) : <p className="comment-empty">還沒有留言。</p>}
      </div>
    </div>
  </section>
}

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = []
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    nodes.push(
      <a key={`${match[2]}-${match.index}`} href={match[2]} target="_blank" rel="noreferrer">
        {match[1]}
      </a>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : text
}

function BlogVideo({ url, title }: { url: string; title?: string }) {
  const embedUrl = videoEmbedUrl(url)
  const label = title || 'Embedded video'

  if (embedUrl) {
    return <figure className="blog-video">
      <iframe src={embedUrl} title={label} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      {title && <figcaption>{title}</figcaption>}
    </figure>
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return <figure className="blog-video">
      <video controls src={url} />
      {title && <figcaption>{title}</figcaption>}
    </figure>
  }

  return <p className="blog-video-link"><a href={url} target="_blank" rel="noreferrer">{label}</a></p>
}

function videoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
    if (parsed.hostname.endsWith('youtube.com')) {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }
    if (parsed.hostname.endsWith('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : ''
    }
  } catch {
    return ''
  }
  return ''
}

function HeliosSection() {
  return <>
    <section className="hero compact quant-hero">
      <p className="eyebrow">HELIOS</p>
      <h1>Helios</h1>
      <p className="lead">市場資料、量化研究與平台狀態會整理成公開研究頁；真正的操作面板保留在登入後的私有區域。</p>
      <div className="quant-status" aria-label="Quant platform status">
        {heliosMetrics.map(metric => <div key={metric.label}>
          <span>{metric.label}</span>
          <b>{metric.value}</b>
          <small>{metric.note}</small>
        </div>)}
      </div>
    </section>

    <section className="quant-shell">
      <div className="quant-head">
        <div>
          <p className="eyebrow">HELIOS PLATFORM</p>
          <h2>量化研究與平台狀態</h2>
        </div>
        <p>公開頁只放整理後的研究內容和安全狀態摘要；資料擷取、券商設定、私有 logs 和寫入操作不公開。</p>
      </div>

      <div className="quant-grid">
        {heliosResearchLanes.map(panel => <article key={panel.label} className="quant-panel">
          <div className="quant-panel-head">
            <span>{panel.label}</span>
            <b>{panel.status}</b>
          </div>
          <h3>{panel.title}</h3>
          <p>{panel.summary}</p>
        </article>)}
      </div>

      <div className="helios-pipeline" aria-label="Helios data pipeline">
        {heliosPipeline.map(stage => <article key={stage.stage}>
          <span>{stage.stage}</span>
          <h3>{stage.title}</h3>
          <p>{stage.detail}</p>
        </article>)}
      </div>

      <div className="quant-runtime helios-boundary">
        <section>
          <h3>Research gates</h3>
          <ol>
            {heliosQualityRules.map(rule => <li key={rule}>{rule}</li>)}
          </ol>
        </section>
        <section>
          <h3>Private operations</h3>
          <ol>
            <li>Broker sessions and live trading actions require owner login.</li>
            <li>Raw logs, credentials, restart controls, and write APIs are not exposed here.</li>
            <li>The next public step is a read-only status export, not a live adapter.</li>
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
  const [anonymousKey] = useState(blogAnonymousKey)
  const [algoNote, setAlgoNote] = useState<AlgoProblemNote | null>(null)
  const [algoInteractions, setAlgoInteractions] = useState<BlogInteractions>(emptyInteractions)
  const [algoCommentName, setAlgoCommentName] = useState('')
  const [algoCommentBody, setAlgoCommentBody] = useState('')
  const [submittingAlgoComment, setSubmittingAlgoComment] = useState(false)
  const [submittingAlgoReaction, setSubmittingAlgoReaction] = useState<BlogReactionType | null>(null)
  const [algoInteractionMessage, setAlgoInteractionMessage] = useState('')

  const allTags = useMemo(() => ['All', ...Array.from(new Set(tutorials.flatMap(t => t.tags))).sort()], [])
  const visibleTags = showAllTags ? allTags : primaryTags.filter(t => allTags.includes(t))
  const searched = useMemo(() => searchTutorials(tutorials, query), [query])
  const filtered = tag === 'All' ? searched : searched.filter(t => t.tags.includes(tag))
  const tutorial = tutorials.find(t => t.id === selectedId) ?? filtered[0] ?? tutorials[0]
  const step = tutorial.steps[stepIndex] ?? tutorial.steps[0]

  useEffect(() => {
    let alive = true
    fetchAlgoProblemNote(tutorial.id, anonymousKey)
      .then(output => {
        if (!alive) return
        setAlgoNote(output.note ?? null)
        setAlgoInteractions(output.interactions)
      })
      .catch(() => {
        if (!alive) return
        setAlgoNote(null)
        setAlgoInteractions(emptyInteractions)
      })
    return () => { alive = false }
  }, [anonymousKey, tutorial.id])

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

  const submitAlgoComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!algoCommentBody.trim()) return
    setSubmittingAlgoComment(true)
    setAlgoInteractionMessage('')
    try {
      await createAlgoComment(tutorial.id, algoCommentName, algoCommentBody)
      const output = await fetchAlgoProblemNote(tutorial.id, anonymousKey)
      setAlgoNote(output.note ?? null)
      setAlgoInteractions(output.interactions)
      setAlgoCommentBody('')
      setAlgoInteractionMessage('留言已送出')
    } catch {
      setAlgoInteractionMessage('留言送出失敗，請稍後再試')
    } finally {
      setSubmittingAlgoComment(false)
    }
  }

  const chooseAlgoReaction = async (reactionType: BlogReactionType) => {
    if (submittingAlgoReaction) return
    setSubmittingAlgoReaction(reactionType)
    setAlgoInteractionMessage('')
    try {
      const nextInteractions = await createAlgoReaction(tutorial.id, reactionType, anonymousKey)
      setAlgoInteractions(nextInteractions)
    } catch {
      setAlgoInteractionMessage('反應送出失敗，請稍後再試')
    } finally {
      setSubmittingAlgoReaction(null)
    }
  }

  const renderSection = () => {
    if (section === 'home') return <ProjectHub onSelect={setSection} />
    if (section === 'helios') return <HeliosSection />
    if (section === 'blog') return <BlogSection />
    if (section === 'easyDb') return <EasyDbSection />
    if (section !== 'algoLab') return <ProjectPlaceholder section={section} />
    return <>
      <section className="hero compact"><div className="hero-bg" /><p className="eyebrow">ALGO LAB</p><h1>先找題，再進 dry-run</h1><p className="lead">用題號、題名或分類進入教學；首頁只放能操作的入口。</p><div className="hero-actions"><a className="btn primary" href="#tutorials">搜尋題目</a></div></section>

      <section id="tutorials" className="layout"><aside className="sidebar"><div className="sidebar-head"><div><h2>題目索引</h2><p>可用 LeetCode 題號或題名 fuzzy search</p></div><button className="tag-toggle" onClick={() => setShowAllTags(!showAllTags)}>{showAllTags ? '收合標籤' : `更多標籤 (${allTags.length - primaryTags.length})`}</button></div><label className="search-box"><span>搜尋題目</span><input value={query} onChange={e => changeQuery(e.target.value)} placeholder="例：1、146、coin chnage、valid bst" /></label><div className="active-filter">目前：<b>{tag}</b> · {filtered.length} 題{query && <em> · 搜尋「{query}」</em>}</div><div className="filter">{visibleTags.map(t => <button key={t} onClick={() => chooseTag(t)} className={tag === t ? 'selected' : ''}>{t}</button>)}</div><div className="cards">{filtered.map(t => <button key={t.id} onClick={() => choose(t.id)} className={'problem-card ' + (t.id === tutorial.id ? 'active' : '')}><span>#{problemNumberFor(t.id) ?? '—'} · {t.group}</span><b>{t.title}</b><small>{t.summary}</small></button>)}</div></aside>
      <article className="lesson"><div className="lesson-head"><div><p className="eyebrow">{tutorial.group} • {tutorial.difficulty}</p><h2>{tutorial.title}</h2><p>{tutorial.summary}</p></div><Tags tags={tutorial.tags} /></div>
        <div className="idea"><h3>思路講解</h3><ol>{tutorial.idea.map(i => <li key={i}>{i}</li>)}</ol><p className="complexity">{tutorial.complexity}</p></div>
        <div className="dryrun"><div className="step-panel"><div className="step-top"><span>Step {stepIndex + 1}/{tutorial.steps.length}</span><h3>{step.title}</h3><p>{step.explain}</p></div><Visualizer step={step} /><div className="controls"><button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>← 上一步</button><button onClick={() => setStepIndex(Math.min(tutorial.steps.length - 1, stepIndex + 1))} disabled={stepIndex === tutorial.steps.length - 1}>下一步 →</button></div></div>
          <div className="state-panel"><h3>當前變數</h3><div className="vars">{Object.entries(step.variables).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>)}</div><VariableTimeline steps={tutorial.steps} activeIndex={stepIndex} /><h3>目前步驟對應程式碼</h3><pre>{tutorial.code.map(line => <code key={line} className={line === step.codeLine ? 'line active' : 'line'}>{line}</code>)}</pre></div></div>
        <Solutions tutorial={tutorial} open={solutionOpen} language={solutionLanguage} onToggle={() => setSolutionOpen(!solutionOpen)} onLanguage={setSolutionLanguage} />
        <AlgoNotePanel note={algoNote} />
        <BlogInteractionsPanel
          interactions={algoInteractions}
          commentName={algoCommentName}
          commentBody={algoCommentBody}
          message={algoInteractionMessage}
          submittingComment={submittingAlgoComment}
          submittingReaction={submittingAlgoReaction}
          onCommentNameChange={setAlgoCommentName}
          onCommentBodyChange={setAlgoCommentBody}
          onSubmitComment={submitAlgoComment}
          onReact={chooseAlgoReaction}
        />
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
