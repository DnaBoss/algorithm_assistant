import { describe, expect, it } from 'vitest'
import { heliosPipeline, heliosResearchLanes, publicHeliosText } from './heliosData'

describe('helios public data', () => {
  it('keeps the public summary free of local paths and credentials wording', () => {
    expect(publicHeliosText()).not.toMatch(/\/Users\/cash|password|secret|token|apikey|private key/i)
  })

  it('documents the read-only pipeline in order', () => {
    expect(heliosPipeline.map(stage => stage.title)).toEqual(['Collect', 'Validate', 'Curate', 'Research'])
  })

  it('keeps operations behind a visible boundary lane', () => {
    expect(heliosResearchLanes.some(lane => lane.title === 'Private boundary' && lane.status === 'locked')).toBe(true)
  })
})
