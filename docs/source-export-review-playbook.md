# Source Export Review Playbook

This playbook defines how source-derived Helios and Easy DB data can move into
ExactlyOne without exposing private operations.

## Purpose

Source exports are useful only when they make the public site more accurate
without expanding the public attack surface. Every candidate must be treated as
untrusted until it has passed the checks below.

## Scope

This applies to:

- Easy PG schema exports that may update the Easy DB public schema browser.
- Helios public status summaries that may update the Helios public research and
  status surface.
- Any generated candidate bundle under `.platform-local/`.
- Any change to `src/platformExports.generated.json`.

This does not apply to:

- Raw production database rows.
- Live database connection profiles.
- Broker credentials, trading sessions, or order state.
- Private logs, hostnames, SSH settings, or restart controls.

## Review Levels

### Level 0: Local Readiness

Run this before reading or importing private source output:

```bash
npm run status:source-repos
```

Expected result:

- Helios and Easy PG source locations are present when the import depends on
  them.
- Missing source repos are acceptable for CI/self-test runs, but not for a real
  source-derived import.

### Level 1: Source Shape Review

For Easy PG:

```bash
npm run inspect:easy-pg-schema
```

Accept only when:

- The allow-list is deliberate and small enough to review by eye.
- Missing allow-list entries are resolved before candidate generation.
- Sensitive-name hints are either excluded or intentionally documented as safe
  metadata.
- The export contains schema metadata only, never row data or samples.

For Helios:

Review the local `.platform-local/helios-status.local.json` before import.
Accept only when:

- Every signal is a public research/status summary.
- Every dataset card is an aggregate status, coverage note, or quality gate.
- No item describes live trading actions, accounts, broker state, private logs,
  hostnames, or operational controls.

### Level 2: Candidate Generation

Generate a candidate bundle in `.platform-local/`, not directly in `src/`:

```bash
npm run import:easy-pg-schema
# or
npm run import:helios-status
```

Expected result:

- The candidate includes both `heliosStatusExport` and
  `easyDbPublicSchemaExport`.
- The generated file stays under `.platform-local/` until review passes.
- No private source file is staged or committed.

### Level 3: Automated Candidate Review

Run:

```bash
npm run check:platform-exports
npm run review:platform-export
npm run audit:platform-export
npm run status:platform-export
```

Accept only when:

- Validation passes.
- Review warnings are understood.
- Regression warnings are either absent or explicitly accepted before promote.
- The local audit summary reflects the latest candidate review.

### Level 4: Promotion

Promote only after the candidate is acceptable:

```bash
npm run promote:platform-export
npm run release:gate
```

Promotion is allowed when:

- The public Easy DB table set is intentional and sanitized.
- The public Helios signal and dataset set is intentional and sanitized.
- `npm run release:gate` passes after promotion.
- The product record, architecture snapshot, and integration roadmap are
  updated when the public surface meaningfully changes.

Promotion is not allowed when:

- The candidate only proves that a source export exists.
- The allow-list contains broad private schemas.
- The Helios summary includes operational or trading details.
- The candidate removes public coverage accidentally.
- Verification depends on local private files that cannot be reproduced or
  explained in public-safe terms.

## Release Decision

A promoted platform export does not automatically mean production deployment.
Deploy only for:

- A complete public feature slice.
- A security fix.
- A public content update that should be visible on `exactlyone.dev`.

Do not deploy just because a candidate bundle was generated.

## Evidence To Keep

Keep these as local or public-safe evidence depending on content:

- Public-safe roadmap and architecture updates in `docs/`.
- Local candidate review JSON under `.platform-local/`.
- Local review history JSONL under `.platform-local/`.
- Release gate output before production deployment.

Never commit private source exports, local review history, secrets, database
rows, or operational logs.
