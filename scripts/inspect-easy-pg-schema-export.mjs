#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const DEFAULT_INPUT = '.platform-local/easy-pg-schema.local.json'
const DEFAULT_TABLES_FILE = '.platform-local/easy-pg-public-tables.local.txt'
const sensitiveNamePattern = /(address|birth|card|credential|email|identity|invoice|name|password|phone|secret|token)/i

const options = parseArgs(process.argv.slice(2))

if (options.selfTest) {
  selfTest()
  process.exit(0)
}

const source = readJson(options.input)
const allowList = readAllowList(options.tablesFile)
const summary = summarize(source, allowList)
printSummary(summary)

if (options.jsonPath) {
  fs.mkdirSync(path.dirname(options.jsonPath), { recursive: true })
  fs.writeFileSync(options.jsonPath, `${JSON.stringify(summary, null, 2)}\n`)
  console.log(`Easy PG schema summary JSON: ${options.jsonPath}`)
}

function summarize(source, allowList) {
  if (!source || typeof source !== 'object' || !Array.isArray(source.tables)) {
    throw new Error('Easy PG schema export must be an object with a tables array')
  }
  const allowSet = new Set(allowList)
  const tables = source.tables.map(table => {
    const key = tableKey(table)
    const columns = Array.isArray(table.columns) ? table.columns : []
    const sensitiveColumns = columns
      .map(column => String(column.name ?? ''))
      .filter(name => sensitiveNamePattern.test(name))
    return {
      key,
      schema: String(table.schema ?? ''),
      name: String(table.name ?? ''),
      columnCount: columns.length,
      allowListed: allowSet.has(key),
      sensitiveColumnHints: sensitiveColumns,
    }
  }).sort((left, right) => left.key.localeCompare(right.key))

  return {
    tableCount: tables.length,
    allowListedCount: tables.filter(table => table.allowListed).length,
    missingAllowListEntries: allowList.filter(key => !tables.some(table => table.key === key)),
    sensitiveTableCount: tables.filter(table => table.sensitiveColumnHints.length > 0).length,
    tables,
  }
}

function printSummary(summary) {
  console.log('Easy PG schema export summary')
  console.log(`- tables: ${summary.tableCount}`)
  console.log(`- allow-listed tables: ${summary.allowListedCount}`)
  console.log(`- tables with sensitive-name hints: ${summary.sensitiveTableCount}`)
  if (summary.missingAllowListEntries.length) {
    console.log(`- missing allow-list entries: ${summary.missingAllowListEntries.join(', ')}`)
  }
  for (const table of summary.tables) {
    const marker = table.allowListed ? 'allow' : 'skip'
    const hints = table.sensitiveColumnHints.length ? `; sensitive-name hints: ${table.sensitiveColumnHints.join(', ')}` : ''
    console.log(`- ${marker}: ${table.key} (${table.columnCount} columns${hints})`)
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readAllowList(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return []
  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.replace(/#.*/, '').trim())
    .filter(Boolean)
}

function tableKey(table) {
  return `${String(table.schema ?? '').trim()}.${String(table.name ?? '').trim()}`
}

function parseArgs(args) {
  const options = {
    input: DEFAULT_INPUT,
    jsonPath: '',
    selfTest: false,
    tablesFile: DEFAULT_TABLES_FILE,
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--input') {
      options.input = requireValue(arg, args[index + 1])
      index += 1
    } else if (arg === '--json') {
      options.jsonPath = requireValue(arg, args[index + 1])
      index += 1
    } else if (arg === '--tables-file') {
      options.tablesFile = requireValue(arg, args[index + 1])
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exactlyone-easy-pg-inspect-'))
  const input = path.join(tempDir, 'schema.json')
  const tablesFile = path.join(tempDir, 'tables.txt')
  fs.writeFileSync(input, `${JSON.stringify({
    tables: [
      { schema: 'public', name: 'users', columns: [{ name: 'id' }, { name: 'email' }] },
      { schema: 'public', name: 'projects', columns: [{ name: 'id' }] },
    ],
  })}\n`)
  fs.writeFileSync(tablesFile, 'public.projects\npublic.missing\n')
  const summary = summarize(readJson(input), readAllowList(tablesFile))
  if (summary.tableCount !== 2) throw new Error('self-test table count mismatch')
  if (summary.allowListedCount !== 1) throw new Error('self-test allow-list count mismatch')
  if (summary.missingAllowListEntries[0] !== 'public.missing') throw new Error('self-test missing allow-list mismatch')
  if (summary.sensitiveTableCount !== 1) throw new Error('self-test sensitive hint mismatch')
  fs.rmSync(tempDir, { recursive: true, force: true })
  console.log('Easy PG schema inspection self-test passed')
}
