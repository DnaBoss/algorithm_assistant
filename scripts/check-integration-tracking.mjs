#!/usr/bin/env node
import fs from 'node:fs'

const requiredAreas = ['Blog', 'Algo Lab', 'Helios', 'Easy DB']
const docAreaRequirements = {
  'docs/exactlyone-integration-roadmap.md': requiredAreas,
  'docs/current-architecture.md': requiredAreas,
  'docs/product-development-record.md': requiredAreas,
  'docs/platform-export-contracts.md': ['Helios', 'Easy DB'],
}
const roadmapMilestones = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6']
const requiredPackageScripts = [
  'release:gate',
  'check:platform-exports',
  'check:tracks',
  'audit:platform-export',
  'status:platform-export',
]

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const failures = []

for (const [docPath, areas] of Object.entries(docAreaRequirements)) {
  if (!fs.existsSync(docPath)) {
    failures.push(`Missing tracking document: ${docPath}`)
    continue
  }
  const text = fs.readFileSync(docPath, 'utf8')
  for (const area of areas) {
    if (!text.includes(area)) failures.push(`${docPath} does not mention ${area}`)
  }
}

const roadmap = readRequired('docs/exactlyone-integration-roadmap.md')
for (const milestone of roadmapMilestones) {
  if (!new RegExp(`###\\s+${milestone}\\b`).test(roadmap)) {
    failures.push(`Roadmap missing milestone ${milestone}`)
  }
}
for (const heading of ['## Goal', '## Product Map', '## Non-Negotiables', '## Next Action Queue', '## Progress Log']) {
  if (!roadmap.includes(heading)) failures.push(`Roadmap missing ${heading}`)
}

const architecture = readRequired('docs/current-architecture.md')
for (const phrase of [
  'Source-derived Helios/Easy DB changes',
  'platform export workbench',
  'docs/exactlyone-integration-roadmap.md',
]) {
  if (!architecture.includes(phrase)) failures.push(`Current architecture missing phrase: ${phrase}`)
}

const productRecord = readRequired('docs/product-development-record.md')
for (const phrase of ['## Public Changelog', '## Active Long Task', 'Production deployment path']) {
  if (!productRecord.includes(phrase)) failures.push(`Product record missing phrase: ${phrase}`)
}

for (const scriptName of requiredPackageScripts) {
  if (typeof packageJson.scripts?.[scriptName] !== 'string') failures.push(`package.json missing script: ${scriptName}`)
}

if (failures.length > 0) {
  console.error('Integration tracking check failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Integration tracking check passed: core docs and scripts cover Blog, Algo Lab, Helios, and Easy DB')

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf8')
}
