import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

function blockBetween(start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end))
}

const twoSumBlock = blockBetween("raw.id === 'two-sum'", "if (raw.id === 'three-sum'")
const validateBstBlock = blockBetween("raw.id === 'validate-binary-search-tree'", "if (raw.id === 'invert-binary-tree'")

const required = [
  "raw.id === 'two-sum'",
  "nums: '[2,7,11,15]'",
  "target: 9",
  "map: '{}'",
  "map: '{2:0}'",
  "answer: '[0,1]'",
  "unordered_map<int, int> seen;",
  "codeLine: '    int need = target - nums[i];'",
  "codeLine: '  if (seen.count(need)) return {seen[need], i};'",
  "raw.id === 'validate-binary-search-tree'",
  "root = [5,1,4,null,null,3,6]",
  "valid(4, 5, +∞)",
  "condition: '4 <= 5'",
  "answer: false",
  "bool valid(TreeNode* node, long low, long high)",
  "codeLine: '  if (node->val <= low || node->val >= high) return false;'"
]
const missing = required.filter(x => !source.includes(x))
if (missing.length) throw new Error(`Traces are not tied to LeetCode testcase/C++ code. Missing:\n${missing.join('\n')}`)

const twoSumStepCount = (twoSumBlock.match(/title:/g) ?? []).length
if (twoSumStepCount < 6) throw new Error(`Two Sum must have at least 6 dry-run steps, found ${twoSumStepCount}`)
const validateBstStepCount = (validateBstBlock.match(/title:/g) ?? []).length
if (validateBstStepCount < 7) throw new Error(`Validate BST must have at least 7 dry-run steps, found ${validateBstStepCount}`)

if (!appSource.includes('變數變化時間線') || !appSource.includes('function VariableTimeline')) {
  throw new Error('UI must include a variable timeline table, not only current variables')
}
console.log(`Trace quality check passed: Two Sum ${twoSumStepCount} steps, Validate BST ${validateBstStepCount} C++ code-aligned steps, variable timeline UI present`)
