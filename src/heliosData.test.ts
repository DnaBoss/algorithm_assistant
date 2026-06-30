import { describe, expect, it } from 'vitest'
import { heliosPipeline, heliosResearchLanes, heliosStatusExport, publicHeliosText } from './heliosData'

describe('helios public data', () => {
  it('keeps the public summary free of local paths and credentials wording', () => {
    expect(publicHeliosText()).not.toMatch(/\/Users\/cash|password|secret|token|apikey|private key/i)
  })

  it('documents the read-only pipeline in order', () => {
    expect(heliosPipeline.map(stage => stage.title)).toEqual(['Collect', 'Validate', 'Curate', 'Research'])
  })

  it('defines the Helios public status export contract', () => {
    expect(heliosStatusExport.schemaVersion).toBe(1)
    expect(heliosStatusExport.source).toBe('helios-public-status')
    expect(heliosStatusExport.signals.map(signal => signal.label)).toEqual(['Engine', 'Platform', 'Data gate'])
    expect(heliosStatusExport.datasets.length).toBeGreaterThanOrEqual(3)
  })

  it('keeps operations behind a visible boundary lane', () => {
    expect(heliosResearchLanes.some(lane => lane.title === 'Private boundary' && lane.status === 'locked')).toBe(true)
  })
})
