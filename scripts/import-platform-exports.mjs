#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_EXPORT_PATH = 'src/platformExports.generated.json'
const [inputArg, outputArg] = process.argv.slice(2)
const inputPath = inputArg ?? DEFAULT_EXPORT_PATH
const outputPath = outputArg

const text = fs.readFileSync(inputPath, 'utf8')
const exportBundle = JSON.parse(text)

validateBundle(exportBundle)

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(exportBundle, null, 2)}\n`)
  console.log(`Platform export imported: ${outputPath}`)
} else {
  console.log(`Platform export valid: ${inputPath}`)
}

function validateBundle(value) {
  assertPlainObject(value, 'export bundle')
  validateNoForbiddenKeys(value)
  validateNoPrivateText(value)
  validateHelios(value.heliosStatusExport)
  validateEasyDb(value.easyDbPublicSchemaExport)
}

function validateHelios(value) {
  assertPlainObject(value, 'heliosStatusExport')
  assertEqual(value.schemaVersion, 1, 'heliosStatusExport.schemaVersion')
  assertEqual(value.source, 'helios-public-status', 'heliosStatusExport.source')
  assertNonEmptyString(value.exportedAt, 'heliosStatusExport.exportedAt')
  assertNonEmptyArray(value.signals, 'heliosStatusExport.signals')
  assertNonEmptyArray(value.datasets, 'heliosStatusExport.datasets')

  for (const [index, signal] of value.signals.entries()) {
    assertPlainObject(signal, `heliosStatusExport.signals[${index}]`)
    assertNonEmptyString(signal.label, `heliosStatusExport.signals[${index}].label`)
    assertNonEmptyString(signal.value, `heliosStatusExport.signals[${index}].value`)
    assertNonEmptyString(signal.detail, `heliosStatusExport.signals[${index}].detail`)
  }

  for (const [index, dataset] of value.datasets.entries()) {
    assertPlainObject(dataset, `heliosStatusExport.datasets[${index}]`)
    assertNonEmptyString(dataset.name, `heliosStatusExport.datasets[${index}].name`)
    assertNonEmptyString(dataset.coverage, `heliosStatusExport.datasets[${index}].coverage`)
    assertNonEmptyString(dataset.cadence, `heliosStatusExport.datasets[${index}].cadence`)
    assertNonEmptyString(dataset.gate, `heliosStatusExport.datasets[${index}].gate`)
  }
}

function validateEasyDb(value) {
  assertPlainObject(value, 'easyDbPublicSchemaExport')
  assertEqual(value.schemaVersion, 1, 'easyDbPublicSchemaExport.schemaVersion')
  assertEqual(value.source, 'easy-db-public-schema', 'easyDbPublicSchemaExport.source')
  assertNonEmptyString(value.exportedAt, 'easyDbPublicSchemaExport.exportedAt')
  assertNonEmptyString(value.sourceLabel, 'easyDbPublicSchemaExport.sourceLabel')
  assertNonEmptyArray(value.safety, 'easyDbPublicSchemaExport.safety')
  assertNonEmptyArray(value.tables, 'easyDbPublicSchemaExport.tables')

  for (const [index, item] of value.safety.entries()) {
    assertNonEmptyString(item, `easyDbPublicSchemaExport.safety[${index}]`)
  }

  for (const [tableIndex, table] of value.tables.entries()) {
    assertPlainObject(table, `easyDbPublicSchemaExport.tables[${tableIndex}]`)
    assertNonEmptyString(table.schema, `easyDbPublicSchemaExport.tables[${tableIndex}].schema`)
    assertNonEmptyString(table.name, `easyDbPublicSchemaExport.tables[${tableIndex}].name`)
    assertNonEmptyString(table.purpose, `easyDbPublicSchemaExport.tables[${tableIndex}].purpose`)
    assertNonEmptyArray(table.columns, `easyDbPublicSchemaExport.tables[${tableIndex}].columns`)

    for (const [columnIndex, column] of table.columns.entries()) {
      const prefix = `easyDbPublicSchemaExport.tables[${tableIndex}].columns[${columnIndex}]`
      assertPlainObject(column, prefix)
      assertNonEmptyString(column.name, `${prefix}.name`)
      assertNonEmptyString(column.type, `${prefix}.type`)
      assertBoolean(column.nullable, `${prefix}.nullable`)
      assertNonEmptyString(column.note, `${prefix}.note`)
      if ('primary' in column) assertBoolean(column.primary, `${prefix}.primary`)
      if ('foreign' in column) {
        assertPlainObject(column.foreign, `${prefix}.foreign`)
        assertNonEmptyString(column.foreign.table, `${prefix}.foreign.table`)
        assertNonEmptyString(column.foreign.column, `${prefix}.foreign.column`)
      }
    }
  }
}

function validateNoPrivateText(value) {
  const serialized = JSON.stringify(value)
  const leakPatterns = [
    /\/Users\/cash/i,
    /codex/i,
    /GH_ACTION/i,
    /algorithm_assistant_deploy/i,
    /db_profiles/i,
    /amazonaws/i,
    /bk_crm/i,
    /34\.80\./,
    /postgres(?:ql)?:\/\//i,
    /mysql:\/\//i,
    /mongodb:\/\//i,
    /BEGIN [A-Z ]*PRIVATE KEY/i,
    /(?:password|secret|token|apikey|api_key)\s*=/i,
  ]
  for (const pattern of leakPatterns) {
    if (pattern.test(serialized)) {
      throw new Error(`Platform export contains private text matching ${pattern}`)
    }
  }
}

function validateNoForbiddenKeys(value) {
  const forbiddenKeys = new Set([
    'password',
    'passwordhash',
    'secret',
    'token',
    'apikey',
    'privatekey',
    'sshkey',
    'connectionstring',
    'dsn',
    'host',
    'hostname',
    'rows',
    'samples',
    'rowsample',
    'rowsamples',
  ])
  walkObject(value, (key) => {
    const normalized = key.replace(/[-_]/g, '').toLowerCase()
    if (forbiddenKeys.has(normalized)) {
      throw new Error(`Platform export contains forbidden key: ${key}`)
    }
  })
}

function walkObject(value, visitKey) {
  if (Array.isArray(value)) {
    for (const item of value) walkObject(item, visitKey)
    return
  }
  if (!isPlainObject(value)) return
  for (const [key, child] of Object.entries(value)) {
    visitKey(key)
    walkObject(child, visitKey)
  }
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) throw new Error(`${label} must be an object`)
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function assertNonEmptyArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array`)
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`)
}

function assertBoolean(value, label) {
  if (typeof value !== 'boolean') throw new Error(`${label} must be a boolean`)
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} must equal ${JSON.stringify(expected)}`)
}
