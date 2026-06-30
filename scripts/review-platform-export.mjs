#!/usr/bin/env node
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const DEFAULT_CURRENT = 'src/platformExports.generated.json'
const DEFAULT_CANDIDATE = '.platform-local/platform-candidate.local.json'
const options = parseArgs(process.argv.slice(2))

if (options.selfTest) {
  selfTest()
  process.exit(0)
}

validateExport(options.candidatePath)
const current = readJson(options.currentPath)
const candidate = readJson(options.candidatePath)
const report = buildReport(current, candidate)

printReport(report, options)

if (options.jsonPath) {
  fs.mkdirSync(pathDirname(options.jsonPath), { recursive: true })
  fs.writeFileSync(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Platform export review JSON: ${options.jsonPath}`)
}

if (options.historyPath) {
  fs.mkdirSync(pathDirname(options.historyPath), { recursive: true })
  fs.appendFileSync(options.historyPath, `${JSON.stringify(buildHistoryRecord(report, options))}\n`)
  console.log(`Platform export review history: ${options.historyPath}`)
}

if (report.warnings.length > 0 && (options.failOnRegression || (options.promote && !options.allowRegression))) {
  console.error('Platform export review refused regression warnings. Pass --allow-regression only after deliberate review.')
  process.exit(1)
}

if (options.promote) {
  fs.copyFileSync(options.candidatePath, options.currentPath)
  validateExport(options.currentPath)
  console.log(`Promoted platform export: ${options.candidatePath} -> ${options.currentPath}`)
}

function validateExport(filePath) {
  const result = spawnSync(process.execPath, ['scripts/import-platform-exports.mjs', filePath], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    process.exit(result.status ?? 1)
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function buildReport(current, candidate) {
  const report = {
    helios: {
      exportedAt: change(current.heliosStatusExport.exportedAt, candidate.heliosStatusExport.exportedAt),
      signals: listChange(
        current.heliosStatusExport.signals.map(item => item.label),
        candidate.heliosStatusExport.signals.map(item => item.label),
      ),
      datasets: listChange(
        current.heliosStatusExport.datasets.map(item => item.name),
        candidate.heliosStatusExport.datasets.map(item => item.name),
      ),
    },
    easyDb: {
      exportedAt: change(current.easyDbPublicSchemaExport.exportedAt, candidate.easyDbPublicSchemaExport.exportedAt),
      sourceLabel: change(current.easyDbPublicSchemaExport.sourceLabel, candidate.easyDbPublicSchemaExport.sourceLabel),
      tables: listChange(
        current.easyDbPublicSchemaExport.tables.map(tableKey),
        candidate.easyDbPublicSchemaExport.tables.map(tableKey),
      ),
      columnCount: change(
        countColumns(current.easyDbPublicSchemaExport.tables),
        countColumns(candidate.easyDbPublicSchemaExport.tables),
      ),
    },
  }
  report.warnings = collectWarnings(report)
  return report
}

function tableKey(table) {
  return `${table.schema}.${table.name}`
}

function countColumns(tables) {
  return tables.reduce((sum, table) => sum + table.columns.length, 0)
}

function change(before, after) {
  return { before, after, changed: before !== after }
}

function listChange(before, after) {
  const beforeSet = new Set(before)
  const afterSet = new Set(after)
  return {
    beforeCount: before.length,
    afterCount: after.length,
    added: after.filter(item => !beforeSet.has(item)),
    removed: before.filter(item => !afterSet.has(item)),
  }
}

function printReport(report, paths) {
  console.log(`Platform export candidate: ${paths.candidatePath}`)
  console.log(`Current export: ${paths.currentPath}`)
  printSection('Helios')
  printChange('exportedAt', report.helios.exportedAt)
  printListChange('signals', report.helios.signals)
  printListChange('datasets', report.helios.datasets)
  printSection('Easy DB')
  printChange('exportedAt', report.easyDb.exportedAt)
  printChange('sourceLabel', report.easyDb.sourceLabel)
  printChange('columnCount', report.easyDb.columnCount)
  printListChange('tables', report.easyDb.tables)
  printWarnings(report.warnings)
}

function printSection(title) {
  console.log(`\n${title}`)
}

function printChange(label, item) {
  const marker = item.changed ? 'changed' : 'same'
  console.log(`- ${label}: ${marker} (${item.before} -> ${item.after})`)
}

function printListChange(label, item) {
  console.log(`- ${label}: ${item.beforeCount} -> ${item.afterCount}`)
  if (item.added.length) console.log(`  added: ${item.added.join(', ')}`)
  if (item.removed.length) console.log(`  removed: ${item.removed.join(', ')}`)
}

function printWarnings(warnings) {
  if (warnings.length === 0) {
    console.log('\nReview warnings: none')
    return
  }
  console.log('\nReview warnings')
  for (const warning of warnings) {
    console.log(`- ${warning.area}: ${warning.message}`)
  }
}

function buildHistoryRecord(report, options) {
  return {
    recordedAt: new Date().toISOString(),
    candidatePath: options.candidatePath,
    currentPath: options.currentPath,
    promoteRequested: options.promote,
    allowRegression: options.allowRegression,
    failOnRegression: options.failOnRegression,
    warningCount: report.warnings.length,
    report,
  }
}

function collectWarnings(report) {
  return [
    ...dateWarnings('Helios', report.helios.exportedAt),
    ...countWarnings('Helios signals', report.helios.signals),
    ...countWarnings('Helios datasets', report.helios.datasets),
    ...dateWarnings('Easy DB', report.easyDb.exportedAt),
    ...scalarDecreaseWarnings('Easy DB column count', report.easyDb.columnCount),
    ...countWarnings('Easy DB tables', report.easyDb.tables),
  ]
}

function dateWarnings(area, item) {
  if (typeof item.before === 'string' && typeof item.after === 'string' && item.after < item.before) {
    return [{ area, message: `candidate export date moves backward (${item.before} -> ${item.after})` }]
  }
  return []
}

function scalarDecreaseWarnings(area, item) {
  if (Number(item.after) < Number(item.before)) {
    return [{ area, message: `candidate decreases ${area.toLowerCase()} (${item.before} -> ${item.after})` }]
  }
  return []
}

function countWarnings(area, item) {
  const warnings = []
  if (item.afterCount < item.beforeCount) {
    warnings.push({ area, message: `candidate removes entries (${item.beforeCount} -> ${item.afterCount})` })
  }
  if (item.removed.length) {
    warnings.push({ area, message: `removed: ${item.removed.join(', ')}` })
  }
  return warnings
}

function parseArgs(args) {
  const options = {
    allowRegression: false,
    candidatePath: DEFAULT_CANDIDATE,
    currentPath: DEFAULT_CURRENT,
    failOnRegression: false,
    historyPath: '',
    jsonPath: '',
    promote: false,
    selfTest: false,
  }
  const paths = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--allow-regression') {
      options.allowRegression = true
    } else if (arg === '--fail-on-regression') {
      options.failOnRegression = true
    } else if (arg === '--history') {
      options.historyPath = requireValue(arg, args[index + 1])
      index += 1
    } else if (arg === '--json') {
      options.jsonPath = requireValue(arg, args[index + 1])
      index += 1
    } else if (arg === '--promote') {
      options.promote = true
    } else if (arg === '--self-test') {
      options.selfTest = true
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown argument: ${arg}`)
    } else {
      paths.push(arg)
    }
  }
  options.candidatePath = paths[0] ?? options.candidatePath
  options.currentPath = paths[1] ?? options.currentPath
  return options
}

function requireValue(arg, value) {
  if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`)
  return value
}

function pathDirname(filePath) {
  const index = filePath.lastIndexOf('/')
  return index === -1 ? '.' : filePath.slice(0, index)
}

function selfTest() {
  const current = {
    heliosStatusExport: {
      schemaVersion: 1,
      source: 'helios-public-status',
      exportedAt: '2026-06-30',
      signals: [
        { label: 'Engine', value: 'ready', detail: 'Public status.' },
        { label: 'Data gate', value: 'strict', detail: 'Public gate.' },
      ],
      datasets: [
        { name: 'Market data', coverage: 'complete summary', cadence: 'daily', gate: 'reviewed' },
        { name: 'Strategy candidates', coverage: 'curated summary', cadence: 'manual', gate: 'reviewed' },
      ],
    },
    easyDbPublicSchemaExport: {
      schemaVersion: 1,
      source: 'easy-db-public-schema',
      exportedAt: '2026-06-30',
      sourceLabel: 'current',
      safety: ['No private data.'],
      tables: [
        {
          schema: 'public',
          name: 'users',
          purpose: 'Accounts.',
          columns: [
            { name: 'id', type: 'uuid', nullable: false, note: 'Identifier.' },
            { name: 'email', type: 'text', nullable: false, note: 'Contact.' },
          ],
        },
        {
          schema: 'public',
          name: 'projects',
          purpose: 'Projects.',
          columns: [
            { name: 'id', type: 'uuid', nullable: false, note: 'Identifier.' },
          ],
        },
      ],
    },
  }
  const candidate = {
    ...current,
    heliosStatusExport: {
      ...current.heliosStatusExport,
      exportedAt: '2026-06-29',
      signals: current.heliosStatusExport.signals.slice(0, 1),
      datasets: current.heliosStatusExport.datasets.slice(0, 1),
    },
    easyDbPublicSchemaExport: {
      ...current.easyDbPublicSchemaExport,
      tables: current.easyDbPublicSchemaExport.tables.slice(0, 1),
    },
  }
  const cleanReport = buildReport(current, current)
  if (cleanReport.warnings.length !== 0) throw new Error('self-test clean report should not warn')
  const regressionReport = buildReport(current, candidate)
  if (regressionReport.warnings.length < 4) throw new Error('self-test regression report should warn')
  console.log('Platform export review self-test passed')
}
