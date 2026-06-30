import { readFileSync } from 'node:fs'

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const tracks = readFileSync(new URL('../src/algoTracksData.ts', import.meta.url), 'utf8')
const requiredTracks = [
  "id: 'blind75'",
  "id: 'top150'",
  "id: 'rating'",
  "id: 'categories'",
  "id: 'multi-tags'",
]
const requiredApp = [
  'data-track-id={track.id}',
  'data-testid="track-page"',
  'data-testid="track-back"',
  'openTrack(',
  'openLessonFromTrack(',
  'loadRatedPracticeProblems()',
  'categorySummaries(tutorials)',
  'multiTagSummaries(tutorials)'
]
const problems = [
  ...requiredTracks.filter(s => !tracks.includes(s)).map(s => `missing track data ${s}`),
  ...requiredApp.filter(s => !app.includes(s)).map(s => `missing app surface ${s}`),
]
const banned = [
  '固定名稱的算法學習筆記本。目前收錄 LeetCode Top 150',
  'Algo Lab 會固定這個名字；內容可以持續擴充',
  '<section className="stats"'
]
for (const s of banned) if (app.includes(s)) problems.push(`still has low-value copy: ${s}`)
if (problems.length) throw new Error(`Track page check failed:\n${problems.join('\n')}`)
console.log('Track page check passed: Algo Lab has real hierarchy pages, rating selection, and low-value homepage copy is removed')
