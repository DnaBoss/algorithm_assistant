import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)

const badCodeSnippets = ['建立本題測資', '依題意更新', 'int answer = 初始化答案;']
const allowedLegacy = new Set([])
const problems = []

for (const t of mod.tutorials) {
  const codeBlob = t.code.join('\n')
  const stepBlob = JSON.stringify(t.steps)
  if (badCodeSnippets.some(s => codeBlob.includes(s))) problems.push(`${t.id}: code still uses placeholder skeleton`)
  if (!/^\w/.test(t.code[0]) || !t.code[0].includes('(')) problems.push(`${t.id}: first code line is not a C++ function signature`)
  if (t.steps.length < 5) problems.push(`${t.id}: fewer than 5 dry-run steps`)
  if (!stepBlob.includes('測資') && !stepBlob.includes('sample') && !stepBlob.includes('head =') && !stepBlob.includes('root =') && !stepBlob.includes('grid') && !stepBlob.includes('s =')) problems.push(`${t.id}: missing concrete testcase mention`)
  const badLines = t.steps.filter(s => !t.code.includes(s.codeLine)).map(s => s.title)
  if (badLines.length) problems.push(`${t.id}: codeLine mismatch: ${badLines.join(', ')}`)
  const visualKinds = new Set(t.steps.map(s => s.visual.kind))
  if (t.tags.includes('Linked List') && !t.tags.includes('Tree') && !visualKinds.has('linked-list')) problems.push(`${t.id}: linked-list tag without linked-list visual`)
  if (t.tags.includes('Tree') && !visualKinds.has('tree')) problems.push(`${t.id}: tree tag without tree visual`)
  if ((t.tags.includes('Stack') || t.tags.includes('Heap')) && !visualKinds.has('stack') && !visualKinds.has('linked-list')) problems.push(`${t.id}: stack/heap tag without stack-like visual`)
}

if (problems.length) throw new Error(`Remaining refinement gate failed:\n${problems.slice(0,80).join('\n')}`)
console.log(`Remaining refinement gate passed: ${mod.tutorials.length} tutorials use concrete C++ signatures, testcase traces, matching code lines, and category visuals`)
