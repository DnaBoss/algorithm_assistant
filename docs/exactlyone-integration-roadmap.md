# ExactlyOne Integration Roadmap

This is the tracking document for integrating Helios, Algo Lab, Blog, and Easy
DB into the ExactlyOne site.

Current public domain: `exactlyone.dev`.

## Goal

ExactlyOne should become one coherent personal operating site instead of a set
of unrelated tools. The site should expose public writing and learning surfaces,
while keeping private infrastructure, credentials, admin workflows, and data
operations behind authenticated boundaries.

## Product Map

| Area | Public role | Private/admin role | Current source |
| --- | --- | --- | --- |
| Blog | Public writing for study, work, graduate-exam prep, side projects, and project notes | Admin authoring, drafts, publish flow, backups | This repo |
| Algo Lab | Public algorithm learning, dry-runs, solutions, tracks | Owner notes per problem, future comments and reactions | This repo |
| Helios | Public quant/trading research notes and selected dashboards | Market-data state, ingestion status, experiments, operational dashboards | Private Helios source |
| Easy DB | Public browser-accessible database learning/tooling surface | Safe schema export, query notes, connection profiles, admin-only DB operations | Private Easy PG source |

## Non-Negotiables

- Do not expose internal planning notes, unfinished operational logs, or wording
  that makes the site look operationally improvised.
- Do not commit production secrets, database passwords, SSH keys, TOTP secrets,
  or real private connection strings.
- Do not expose Helios trading operations or private database connections as
  public unauthenticated tools.
- Keep Algo Lab as one section, not the whole site.
- Use branch names such as `feature/...`, `fix/...`, and `docs/...`.
- Deploy production only for complete feature slices, security fixes, or public
  content releases that need to be visible.

## Integration Architecture

Target shape:

```text
Browser
  |
  v
ExactlyOne frontend
  |
  +-- Blog public pages
  +-- Algo Lab public pages
  +-- Helios public research/dashboard pages
  +-- Easy DB public landing/tool pages
  +-- Admin pages
        |
        v
Rust API
  |
  +-- PostgreSQL content database
  +-- Blog repository
  +-- Algo notes repository
  +-- Helios adapter boundary
  +-- Easy DB adapter boundary
```

Adapter boundary rule:

- ExactlyOne owns the public UI, auth, content records, and published metadata.
- Helios and Easy DB keep their own operational logic until an endpoint or
  module is deliberately promoted into the ExactlyOne API.
- Cross-project calls must be explicit adapters, not copied private logic
  scattered into the frontend.
- Public data must pass through the export contracts in
  [platform-export-contracts.md](platform-export-contracts.md).
- Candidate export bundles must pass `npm run check:platform-exports` before
  they are committed into `src/platformExports.generated.json`.
- Candidate export bundles should be reviewed with
  `npm run review:platform-export` before they are promoted.
- Helios public status summaries must pass
  `scripts/helios-status-to-platform-export.mjs` before they update the public
  Helios bundle.
- Easy PG schema exports must pass
  `scripts/easy-pg-schema-to-platform-export.mjs` with explicit `--table`
  allow-list entries or a git-ignored local allow-list file before they update
  the public Easy DB bundle.

## Data Domains

### Blog

Already started in this repo:

- Published post reads.
- Admin login.
- Draft/published CRUD.
- Markdown-like authoring.
- Media boundary.
- PostgreSQL migration.
- Backup script.

Current security and interaction state:

- Password change exists.
- Optional TOTP for owner login exists.
- Comment and reaction tables exist.
- Public comment and reaction APIs exist for published posts.
- First server-side public interaction rate limit exists for comments and
  reactions.
- Owner moderation tools exist for hiding and restoring comments.

Next requirements:

- Better Markdown rendering and image handling.
- Bulk moderation actions and audit history.

### Algo Lab

Current state:

- Searchable tutorials.
- Track hierarchy exists for Blind 75, Top 150, rating-based practice,
  category index, and multi-tag index pages.
- Dry-run steps.
- Variable state and timeline.
- Full-width complete solutions.
- Personal-note table and public note read endpoint keyed by `problem_id`.
- Public comments and reactions keyed by `problem_id`.
- First server-side public interaction rate limit exists for comments and
  reactions.
- Admin API endpoints exist for listing, upserting, and deleting problem notes.
- Admin UI exists for editing, previewing, publishing, and deleting problem
  notes.
- Owner moderation tools exist for hiding and restoring problem comments.

Next requirements:

- Deeper per-track study plans, progress markers, and recommended order.
- Bulk moderation actions and reaction-abuse review.

### Helios

Current source:

- Private Helios source repo.
- Rust workspace with Docker Compose and frontend assets.
- Known domain knowledge includes market-data ingestion, kbar collection state,
  gap scans, TXF pipeline status, and provider validation.

Integration plan:

- Phase 1: public landing page explaining Helios as research infrastructure,
  without exposing private trade operations. Initial public research/status
  cards exist in this branch.
- Phase 2: read-only dashboard cards sourced from exported/status JSON, such as
  ingestion state and research notes. The first public status export contract
  exists with schema version, export date, signals, dataset coverage cards, and
  an import gate.
- Phase 3: authenticated operational dashboard for market-data collection
  state.
- Phase 4: deliberate API adapter if Helios services should be queried live.

Safety boundary:

- Public pages can show research writeups and curated status.
- Admin pages can show operational status.
- Trading credentials, broker settings, raw private logs, and write operations
  stay private.

### Easy DB

Current source:

- Private Easy PG source repo.
- Rust app with web UI, Dockerfile, Docker Compose, profiles, and schema export
  artifacts.
- ExactlyOne now has a public Easy DB schema-browser surface using sanitized
  example tables and private-operation boundary copy.

Integration plan:

- Phase 1: rename all public copy to Easy DB or Easy PG consistently. Preferred
  public section label: Easy DB. Tool label may remain Easy PG if the exact
  feature is PostgreSQL-specific. Public schema-browser example exists in this
  branch.
- Phase 2: embed or reimplement the public landing and schema-view workflow in
  ExactlyOne using sanitized exports from Easy PG. The first public schema
  export contract exists with schema version, source label, safety rules, and
  sanitized table metadata. An import gate now validates generated public
  export bundles before release. The Easy PG sanitizer exists and requires an
  explicit table allow-list.
- Phase 3: authenticated connection-profile management and live schema export.
- Phase 4: safe query notes and export-to-post workflow.

Safety boundary:

- Public users can read docs and public examples.
- Only authenticated owner/admin can use real connection profiles.
- Production DB credentials must never ship to the browser.

## Milestones

### M0: Tracking Foundation

Status: in progress.

- Keep this roadmap updated.
- Keep current architecture updated.
- Keep product development record updated.
- Keep the homepage platform progress surface aligned with the actual roadmap.
- Preserve branch naming hygiene.

### M1: Blog-First ExactlyOne Shell

Status: partially implemented on `feature/exactlyone-platform-integration`.

- Home is now Blog-first and keeps major section entry cards below the blog
  surface.
- Home now includes a platform progress surface for Blog, Algo Lab, Helios, and
  Easy DB, plus the current release cadence.
- Blog public surface exists.
- Admin editor exists.
- Rust API exists.
- Local lint, frontend/API tests, frontend build, and API check pass on this
  branch.
- Browser screenshot review passed for the Blog-first home page.
- Still needs deployment decision.

### M2: Blog Security And Community

Status: partially implemented.

- Owner password change API and admin UI exist.
- Optional TOTP setup, enable, disable, and login verification exist.
- Public comments and reactions exist for published blog posts.
- First server-side public interaction rate limit exists.
- Owner moderation tools exist for comments.

### M3: Algo Lab Integration

Status: partially implemented.

- Existing Algo Lab is present.
- Track hierarchy exists for Blind 75, Top 150, rating-based practice,
  category index, and multi-tag index pages.
- Complete solutions now render as an independent full-width section.
- Personal notes, public comments, and reactions have database/API foundations.
- First server-side public interaction rate limit exists for Algo comments and
  reactions.
- Public Algo lesson pages render the personal-note surface and interaction UI.
- Admin page includes a first problem-note editor with title, status, Markdown
  body, preview, save, and delete.
- Browser screenshot review passed for the expanded complete-solution layout.
- Needs moderation tools and deeper per-track study plans.

### M4: Easy DB Integration

Status: partially implemented.

- Public Easy DB schema-browser example exists.
- Safe public/private boundary is represented in the UI.
- Source Easy PG capabilities were reviewed: profiles, SSH tunnel, schema
  snapshot, column search, SQL import, and schema export.
- Public Easy DB schema export contract exists and feeds the schema browser.
- Generated platform export bundle exists and is validated by release gate.
- Easy PG schema-to-platform sanitizer exists with allow-list protection.
- Local Easy PG import workflow exists through `.platform-local/` and
  `npm run import:easy-pg-schema`.
- Platform export review/promote workflow exists for local candidate bundles.
- Need decide whether live private operations use iframe, reverse proxy, shared
  Rust module, or reimplementation.
- Needs authenticated admin-only operations.

### M5: Helios Integration

Status: partially implemented.

- Public Helios research/status section exists with read-only metrics,
  research lanes, pipeline stages, research gates, and private-operation
  boundaries.
- Public Helios status export contract exists and feeds the status cards.
- Generated platform export bundle exists and is validated by release gate.
- Helios status-to-platform sanitizer exists.
- Define private operational dashboard.
- Generate the first source-derived sanitized status export from Helios into
  this contract.
- Choose export-file, API adapter, or database read model after the export
  proof is stable.

### M6: Production Runtime

Status: partially implemented.

- Current branch includes Cloud Run artifacts.
- `npm run release:gate` exists and verifies branch hygiene, public-file leak
  candidates, backup-helper presence, lint, tests, frontend build, and API
  check before any manual deploy.
- Need decide whether production stays on VM/Nginx for now or moves to Cloud
  Run.
- Need restore drill before storing important production content.

## Next Action Queue

1. Generate the first source-derived sanitized Easy DB export from Easy PG using
   the allow-list sanitizer.
2. Generate the first source-derived sanitized Helios status export from
   Helios.
3. Decide Easy DB adapter style: iframe, reverse proxy, shared Rust module, or
   reimplementation.
4. Decide whether this verified platform slice should deploy before the next
   integration slice.

## Progress Log

### 2026-06-30

- Preserved the existing ExactlyOne blog-platform work under
  `feature/exactlyone-platform-integration`.
- Removed the old temporary remote branch and continued work on
  `feature/exactlyone-platform-integration`.
- Added this integration roadmap for Helios, Algo Lab, Blog, and Easy DB.
- Added public Helios and Easy DB section labels.
- Moved Algo Lab complete solutions out of the right-side state panel and into a
  full-width section.
- Changed the homepage from a generic section hub to a Blog-first page with
  major section entry cards below it.
- Verified `npm run lint`, `npm run test`, `npm run build`, and
  `npm run build:api`.
- Started local Vite preview on `http://127.0.0.1:5174/`; browser screenshot
  verification still needs to be completed before production deployment.
- Completed headless Chrome verification for the Blog-first home page:
  `個人 blog` is the home hero, the blog surface renders before the section
  cards, and Helios, Algo Lab, and Easy DB appear as major entry cards without
  horizontal overflow.
- Completed headless Chrome verification for Algo Lab complete solutions:
  expanding the solution keeps it outside the right-side state panel, renders it
  under the lesson content, uses `pre-wrap`, and does not create page-level
  horizontal scrolling.
- Added owner security foundation: password-change endpoint, TOTP setup,
  TOTP login verification, TOTP enable/disable endpoints, admin UI controls,
  and database migration `002_admin_security.sql`.
- Added blog editor support for inline Markdown links and video blocks.
- Added public blog comments and reactions with PostgreSQL migration
  `003_blog_interactions.sql`, published-post-only API routes, and article-page
  UI.
- Added Algo Lab problem-note and interaction data model with PostgreSQL
  migration `004_algo_notes_interactions.sql`, public problem note/comment/
  reaction API routes, admin note API routes, and lesson-page note/interaction
  UI.
- Added the first `/admin` Algo problem-note editor with Blog/Algo admin tabs,
  problem selection, Markdown editing, live preview, draft/published state,
  save, and delete.
- Reworked Easy DB from a placeholder into a public schema-browser example with
  searchable sanitized tables, relation hints, workflow notes, and explicit
  private-operation boundaries.
- Reworked Helios from a placeholder into a public read-only research/status
  page with data quality gates, pipeline stages, and private-operation
  boundaries.
- Added a homepage platform progress surface that keeps the four core
  integration areas and release cadence visible from one place.
- Added `npm run release:gate` as the pre-deploy gate for branch hygiene,
  public-file leak scanning, backup-helper presence, lint, tests, frontend
  build, and API check.
- Added Algo Lab track hierarchy pages for Blind 75, Top 150, rating-based
  practice, category index, and multi-tag index.
- Added first server-side public interaction rate limiting for Blog and Algo
  comments/reactions.
- Added public export contracts for Helios status and Easy DB schema data.
- Added the generated platform export bundle and release-gate validation for
  Helios/Easy DB public exports.
- Added the Easy PG schema-to-platform sanitizer with explicit table allow-list
  protection.
- Added and locally verified the git-ignored Easy PG import workflow using a
  real source export and local allow-list.
- Added the Helios status-to-platform sanitizer and local import workflow.
- Added candidate review/promote tooling for platform exports.
- Verified local PostgreSQL migration through `npm run db:migrate`; the
  `admin_users` table has `password_changed_at`, `totp_secret`, and
  `totp_enabled`.
- Verified local owner-security API smoke flow: login, security profile,
  password change, TOTP setup, TOTP enable, TOTP login, TOTP disable, and
  password restore.
