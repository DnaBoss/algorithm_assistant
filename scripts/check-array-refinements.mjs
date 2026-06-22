import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
const byId = new Map(mod.tutorials.map(t => [t.id, t]))

const requirements = {
  'best-time-to-buy-and-sell-stock': ['prices = [7,1,5,3,6,4]', 'minPrice', 'profit', 'maxProfit = max(maxProfit, price - minPrice);'],
  'contains-duplicate': ['nums = [1,2,3,1]', 'seen.count(nums[i])', 'return true', 'unordered_set<int> seen;'],
  'product-of-array-except-self': ['nums = [1,2,3,4]', 'prefix', 'suffix', 'ans[i] *= suffix;'],
  'maximum-subarray': ['nums = [-2,1,-3,4,-1,2,1,-5,4]', 'current = max(nums[i], current + nums[i]);', 'best', 'Kadane'],
  'three-sum': ['nums = [-1,0,1,2,-1,-4]', 'sort(nums.begin(), nums.end());', 'left', 'right', '[-1,-1,2]'],
  'container-with-most-water': ['height = [1,8,6,2,5,4,8,3,7]', 'area = min(height[left], height[right])', 'maxArea', 'left++'],
  'maximum-product-subarray': ['nums = [2,3,-2,4]', 'maxProd', 'minProd', 'swap(maxProd, minProd);'],
  'find-minimum-in-rotated-sorted-array': ['nums = [3,4,5,1,2]', 'left', 'right', 'nums[mid] > nums[right]'],
  'search-in-rotated-sorted-array': ['nums = [4,5,6,7,0,1,2]', 'target = 0', 'left half sorted', 'return mid;'],
  'longest-consecutive-sequence': ['nums = [100,4,200,1,3,2]', 'unordered_set<int> seen', 'start=1', 'length=4'],
  'missing-number': ['nums = [3,0,1]', 'expected = n * (n + 1) / 2', 'actual', 'missing = 2'],
  'counting-bits': ['n = 5', 'bits[i] = bits[i >> 1] + (i & 1);', 'bits = [0,1,1,2,1,2]'],
  'number-of-1-bits': ['n = 11', 'n &= (n - 1);', 'count = 3'],
  'reverse-bits': ['n = 43261596', 'ans = (ans << 1) | (n & 1);', '32 rounds']
}

for (const [id, snippets] of Object.entries(requirements)) {
  const t = byId.get(id)
  if (!t) throw new Error(`Missing tutorial ${id}`)
  if (t.steps.length < 6) throw new Error(`${id} must have at least 6 hand-authored steps; found ${t.steps.length}`)
  const blob = JSON.stringify(t)
  const missing = snippets.filter(s => !blob.includes(s))
  if (missing.length) throw new Error(`${id} missing refined trace snippets:\n${missing.join('\n')}`)
  const badLines = t.steps.filter(s => !t.code.includes(s.codeLine)).map(s => s.title)
  if (badLines.length) throw new Error(`${id} has step codeLine not present in code: ${badLines.join(', ')}`)
}

console.log('Array/Binary Search/Bit refinement check passed')
