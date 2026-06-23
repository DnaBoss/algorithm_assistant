import { readFileSync } from 'node:fs'
import ts from 'typescript'

function loadTs(path) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
}

const data = await loadTs('../src/tutorialData.ts')
const search = await loadTs('../src/search.ts')
const tutorials = data.tutorials

const cases = [
  ['1', 'Two Sum'],
  ['146', 'LRU Cache'],
  ['322', 'Coin Change'],
  ['72', 'Edit Distance'],
  ['two sum', 'Two Sum'],
  ['TWO SUM', 'Two Sum'],
  ['coin chnage', 'Coin Change'],
  ['longst common subseq', 'Longest Common Subsequence'],
  ['median stream', 'Find Median from Data Stream'],
  ['valid bst', 'Validate Binary Search Tree'],
  ['top k frequent', 'Top K Frequent Elements']
]

const problems = []
for (const [query, expectedTitle] of cases) {
  const results = search.searchTutorials(tutorials, query)
  if (results[0]?.title !== expectedTitle) problems.push(`query ${JSON.stringify(query)} expected first ${expectedTitle}, got ${results[0]?.title ?? 'none'}`)
}

const numbered = tutorials.filter(t => search.problemNumberFor(t.id) !== undefined)
if (numbered.length !== tutorials.length) problems.push(`missing LeetCode numbers for ${tutorials.length - numbered.length} tutorials`)
const empty = search.searchTutorials(tutorials, 'zzzz-no-such-problem')
if (empty.length !== 0) problems.push(`nonsense query should return 0, got ${empty.length}`)

if (problems.length) throw new Error(`Search check failed:\n${problems.join('\n')}`)
console.log(`Search check passed: ${cases.length} queries and ${numbered.length} problem numbers verified`)
