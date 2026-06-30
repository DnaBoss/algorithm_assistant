import type { ProblemBankItem } from './problemBank'
import { problemNumberFor } from './search'
import type { Tutorial } from './tutorialData'

export type AlgoTrackId = 'blind75' | 'top150' | 'rating' | 'categories' | 'multi-tags'

export type AlgoTrack = {
  id: AlgoTrackId
  label: string
  title: string
  summary: string
}

export type CategorySummary = {
  label: string
  count: number
}

export const algoTracks: AlgoTrack[] = [
  {
    id: 'blind75',
    label: 'Core',
    title: 'Blind / LeetCode 75',
    summary: '先練最常見的 75 題；每題可以直接進入 dry-run、完整解答與個人筆記。',
  },
  {
    id: 'top150',
    label: 'Interview',
    title: 'LeetCode Top 150',
    summary: '完整面試清單，適合用題號、分類與難度安排每日練習。',
  },
  {
    id: 'rating',
    label: 'Rating',
    title: '題庫 / Rating',
    summary: '用競賽 rating 選題，先鎖定 1200-2200 分的高價值題目。',
  },
  {
    id: 'categories',
    label: 'Topics',
    title: '分類算法教程',
    summary: '按 Array、Tree、Graph、DP 等分類進入題組。',
  },
  {
    id: 'multi-tags',
    label: 'Cross',
    title: '多標籤索引',
    summary: '找出同時屬於多個技巧的題目，例如 Array + Hash Map、Tree + DFS。',
  },
]

export function tutorialNumber(tutorial: Tutorial) {
  return problemNumberFor(tutorial.id) ?? 99999
}

export function sortTutorialsByNumber(tutorials: Tutorial[]) {
  return [...tutorials].sort((a, b) => tutorialNumber(a) - tutorialNumber(b))
}

export function tutorialsForTrack(trackId: AlgoTrackId, tutorials: Tutorial[]) {
  if (trackId === 'blind75') return sortTutorialsByNumber(tutorials.filter(tutorial => tutorial.tags.includes('Blind 75')))
  if (trackId === 'top150') return sortTutorialsByNumber(tutorials.filter(tutorial => tutorial.tags.includes('Top 150') || tutorial.tags.includes('LeetCode Top 150')))
  return []
}

export async function loadRatedPracticeProblems(minRating = 1200, maxRating = 2200, limit = 24): Promise<ProblemBankItem[]> {
  const { problemBank } = await import('./problemBank')
  return problemBank
    .filter(problem => !problem.paidOnly && problem.rating !== null && problem.rating >= minRating && problem.rating <= maxRating && problem.highValue)
    .sort((a, b) => (a.rating ?? 99999) - (b.rating ?? 99999) || Number(a.id) - Number(b.id))
    .slice(0, limit)
}

export function categorySummaries(tutorials: Tutorial[]): CategorySummary[] {
  const excluded = new Set(['Blind 75', 'LeetCode 75', 'LeetCode Top 150', 'Top 150', 'Top 150 Only', 'Beginner', 'Hard'])
  const counts = new Map<string, number>()
  for (const tutorial of tutorials) {
    for (const tag of tutorial.tags) {
      if (excluded.has(tag)) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function multiTagSummaries(tutorials: Tutorial[]): CategorySummary[] {
  const categories = categorySummaries(tutorials).map(item => item.label)
  const categorySet = new Set(categories)
  const counts = new Map<string, number>()
  for (const tutorial of tutorials) {
    const tags = tutorial.tags.filter(tag => categorySet.has(tag)).sort()
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const key = `${tags[i]} + ${tags[j]}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 18)
}
