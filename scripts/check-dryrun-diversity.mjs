import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const requiredSnippets = [
  "id: 'three-sum'",
  "items: [-4, -1, -1, 0, 1, 2]",
  "id: 'container-with-most-water'",
  "items: [1, 8, 6, 2, 5, 4, 8, 3, 7]",
  "id: 'number-of-islands'",
  "items: ['1', '1', '0', '1', '0']",
  "id: 'invert-binary-tree'",
  "notes: ['交換 4.left 與 4.right，不是改節點值']",
  "id: 'reverse-linked-list'",
  "cur.next = prev；箭頭從向右改成向左"
]

const missing = requiredSnippets.filter(snippet => !source.includes(snippet))
if (missing.length) throw new Error(`Dry-run still lacks problem-specific visual traces. Missing snippets:\n${missing.join('\n')}`)

const twoSumBlock = source.slice(source.indexOf("raw.id === 'two-sum'"), source.indexOf("if (raw.id === 'three-sum'"))
const sourceWithoutTwoSumTrace = source.replace(twoSumBlock, '')
const placeholderCount = (sourceWithoutTwoSumTrace.match(/items: \[2, 7, 11, 15\]/g) ?? []).length
if (placeholderCount > 1) throw new Error(`Placeholder array [2,7,11,15] reused outside Two Sum ${placeholderCount} times`)

const genericLinkedCount = (source.match(/value: 'dummy', next: 'a'/g) ?? []).length
if (genericLinkedCount > 2) throw new Error(`Generic linked-list dummy fixture reused ${genericLinkedCount} times`)

console.log('Dry-run diversity check passed: problem-specific traces are present')
