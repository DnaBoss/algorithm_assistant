# Platform Export Contracts

ExactlyOne can show public data from Helios and Easy DB only after the data is
converted into a safe export shape.

Current frontend bundle: `src/platformExports.generated.json`.

Import and validation tool: `scripts/import-platform-exports.mjs`.

## Shared Rules

- Exports are read-only inputs for the public site.
- Exports must not include hostnames, connection strings, keys, raw logs, table
  rows, trade actions, or write-operation controls.
- Exports should use stable schema versions so the frontend can reject unknown
  shapes before public release.
- Source systems keep operational logic. ExactlyOne owns public rendering,
  access boundaries, and published copy.
- A candidate bundle must include both `heliosStatusExport` and
  `easyDbPublicSchemaExport`.

## Helios Public Status

Frontend source: `src/heliosData.ts`.

Current schema:

```ts
type HeliosStatusExport = {
  schemaVersion: 1
  source: 'helios-public-status'
  exportedAt: string
  signals: Array<{ label: string; value: string; detail: string }>
  datasets: Array<{ name: string; coverage: string; cadence: string; gate: string }>
}
```

Allowed content:

- Research infrastructure status.
- Dataset coverage summaries.
- Data-quality gates.
- Curated research notes.

Not allowed:

- Broker sessions.
- Raw operational logs.
- Trading credentials.
- Restart or write controls.
- Live order state.

## Easy DB Public Schema

Frontend source: `src/easyDbData.ts`.

Current schema:

```ts
type EasyDbSchemaExport = {
  schemaVersion: 1
  source: 'easy-db-public-schema'
  exportedAt: string
  sourceLabel: string
  safety: string[]
  tables: EasyDbTable[]
}
```

Allowed content:

- Schema names.
- Table names.
- Column names and types.
- Nullability, primary-key hints, and foreign-key hints.
- Human-written table and column notes.

Not allowed:

- Real connection profiles.
- Tunnel settings.
- Row data or samples.
- Production hostnames.
- Import or query execution controls.

## Verification

`npm run release:gate` remains the pre-release gate. It runs public leak scans,
frontend tests, API tests, frontend build, and API check before any manual
deployment.

Use the import tool before moving a candidate source export into the frontend:

```bash
node scripts/import-platform-exports.mjs candidate-platform-export.json src/platformExports.generated.json
```

For Easy PG schema exports, use the sanitizer with an explicit table allow-list.
The allow-list is required so private schemas are not published accidentally:

```bash
node scripts/easy-pg-schema-to-platform-export.mjs \
  --input easy-pg-schema-export.json \
  --output src/platformExports.generated.json \
  --source-label "public Easy PG schema export" \
  --table public.users \
  --table public.projects
```

Running the tool without arguments validates the current generated export:

```bash
npm run check:platform-exports
```

`npm run check:platform-exports` also runs the Easy PG sanitizer self-test.
