import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/tutorialData.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
}).outputText
const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
const tutorials = mod.tutorials

const badStepCounts = tutorials.filter(t => t.steps.length < 5).map(t => `${t.id}:${t.steps.length}`)
if (badStepCounts.length) {
  throw new Error(`All tutorials must have at least 5 code/testcase-aligned dry-run steps. Failing:\n${badStepCounts.join('\n')}`)
}

const badCode = tutorials.filter(t => !t.code.some(line => /\b(int|bool|vector|unordered_|ListNode|TreeNode|for \(|while \(|return|class|void|priority_queue|queue|stack)\b/.test(line))).map(t => t.id)
if (badCode.length) {
  throw new Error(`All tutorials must expose C++-style code lines. Failing:\n${badCode.join('\n')}`)
}

const missingActiveCode = tutorials.filter(t => t.steps.some(s => !t.code.includes(s.codeLine))).map(t => t.id)
if (missingActiveCode.length) {
  throw new Error(`Every step codeLine must match a visible code line. Failing:\n${missingActiveCode.join('\n')}`)
}

const missingVariables = tutorials.filter(t => t.steps.some(s => Object.keys(s.variables).length < 3)).map(t => t.id)
if (missingVariables.length) {
  throw new Error(`Every dry-run step must track at least 3 variables. Failing:\n${missingVariables.join('\n')}`)
}

console.log(`All-trace quality check passed: ${tutorials.length} tutorials have 5+ steps, C++ code, matching active lines, and variable state`)
