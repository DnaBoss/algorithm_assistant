import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const twoSumBlock = source.slice(source.indexOf("raw.id === 'two-sum'"), source.indexOf("if (raw.id === 'three-sum'"))
const required = [
  "raw.id === 'two-sum'",
  "nums: '[2,7,11,15]'",
  "target: 9",
  "map: '{}'",
  "map: '{2:0}'",
  "answer: '[0,1]'",
  "unordered_map<int, int> seen;",
  "codeLine: '    int need = target - nums[i];'",
  "codeLine: '  if (seen.count(need)) return {seen[need], i};'"
]
const missing = required.filter(x => !source.includes(x))
if (missing.length) throw new Error(`Two Sum trace is not tied to LeetCode testcase/C++ code. Missing:\n${missing.join('\n')}`)
const stepCount = (twoSumBlock.match(/title:/g) ?? []).length
if (stepCount < 6) throw new Error(`Two Sum must have at least 6 dry-run steps, found ${stepCount}`)
if (!appSource.includes('變數變化時間線') || !appSource.includes('function VariableTimeline')) {
  throw new Error('UI must include a variable timeline table, not only current variables')
}
console.log(`Trace quality check passed: Two Sum has ${stepCount} C++ code-aligned steps and variable timeline UI`)
