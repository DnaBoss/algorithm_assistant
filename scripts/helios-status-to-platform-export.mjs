#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  selfTest()
  process.exit(0)
}

const options = parseArgs(args)
if (!options.input || !options.output) {
  usage()
  process.exit(1)
}

const source = JSON.parse(fs.readFileSync(options.input, 'utf8'))
const currentBundle = JSON.parse(fs.readFileSync(options.bundle, 'utf8'))
const nextBundle = {
  ...currentBundle,
  heliosStatusExport: heliosStatusToPublicExport(source, options),
}

fs.mkdirSync(path.dirname(options.output), { recursive: true })
fs.writeFileSync(options.output, `${JSON.stringify(nextBundle, null, 2)}\n`)

const validation = spawnSync(process.execPath, ['scripts/import-platform-exports.mjs', options.output], {
  cwd: process.cwd(),
  encoding: 'utf8',
})
if (validation.status !== 0) {
  process.stderr.write(validation.stderr)
  process.stderr.write(validation.stdout)
  process.exit(validation.status ?? 1)
}
process.stdout.write(validation.stdout)
console.log(`Helios status imported: ${options.output}`)

function heliosStatusToPublicExport(source, options) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('Helios status export must be an object')
  }
  const signals = normalizeSignals(source.signals)
  const datasets = normalizeDatasets(source.datasets)
  return {
    schemaVersion: 1,
    source: 'helios-public-status',
    exportedAt: options.exportedAt,
    signals,
    datasets,
  }
}

function normalizeSignals(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Helios status export requires a non-empty signals array')
  }
  return value.map((signal, index) => {
    assertPlainObject(signal, `signals[${index}]`)
    return {
      label: publicText(signal.label, `signals[${index}].label`),
      value: publicText(signal.value, `signals[${index}].value`),
      detail: publicText(signal.detail, `signals[${index}].detail`),
    }
  })
}

function normalizeDatasets(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('Helios status export requires a non-empty datasets array')
  }
  return value.map((dataset, index) => {
    assertPlainObject(dataset, `datasets[${index}]`)
    return {
      name: publicText(dataset.name, `datasets[${index}].name`),
      coverage: publicText(dataset.coverage, `datasets[${index}].coverage`),
      cadence: publicText(dataset.cadence, `datasets[${index}].cadence`),
      gate: publicText(dataset.gate, `datasets[${index}].gate`),
    }
  })
}

function publicText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`)
  return value.trim()
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
}

function parseArgs(args) {
  const options = {
    bundle: 'src/platformExports.generated.json',
    exportedAt: new Date().toISOString().slice(0, 10),
    input: '',
    output: '',
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    const next = args[index + 1]
    if (arg === '--input') {
      options.input = requireValue(arg, next)
      index += 1
    } else if (arg === '--output') {
      options.output = requireValue(arg, next)
      index += 1
    } else if (arg === '--bundle') {
      options.bundle = requireValue(arg, next)
      index += 1
    } else if (arg === '--exported-at') {
      options.exportedAt = requireValue(arg, next)
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return options
}

function requireValue(arg, value) {
  if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`)
  return value
}

function usage() {
  console.error([
    'Usage:',
    '  node scripts/helios-status-to-platform-export.mjs --input helios-status.local.json --output src/platformExports.generated.json',
    '',
    'Expected input:',
    '  { "signals": [{ "label": "...", "value": "...", "detail": "..." }], "datasets": [{ "name": "...", "coverage": "...", "cadence": "...", "gate": "..." }] }',
  ].join('\n'))
}

function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exactlyone-helios-'))
  const input = path.join(tempDir, 'helios-status.json')
  const output = path.join(tempDir, 'platform.json')
  fs.writeFileSync(input, `${JSON.stringify({
    signals: [
      { label: 'Engine', value: 'ready', detail: 'Backtest engine status is summarized for public viewing.' },
      { label: 'Data gate', value: 'strict', detail: 'Datasets require session-aware completeness checks.' },
    ],
    datasets: [
      { name: 'Market data', coverage: 'curated status only', cadence: 'manual export', gate: 'no raw logs or private operations' },
    ],
  }, null, 2)}\n`)

  const result = spawnSync(process.execPath, [
    'scripts/helios-status-to-platform-export.mjs',
    '--input',
    input,
    '--output',
    output,
    '--exported-at',
    '2026-06-30',
  ], { cwd: process.cwd(), encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    throw new Error('self-test conversion failed')
  }
  const converted = JSON.parse(fs.readFileSync(output, 'utf8'))
  if (converted.heliosStatusExport.signals.length !== 2) throw new Error('self-test signals were not preserved')
  if (converted.heliosStatusExport.datasets[0].name !== 'Market data') throw new Error('self-test dataset was not preserved')
  fs.rmSync(tempDir, { recursive: true, force: true })
  console.log('Helios status importer self-test passed')
}
