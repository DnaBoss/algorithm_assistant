import { describe, expect, it } from 'vitest'
import { areaCompletionCount, corePlatformAreas, releaseRhythm } from './platformProgressData'

describe('platform progress data', () => {
  it('tracks the four core ExactlyOne integration areas', () => {
    expect(corePlatformAreas.map(area => area.id)).toEqual(['blog', 'algoLab', 'helios', 'easyDb'])
  })

  it('has a public status, completed work, and next step for every area', () => {
    for (const area of corePlatformAreas) {
      expect(area.status).not.toHaveLength(0)
      expect(area.completed.length).toBeGreaterThanOrEqual(3)
      expect(area.next).not.toHaveLength(0)
    }
    expect(areaCompletionCount()).toBeGreaterThanOrEqual(12)
  })

  it('keeps production release cadence explicit', () => {
    expect(releaseRhythm.status).toBe('batch verified slices')
    expect(releaseRhythm.summary).toContain('coherent feature slices')
  })
})
