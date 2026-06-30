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

export const easyDbExampleSchema: EasyDbTable[] = [
  {
    schema: 'public',
    name: 'users',
    purpose: 'Account identity and profile entry point.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primary: true, note: 'Stable account id.' },
      { name: 'email', type: 'text', nullable: false, note: 'Login and contact address.' },
      { name: 'display_name', type: 'text', nullable: false, note: 'Public-facing name.' },
      { name: 'created_at', type: 'timestamptz', nullable: false, note: 'Creation timestamp.' },
    ],
  },
  {
    schema: 'public',
    name: 'projects',
    purpose: 'Owned workspaces, experiments, or products.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primary: true, note: 'Stable project id.' },
      { name: 'owner_id', type: 'uuid', nullable: false, foreign: { table: 'users', column: 'id' }, note: 'Project owner.' },
      { name: 'name', type: 'text', nullable: false, note: 'Project display name.' },
      { name: 'status', type: 'text', nullable: false, note: 'Draft, active, archived, or similar lifecycle state.' },
      { name: 'updated_at', type: 'timestamptz', nullable: false, note: 'Last update timestamp.' },
    ],
  },
  {
    schema: 'public',
    name: 'project_notes',
    purpose: 'Notes attached to a project or research thread.',
    columns: [
      { name: 'id', type: 'uuid', nullable: false, primary: true, note: 'Stable note id.' },
      { name: 'project_id', type: 'uuid', nullable: false, foreign: { table: 'projects', column: 'id' }, note: 'Parent project.' },
      { name: 'title', type: 'text', nullable: false, note: 'Short note title.' },
      { name: 'body', type: 'jsonb', nullable: false, note: 'Structured content blocks.' },
      { name: 'published_at', type: 'timestamptz', nullable: true, note: 'Null means private draft.' },
    ],
  },
]

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
