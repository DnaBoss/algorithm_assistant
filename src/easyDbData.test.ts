import { describe, expect, it } from 'vitest'
import { easyDbExampleSchema, filterEasyDbTables } from './easyDbData'

describe('easy db table filtering', () => {
  it('returns every table when query is blank', () => {
    expect(filterEasyDbTables(easyDbExampleSchema, '')).toHaveLength(easyDbExampleSchema.length)
  })

  it('matches table names, columns, and relation targets', () => {
    expect(filterEasyDbTables(easyDbExampleSchema, 'project_notes').map(table => table.name)).toEqual(['project_notes'])
    expect(filterEasyDbTables(easyDbExampleSchema, 'owner_id').map(table => table.name)).toEqual(['projects'])
    expect(filterEasyDbTables(easyDbExampleSchema, 'users').map(table => table.name)).toEqual(['users', 'projects'])
  })
})
