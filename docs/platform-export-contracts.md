# Platform Export Contracts

ExactlyOne can show public data from Helios and Easy DB only after the data is
converted into a safe export shape.

Current frontend bundle: `src/platformExports.generated.json`.

Import and validation tool: `scripts/import-platform-exports.mjs`.

Candidate review tool: `scripts/review-platform-export.mjs`.

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

For a real local import, keep both the source export and allow-list outside git:

```bash
mkdir -p .platform-local
cp easy-pg-schema-export.json .platform-local/easy-pg-schema.local.json
printf '%s\n' public.users public.projects > .platform-local/easy-pg-public-tables.local.txt
npm run import:easy-pg-schema
npm run check:platform-exports
npm run review:platform-export
```

`.platform-local/`, `*.local.json`, and `*.local.txt` are ignored by git.

Running the tool without arguments validates the current generated export:

```bash
npm run check:platform-exports
```

For Helios status exports, prepare a small public summary JSON locally:

```json
{
  "signals": [
    { "label": "Engine", "value": "ready", "detail": "Public summary only." }
  ],
  "datasets": [
    { "name": "Market data", "coverage": "curated status only", "cadence": "manual export", "gate": "no raw logs or private operations" }
  ]
}
```

Then import it through the same git-ignored local workspace:

```bash
mkdir -p .platform-local
cp helios-status.json .platform-local/helios-status.local.json
npm run import:helios-status
npm run check:platform-exports
npm run review:platform-export
```

`npm run check:platform-exports` also runs the Easy PG and Helios sanitizer
self-tests, plus the platform export review self-test.

The review tool prints a current-vs-candidate report and flags likely
regressions such as older export dates, removed Helios signals, removed Helios
datasets, removed Easy DB tables, or reduced Easy DB column counts:

```bash
npm run review:platform-export
node scripts/review-platform-export.mjs --fail-on-regression
node scripts/review-platform-export.mjs --json .platform-local/platform-review.local.json
npm run audit:platform-export
npm run status:platform-export
```

`npm run audit:platform-export` writes the latest review JSON and appends a
JSONL history entry under `.platform-local/`. This history is intentionally
local-only so source candidate reviews can be tracked without publishing private
operator context. `npm run status:platform-export` summarizes that local
history and highlights the latest warning count.

Promotion refuses regression warnings by default. Use an explicit override only
after deliberately accepting the reduced public export:

```bash
node scripts/review-platform-export.mjs --promote --allow-regression
```

When the candidate report is acceptable, promote it into the frontend bundle:

```bash
npm run promote:platform-export
npm run release:gate
```
