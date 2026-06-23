import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
const tutorials = mod.tutorials

const problems = []
const rows = []
const hasTestcase = stepBlob => /測資|LeetCode 範例|sample =|coins=|amount=|head =|root =|grid|s =|nums =|prices =|target/.test(stepBlob)
const minDepth = t => {
  if (t.id === 'coin-change') return 15
  if (t.tags.includes('DP') && t.difficulty !== 'Easy') return 10
  if (t.tags.includes('Backtracking')) return t.difficulty === 'Hard' ? 12 : 9
  if (t.tags.includes('Graph') && t.difficulty !== 'Easy') return t.difficulty === 'Hard' ? 12 : 9
  if (t.tags.includes('Tree') && t.difficulty !== 'Easy') return t.difficulty === 'Hard' ? 10 : 8
  if (t.tags.includes('Linked List') && t.difficulty !== 'Easy') return t.difficulty === 'Hard' ? 10 : 8
  if (t.difficulty === 'Hard') return 9
  if (t.difficulty === 'Medium') return 7
  return 5
}

for (const t of tutorials) {
  const stepBlob = JSON.stringify(t.steps)
  const codeSet = new Set(t.code)
  const visualKinds = new Set(t.steps.map(s => s.visual.kind))
  const stepTitles = t.steps.map(s => s.title)
  const duplicateStepTitles = stepTitles.filter((title, i) => stepTitles.indexOf(title) !== i)
  const badLines = t.steps.filter(s => !codeSet.has(s.codeLine)).map(s => s.title)
  const requiredDepth = minDepth(t)
  const issues = []
  if (t.steps.length < requiredDepth) issues.push(`too few steps ${t.steps.length}<${requiredDepth}`)
  if (badLines.length) issues.push(`codeLine mismatch: ${badLines.join(', ')}`)
  if (!hasTestcase(stepBlob)) issues.push('missing concrete testcase/sample mention')
  if (duplicateStepTitles.length) issues.push(`duplicate step titles: ${[...new Set(duplicateStepTitles)].join(', ')}`)
  if (t.steps.some(s => Object.keys(s.variables).length < 3)) issues.push('some step has fewer than 3 tracked variables')
  if (t.tags.includes('Linked List') && !t.tags.includes('Tree') && !visualKinds.has('linked-list')) issues.push('linked-list lesson lacks linked-list visual')
  if (t.tags.includes('Tree') && !visualKinds.has('tree')) issues.push('tree lesson lacks tree visual')
  if ((t.tags.includes('Stack') || t.tags.includes('Heap')) && !visualKinds.has('stack') && !visualKinds.has('linked-list')) issues.push('stack/heap lesson lacks stack-like visual')
  const genericFirst = ['建立測資與初始狀態', '建立測資樹', '建立輸入與空 stack', '建立測資與指標'].includes(t.steps[0]?.title)
  if (genericFirst && t.difficulty !== 'Easy') issues.push('first step title is generic for non-easy lesson')
  rows.push({ id: t.id, title: t.title, difficulty: t.difficulty, group: t.group, steps: t.steps.length, requiredDepth, visualKinds: [...visualKinds].join('|'), status: issues.length ? 'FAIL' : 'PASS', issues })
  if (issues.length) problems.push(`${t.id} (${t.title}): ${issues.join('; ')}`)
}

mkdirSync(new URL('../audit', import.meta.url), { recursive: true })
writeFileSync(new URL('../audit/every-tutorial-audit.json', import.meta.url), JSON.stringify({ generatedAt: new Date().toISOString(), total: tutorials.length, pass: rows.filter(r => r.status === 'PASS').length, fail: rows.filter(r => r.status === 'FAIL').length, rows }, null, 2))
writeFileSync(new URL('../audit/every-tutorial-audit.md', import.meta.url), [
  '# Every Tutorial Audit',
  '',
  `Total: ${tutorials.length}`,
  `Pass: ${rows.filter(r => r.status === 'PASS').length}`,
  `Fail: ${rows.filter(r => r.status === 'FAIL').length}`,
  '',
  '| Status | Steps | Required | Title | Issues |',
  '|---|---:|---:|---|---|',
  ...rows.map(r => `| ${r.status} | ${r.steps} | ${r.requiredDepth} | ${r.title.replaceAll('|','/')} | ${r.issues.join('<br>') || '—'} |`)
].join('\n'))

if (problems.length) throw new Error(`Every tutorial audit failed (${problems.length}):\n${problems.slice(0, 120).join('\n')}`)
console.log(`Every tutorial audit passed: ${tutorials.length} tutorials checked individually; report written to audit/every-tutorial-audit.md`)
