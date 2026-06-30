import platformExports from './platformExports.generated.json'

export type EasyDbColumn = {
  name: string
  type: string
  nullable: boolean
  primary?: boolean
  foreign?: {
    table: string
    column: string
  }
  note: string
}

export type EasyDbTable = {
  schema: string
  name: string
  purpose: string
  columns: EasyDbColumn[]
}

export type EasyDbSchemaExport = {
  schemaVersion: 1
  source: 'easy-db-public-schema'
  exportedAt: string
  sourceLabel: string
  safety: string[]
  tables: EasyDbTable[]
}

export type EasyDbCapability = {
  label: string
  title: string
  summary: string
}

export const easyDbCapabilities: EasyDbCapability[] = [
  {
    label: 'Snapshot',
    title: 'Schema snapshot',
    summary: 'Read tables, columns, primary keys, foreign keys, and nullability into a compact view.',
  },
  {
    label: 'Search',
    title: 'Column search',
    summary: 'Find phone, user, order, or id columns across schemas before writing a query.',
  },
  {
    label: 'Export',
    title: 'Schema export',
    summary: 'Export sanitized schema notes for later query writing without exposing live credentials.',
  },
  {
    label: 'Admin',
    title: 'Private operations',
    summary: 'Connection profiles, SSH tunnel, SQL import, and data access stay behind owner login.',
  },
]

export const easyDbWorkflow = [
  'Choose a saved profile inside the private admin boundary.',
  'Export schema metadata without table data.',
  'Use the public browser to inspect tables, keys, and relationships.',
  'Promote useful query notes into Blog or Easy DB articles.',
]

export const easyDbPublicSchemaExport = platformExports.easyDbPublicSchemaExport as EasyDbSchemaExport

export const easyDbExampleSchema: EasyDbTable[] = easyDbPublicSchemaExport.tables

export function filterEasyDbTables(tables: EasyDbTable[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return tables

  return tables.filter(table => {
    const haystack = [
      table.schema,
      table.name,
      table.purpose,
      ...table.columns.flatMap(column => [
        column.name,
        column.type,
        column.note,
        column.foreign?.table ?? '',
        column.foreign?.column ?? '',
      ]),
    ].join(' ').toLowerCase()

    return haystack.includes(normalized)
  })
}

export function publicEasyDbText() {
  return [
    easyDbPublicSchemaExport.source,
    easyDbPublicSchemaExport.exportedAt,
    easyDbPublicSchemaExport.sourceLabel,
    ...easyDbPublicSchemaExport.safety,
    ...easyDbPublicSchemaExport.tables.flatMap(table => [
      table.schema,
      table.name,
      table.purpose,
      ...table.columns.flatMap(column => [
        column.name,
        column.type,
        column.note,
        column.foreign?.table ?? '',
        column.foreign?.column ?? '',
      ]),
    ]),
  ].join(' ')
}
