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
loadTableAllowList(options)

const source = JSON.parse(fs.readFileSync(options.input, 'utf8'))
const currentBundle = JSON.parse(fs.readFileSync(options.bundle, 'utf8'))
const nextBundle = {
  ...currentBundle,
  easyDbPublicSchemaExport: easyPgSchemaToPublicExport(source, options),
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
console.log(`Easy PG schema imported: ${options.output}`)

function easyPgSchemaToPublicExport(source, options) {
  if (!source || typeof source !== 'object' || !Array.isArray(source.tables)) {
    throw new Error('Easy PG export must be an object with a tables array')
  }
  if (options.tables.length === 0) {
    throw new Error('At least one --table schema.table allow-list entry is required')
  }

  const allowed = new Set(options.tables)
  const sourceTables = source.tables.filter(table => allowed.has(tableKey(table.schema, table.name)))
  if (sourceTables.length !== allowed.size) {
    const found = new Set(sourceTables.map(table => tableKey(table.schema, table.name)))
    const missing = [...allowed].filter(key => !found.has(key))
    throw new Error(`Allow-listed table not found in Easy PG export: ${missing.join(', ')}`)
  }

  const publicTables = sourceTables.map(table => {
    const columns = asArray(table.columns).map(column => {
      const publicColumn = {
        name: asNonEmptyString(column.name, `${table.name}.columns.name`),
        type: publicColumnType(column),
        nullable: columnNullable(column),
        note: 'Source-derived schema column.',
      }
      if (toBoolean(column.is_primary_key)) publicColumn.primary = true
      const foreign = publicForeignKey(column, allowed)
      if (foreign) publicColumn.foreign = foreign
      return publicColumn
    })
    if (columns.length === 0) throw new Error(`Allow-listed table has no columns: ${tableKey(table.schema, table.name)}`)
    return {
      schema: asNonEmptyString(table.schema, 'table.schema'),
      name: asNonEmptyString(table.name, 'table.name'),
      purpose: 'Source-derived schema table.',
      columns,
    }
  })

  return {
    schemaVersion: 1,
    source: 'easy-db-public-schema',
    exportedAt: options.exportedAt,
    sourceLabel: options.sourceLabel,
    safety: [
      'Generated from an Easy PG schema export with an explicit table allow-list.',
      'No row data, default values, connection profiles, SSH tunnel details, or hostnames are included.',
      'Only schema names, table names, column metadata, relationship hints, and public notes are emitted.',
    ],
    tables: publicTables,
  }
}

function publicForeignKey(column, allowed) {
  const table = typeof column.foreign_table === 'string' ? column.foreign_table.trim() : ''
  const targetColumn = typeof column.foreign_column === 'string' ? column.foreign_column.trim() : ''
  const schema = typeof column.foreign_table_schema === 'string' && column.foreign_table_schema.trim()
    ? column.foreign_table_schema.trim()
    : 'public'
  if (!table || !targetColumn || !allowed.has(tableKey(schema, table))) return null
  return { table, column: targetColumn }
}

function publicColumnType(column) {
  const type = typeof column.data_type === 'string' && column.data_type.trim()
    ? column.data_type.trim()
    : column.udt_name
  return asNonEmptyString(type, 'column.type')
}

function columnNullable(column) {
  if (typeof column.nullable === 'boolean') return column.nullable
  if (typeof column.nullable === 'string') return column.nullable.toUpperCase() === 'YES'
  return false
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return ['YES', 'TRUE', '1'].includes(value.toUpperCase())
  return Boolean(value)
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function asNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`)
  return value.trim()
}

function tableKey(schema, name) {
  return `${asNonEmptyString(schema, 'schema')}.${asNonEmptyString(name, 'table')}`
}

function parseArgs(args) {
  const options = {
    bundle: 'src/platformExports.generated.json',
    exportedAt: new Date().toISOString().slice(0, 10),
    input: '',
    output: '',
    sourceLabel: 'source-derived Easy PG export',
    tables: [],
    tablesFile: '',
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
    } else if (arg === '--source-label') {
      options.sourceLabel = requireValue(arg, next)
      index += 1
    } else if (arg === '--exported-at') {
      options.exportedAt = requireValue(arg, next)
      index += 1
    } else if (arg === '--table') {
      options.tables.push(requireValue(arg, next))
      index += 1
    } else if (arg === '--tables-file') {
      options.tablesFile = requireValue(arg, next)
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return options
}

function loadTableAllowList(options) {
  if (!options.tablesFile) return
  const file = fs.readFileSync(options.tablesFile, 'utf8')
  const tables = file
    .split(/\r?\n/)
    .map(line => line.replace(/#.*/, '').trim())
    .filter(Boolean)
  options.tables.push(...tables)
}

function requireValue(arg, value) {
  if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`)
  return value
}

function usage() {
  console.error([
    'Usage:',
    '  node scripts/easy-pg-schema-to-platform-export.mjs --input easy-pg-export.json --output src/platformExports.generated.json --table public.users',
    '',
    'Options:',
    '  --bundle path          Existing platform bundle to preserve Helios data.',
    '  --source-label text    Public label for the sanitized source.',
    '  --exported-at date     Export date, default today.',
    '  --table schema.table   Explicit allow-list entry. Repeat for multiple tables.',
    '  --tables-file path     Newline-separated allow-list. Blank lines and # comments are ignored.',
  ].join('\n'))
}

function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exactlyone-easy-pg-'))
  const input = path.join(tempDir, 'easy-pg.json')
  const output = path.join(tempDir, 'platform.json')
  const tablesFile = path.join(tempDir, 'tables.local.txt')
  fs.writeFileSync(input, `${JSON.stringify({
    tables: [
      {
        schema: 'public',
        name: 'users',
        columns: [
          { name: 'id', data_type: 'uuid', nullable: false, is_primary_key: true },
          { name: 'email', data_type: 'text', nullable: false, default: 'private default ignored' },
        ],
      },
      {
        schema: 'public',
        name: 'projects',
        columns: [
          { name: 'id', data_type: 'uuid', nullable: false, is_primary_key: true },
          {
            name: 'owner_id',
            data_type: 'uuid',
            nullable: false,
            is_foreign_key: true,
            foreign_table_schema: 'public',
            foreign_table: 'users',
            foreign_column: 'id',
          },
        ],
      },
    ],
  }, null, 2)}\n`)
  fs.writeFileSync(tablesFile, '# public allow-list\npublic.users\npublic.projects\n')

  const result = spawnSync(process.execPath, [
    'scripts/easy-pg-schema-to-platform-export.mjs',
    '--input',
    input,
    '--output',
    output,
    '--exported-at',
    '2026-06-30',
    '--source-label',
    'self-test export',
    '--tables-file',
    tablesFile,
  ], { cwd: process.cwd(), encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.stderr.write(result.stdout)
    throw new Error('self-test conversion failed')
  }
  const converted = JSON.parse(fs.readFileSync(output, 'utf8'))
  const projects = converted.easyDbPublicSchemaExport.tables.find(table => table.name === 'projects')
  const owner = projects.columns.find(column => column.name === 'owner_id')
  if (owner.foreign?.table !== 'users') throw new Error('self-test foreign key was not preserved')
  if (JSON.stringify(converted).includes('private default ignored')) throw new Error('self-test leaked default value')
  fs.rmSync(tempDir, { recursive: true, force: true })
  console.log('Easy PG schema importer self-test passed')
}
