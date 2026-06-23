import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
const tutorials = mod.tutorials

const counts = tutorials.map(t => t.steps.length)
const histogram = new Map()
for (const count of counts) histogram.set(count, (histogram.get(count) ?? 0) + 1)
const fixedSixRatio = (histogram.get(6) ?? 0) / tutorials.length
const distinctCounts = [...histogram.keys()].sort((a, b) => a - b)
const hardTooShort = tutorials.filter(t => t.difficulty === 'Hard' && t.steps.length < 8).map(t => `${t.title}=${t.steps.length}`)
const complexTooShort = tutorials.filter(t => (t.tags.includes('Graph') || t.tags.includes('DP') || t.tags.includes('Backtracking') || t.tags.includes('Tree')) && t.difficulty !== 'Easy' && t.steps.length < 7).map(t => `${t.title}=${t.steps.length}`)

if (distinctCounts.length < 5) throw new Error(`Step counts must vary naturally; only saw counts ${distinctCounts.join(', ')}`)
if (fixedSixRatio > 0.45) throw new Error(`Too many tutorials are exactly 6 steps: ${histogram.get(6)}/${tutorials.length}`)
if (hardTooShort.length) throw new Error(`Hard tutorials need 8+ dry-run steps:\n${hardTooShort.slice(0, 30).join('\n')}`)
if (complexTooShort.length) throw new Error(`Complex non-easy tutorials need 7+ dry-run steps:\n${complexTooShort.slice(0, 40).join('\n')}`)
console.log(`Step-count diversity check passed: counts ${distinctCounts.map(c => `${c}:${histogram.get(c)}`).join(', ')}`)
