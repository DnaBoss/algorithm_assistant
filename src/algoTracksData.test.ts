import { describe, expect, it } from 'vitest'
import { algoTracks, categorySummaries, loadRatedPracticeProblems, multiTagSummaries, tutorialsForTrack } from './algoTracksData'
import { tutorials } from './tutorialData'

describe('algo track data', () => {
  it('defines the active Algo Lab hierarchy', () => {
    expect(algoTracks.map(track => track.id)).toEqual(['blind75', 'top150', 'rating', 'categories', 'multi-tags'])
  })

  it('builds stable Blind 75 and Top 150 tutorial tracks', () => {
    const blind75 = tutorialsForTrack('blind75', tutorials)
    const top150 = tutorialsForTrack('top150', tutorials)
    expect(blind75).toHaveLength(75)
    expect(top150).toHaveLength(150)
    expect(blind75[0].title).toBe('Two Sum')
    expect(top150[0].title).toBe('Two Sum')
  })

  it('selects rated practice problems in the target range', async () => {
    const rated = await loadRatedPracticeProblems(1200, 2200, 12)
    expect(rated).toHaveLength(12)
    expect(rated.every(problem => problem.rating !== null && problem.rating >= 1200 && problem.rating <= 2200)).toBe(true)
    expect(rated.map(problem => problem.rating)).toEqual([...rated.map(problem => problem.rating)].sort((a, b) => (a ?? 0) - (b ?? 0)))
  })

  it('derives category and multi-tag summaries from tutorials', () => {
    expect(categorySummaries(tutorials).some(category => category.label === 'Array')).toBe(true)
    expect(multiTagSummaries(tutorials).some(category => category.label.includes(' + '))).toBe(true)
  })
})
