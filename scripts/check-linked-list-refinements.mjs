import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
const byId = new Map(mod.tutorials.map(t => [t.id, t]))

const requirements = {
  'reverse-linked-list': ['head = [1,2,3,4,5]', 'prev', 'cur', 'next', 'cur->next = prev;', '5 -> 4 -> 3 -> 2 -> 1'],
  'linked-list-cycle': ['head = [3,2,0,-4], pos = 1', 'slow', 'fast', 'fast->next->next', 'slow == fast'],
  'merge-two-sorted-lists': ['list1 = [1,2,4], list2 = [1,3,4]', 'dummy', 'tail', 'tail->next = list1;', '1 -> 1 -> 2 -> 3 -> 4 -> 4'],
  'merge-k-sorted-lists': ['lists = [[1,4,5],[1,3,4],[2,6]]', 'priority_queue', 'heap', 'tail->next = node;', '1 -> 1 -> 2 -> 3 -> 4 -> 4 -> 5 -> 6'],
  'remove-nth-node-from-end-of-list': ['head = [1,2,3,4,5], n = 2', 'dummy', 'fast', 'slow', 'slow->next = slow->next->next;', '1 -> 2 -> 3 -> 5'],
  'reorder-list': ['head = [1,2,3,4,5]', 'slow', 'fast', 'reverse second half', 'first->next = second;', '1 -> 5 -> 2 -> 4 -> 3']
}

for (const [id, snippets] of Object.entries(requirements)) {
  const t = byId.get(id)
  if (!t) throw new Error(`Missing tutorial ${id}`)
  if (t.steps.length < 6) throw new Error(`${id} must have at least 6 linked-list dry-run steps; found ${t.steps.length}`)
  const blob = JSON.stringify(t)
  const missing = snippets.filter(s => !blob.includes(s))
  if (missing.length) throw new Error(`${id} missing linked-list snippets:\n${missing.join('\n')}`)
  const nonLinked = t.steps.filter(s => s.visual.kind !== 'linked-list').map(s => s.title)
  if (nonLinked.length) throw new Error(`${id} has non linked-list visuals: ${nonLinked.join(', ')}`)
  const badLines = t.steps.filter(s => !t.code.includes(s.codeLine)).map(s => s.title)
  if (badLines.length) throw new Error(`${id} has step codeLine not present in code: ${badLines.join(', ')}`)
  const hasPointerChange = t.steps.some(s => (s.visual.links ?? []).some(node => Object.hasOwn(node, 'next')) && (s.visual.pointers ?? []).length >= 2)
  if (!hasPointerChange) throw new Error(`${id} must show links plus at least two pointers in a step`)
}

console.log('Linked-list refinement check passed')
