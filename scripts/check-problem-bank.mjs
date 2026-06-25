import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../src/problemBank.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
const { problemBank, problemBankMeta } = mod
const problems = []
if (problemBank.length < 3900) problems.push(`expected all LeetCode index >=3900, got ${problemBank.length}`)
if (problemBank.filter(p => p.contest).length < 2400) problems.push('rated contest/weekly problem coverage too low')
if (problemBank.filter(p => p.highValue).length < 300) problems.push('high-value/common problem coverage too low')
for (const [id, title] of [['1','Two Sum'], ['146','LRU Cache'], ['322','Coin Change'], ['3235','Check if the Rectangle Corner Is Reachable']]) {
  const hit = problemBank.find(p => p.id === id)
  if (!hit) problems.push(`missing problem #${id}`)
  else if (hit.title !== title) problems.push(`#${id} expected ${title}, got ${hit.title}`)
}
const hardRated = problemBank.find(p => p.id === '3235')
if (!hardRated?.rating || !hardRated.contest || !hardRated.problemIndex) problems.push('missing Zerotrac rating/contest fields for #3235')
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
for (const s of ['problemBank', 'minRating', 'maxRating', 'ratingFilteredProblems', '題庫 / Rating', 'data-testid="problem-bank"']) {
  if (!app.includes(s)) problems.push(`UI missing ${s}`)
}
if (problems.length) throw new Error(`Problem bank check failed:\n${problems.join('\n')}`)
console.log(`Problem bank check passed: ${problemBank.length} total, ${problemBankMeta.ratedContestProblems} rated contest, ${problemBankMeta.highValueProblems} high-value/common`)
