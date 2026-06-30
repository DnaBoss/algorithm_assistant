import { describe, expect, it } from 'vitest'
import { easyDbExampleSchema, easyDbPublicSchemaExport, filterEasyDbTables, publicEasyDbText } from './easyDbData'

describe('easy db table filtering', () => {
  it('returns every table when query is blank', () => {
    expect(filterEasyDbTables(easyDbExampleSchema, '')).toHaveLength(easyDbExampleSchema.length)
  })

  it('matches table names, columns, and relation targets', () => {
    expect(filterEasyDbTables(easyDbExampleSchema, 'project_notes').map(table => table.name)).toEqual(['project_notes'])
    expect(filterEasyDbTables(easyDbExampleSchema, 'owner_id').map(table => table.name)).toEqual(['projects'])
    expect(filterEasyDbTables(easyDbExampleSchema, 'users').map(table => table.name)).toEqual(['users', 'projects'])
  })

  it('defines a sanitized public schema export contract', () => {
    expect(easyDbPublicSchemaExport.schemaVersion).toBe(1)
    expect(easyDbPublicSchemaExport.source).toBe('easy-db-public-schema')
    expect(easyDbPublicSchemaExport.tables).toBe(easyDbExampleSchema)
    expect(easyDbPublicSchemaExport.safety.length).toBeGreaterThanOrEqual(3)
  })

  it('keeps public schema text free of private connection details', () => {
    const localHome = ['/', 'Users', '/cash'].join('')
    const cloudHost = ['amazon', 'aws'].join('')
    const publicIp = ['34', '80', '62', '251'].join('\\.')
    expect(publicEasyDbText()).not.toMatch(new RegExp(`${localHome}|password|secret|token|apikey|private key|${cloudHost}|${publicIp}`, 'i'))
  })
})
