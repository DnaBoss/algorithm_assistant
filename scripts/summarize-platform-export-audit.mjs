#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DEFAULT_HISTORY = '.platform-local/platform-review-history.local.jsonl'
const options = parseArgs(process.argv.slice(2))

if (options.selfTest) {
  selfTest()
  process.exit(0)
}

const records = readHistory(options.historyPath)
const summary = summarize(records, options.historyPath)
printSummary(summary)

if (options.jsonPath) {
  fs.mkdirSync(path.dirname(options.jsonPath), { recursive: true })
  fs.writeFileSync(options.jsonPath, `${JSON.stringify(summary, null, 2)}\n`)
  console.log(`Platform export audit summary JSON: ${options.jsonPath}`)
}

function readHistory(historyPath) {
  if (!fs.existsSync(historyPath)) return []
  return fs.readFileSync(historyPath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line)
      } catch (error) {
        throw new Error(`Invalid JSONL at ${historyPath}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`)
      }
    })
}

function summarize(records, historyPath) {
  const latest = records.at(-1) ?? null
  const warningRecords = records.filter(record => Number(record.warningCount ?? record.report?.warnings?.length ?? 0) > 0)
  const cleanRecords = records.filter(record => Number(record.warningCount ?? record.report?.warnings?.length ?? 0) === 0)

  return {
    historyPath,
    totalReviews: records.length,
    reviewsWithWarnings: warningRecords.length,
    cleanReviews: cleanRecords.length,
    latest: latest ? {
      recordedAt: latest.recordedAt ?? '',
      candidatePath: latest.candidatePath ?? '',
      currentPath: latest.currentPath ?? '',
      warningCount: Number(latest.warningCount ?? latest.report?.warnings?.length ?? 0),
      warnings: Array.isArray(latest.report?.warnings) ? latest.report.warnings : [],
    } : null,
    lastCleanAt: cleanRecords.at(-1)?.recordedAt ?? '',
    lastWarningAt: warningRecords.at(-1)?.recordedAt ?? '',
  }
}

function printSummary(summary) {
  console.log(`Platform export audit history: ${summary.historyPath}`)
  console.log(`- total reviews: ${summary.totalReviews}`)
  console.log(`- reviews with warnings: ${summary.reviewsWithWarnings}`)
  console.log(`- clean reviews: ${summary.cleanReviews}`)
  if (!summary.latest) {
    console.log('- latest: none')
    return
  }
  console.log(`- latest: ${summary.latest.recordedAt || 'unknown time'}`)
  console.log(`  candidate: ${summary.latest.candidatePath}`)
  console.log(`  warning count: ${summary.latest.warningCount}`)
  for (const warning of summary.latest.warnings) {
    console.log(`  warning: ${warning.area}: ${warning.message}`)
  }
}

function parseArgs(args) {
  const options = {
    historyPath: DEFAULT_HISTORY,
    jsonPath: '',
    selfTest: false,
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--history') {
      options.historyPath = requireValue(arg, args[index + 1])
      index += 1
    } else if (arg === '--json') {
      options.jsonPath = requireValue(arg, args[index + 1])
      index += 1
    } else if (arg === '--self-test') {
      options.selfTest = true
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

function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exactlyone-platform-audit-'))
  const historyPath = path.join(tempDir, 'history.jsonl')
  const clean = {
    recordedAt: '2026-06-30T00:00:00.000Z',
    candidatePath: 'src/platformExports.generated.json',
    currentPath: 'src/platformExports.generated.json',
    warningCount: 0,
    report: { warnings: [] },
  }
  const warned = {
    recordedAt: '2026-06-30T01:00:00.000Z',
    candidatePath: '.platform-local/platform-candidate.local.json',
    currentPath: 'src/platformExports.generated.json',
    warningCount: 1,
    report: { warnings: [{ area: 'Helios datasets', message: 'candidate removes entries (3 -> 1)' }] },
  }
  fs.writeFileSync(historyPath, `${JSON.stringify(clean)}\n${JSON.stringify(warned)}\n`)
  const summary = summarize(readHistory(historyPath), historyPath)
  if (summary.totalReviews !== 2) throw new Error('self-test totalReviews mismatch')
  if (summary.reviewsWithWarnings !== 1) throw new Error('self-test reviewsWithWarnings mismatch')
  if (summary.latest?.warningCount !== 1) throw new Error('self-test latest warning mismatch')
  if (summary.lastCleanAt !== clean.recordedAt) throw new Error('self-test lastCleanAt mismatch')
  fs.rmSync(tempDir, { recursive: true, force: true })
  console.log('Platform export audit summary self-test passed')
}
