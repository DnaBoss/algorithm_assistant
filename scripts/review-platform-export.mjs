#!/usr/bin/env node
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const DEFAULT_CURRENT = 'src/platformExports.generated.json'
const DEFAULT_CANDIDATE = '.platform-local/platform-candidate.local.json'
const args = process.argv.slice(2)
const promote = args.includes('--promote')
const paths = args.filter(arg => arg !== '--promote')
const candidatePath = paths[0] ?? DEFAULT_CANDIDATE
const currentPath = paths[1] ?? DEFAULT_CURRENT

validateExport(candidatePath)
const current = readJson(currentPath)
const candidate = readJson(candidatePath)
const report = buildReport(current, candidate)

printReport(report, { currentPath, candidatePath })

if (promote) {
  fs.copyFileSync(candidatePath, currentPath)
  validateExport(currentPath)
  console.log(`Promoted platform export: ${candidatePath} -> ${currentPath}`)
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
  return {
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
