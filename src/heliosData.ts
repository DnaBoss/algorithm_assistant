export type HeliosMetric = {
  label: string
  value: string
  note: string
}

export type HeliosStatusSignal = {
  label: string
  value: string
  detail: string
}

export type HeliosDatasetStatus = {
  name: string
  coverage: string
  cadence: string
  gate: string
}

export type HeliosStatusExport = {
  schemaVersion: 1
  source: 'helios-public-status'
  exportedAt: string
  signals: HeliosStatusSignal[]
  datasets: HeliosDatasetStatus[]
}

export type HeliosLane = {
  label: string
  title: string
  summary: string
  status: string
}

export type HeliosPipelineStage = {
  stage: string
  title: string
  detail: string
}

export const heliosStatusExport: HeliosStatusExport = {
  schemaVersion: 1,
  source: 'helios-public-status',
  exportedAt: '2026-06-30',
  signals: [
    {
      label: 'Engine',
      value: 'complete',
      detail: 'Event pipeline, risk checks, execution simulation, portfolio state, and observability are implemented.',
    },
    {
      label: 'Platform',
      value: 'building',
      detail: 'Broker adapters, database layer, auth, crawler, API, and React UI are being integrated in stages.',
    },
    {
      label: 'Data gate',
      value: 'strict',
      detail: 'Research is gated by validated 1m K-line completeness and explicit session rules.',
    },
  ],
  datasets: [
    {
      name: 'Taiwan equity 1m bars',
      coverage: 'collection-state export pending',
      cadence: 'market sessions',
      gate: 'session-aware completeness check',
    },
    {
      name: 'Index futures research bars',
      coverage: 'TXF / MTX / MXF separated',
      cadence: 'intraday sessions',
      gate: 'roll calendar and contract-cost validation',
    },
    {
      name: 'Strategy candidates',
      coverage: 'research-only summaries',
      cadence: 'manual promotion',
      gate: 'benchmark, slippage, and stability review',
    },
  ],
}

export const heliosMetrics: HeliosMetric[] = heliosStatusExport.signals.map(signal => ({
  label: signal.label,
  value: signal.value,
  note: signal.detail,
}))

export const heliosResearchLanes: HeliosLane[] = [
  {
    label: 'Market data',
    title: '1m K-line collection',
    summary: 'Tracks Taiwan stock, ETF, and index-futures symbols with session-aware completeness checks.',
    status: 'read-only summary',
  },
  {
    label: 'Research',
    title: 'Strategy validation',
    summary: 'Separates research-only candidates from validated strategies by net results, benchmarks, and stability.',
    status: 'curated notes',
  },
  {
    label: 'Observability',
    title: 'Runtime health',
    summary: 'Uses latency, order flow, slippage, drawdown, and strategy health metrics as platform signals.',
    status: 'private ops',
  },
  {
    label: 'Safety',
    title: 'Private boundary',
    summary: 'Broker credentials, live trading controls, raw logs, and write operations stay behind owner access.',
    status: 'locked',
  },
]

export const heliosPipeline: HeliosPipelineStage[] = [
  {
    stage: '01',
    title: 'Collect',
    detail: 'Gather broker-native or vetted provider K-lines without mixing incompatible session definitions.',
  },
  {
    stage: '02',
    title: 'Validate',
    detail: 'Check timestamps, OHLCV shape, expected session minutes, duplicates, and source continuity.',
  },
  {
    stage: '03',
    title: 'Curate',
    detail: 'Promote valid rows into symbol-specific K-line tables while keeping rejected rows auditable.',
  },
  {
    stage: '04',
    title: 'Research',
    detail: 'Run product-scoped strategy discovery only after the data quality gate is satisfied.',
  },
]

export const heliosQualityRules = [
  'A strategy is not public-valid just because its backtest is positive.',
  'Stock and ETF research needs adjusted or total-return comparison before promotion.',
  'Futures research keeps TXF, MTX, and MXF separate because contract behavior and costs differ.',
  'Live execution, broker sessions, and operational restart controls are not public features.',
]

export function publicHeliosText() {
  return [
    heliosStatusExport.source,
    heliosStatusExport.exportedAt,
    ...heliosMetrics.flatMap(metric => [metric.label, metric.value, metric.note]),
    ...heliosStatusExport.datasets.flatMap(dataset => [dataset.name, dataset.coverage, dataset.cadence, dataset.gate]),
    ...heliosResearchLanes.flatMap(lane => [lane.label, lane.title, lane.summary, lane.status]),
    ...heliosPipeline.flatMap(stage => [stage.stage, stage.title, stage.detail]),
    ...heliosQualityRules,
  ].join(' ')
}
