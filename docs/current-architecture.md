# Current Architecture

Public architecture snapshot for the ExactlyOne website.

## App Shape

- App type: static React single-page app.
- Build tool: Vite.
- Language: TypeScript.
- Server language: Rust.
- Styling: CSS files in `src/`.
- Product name: ExactlyOne.
- Public domain: `exactlyone.dev`.
- Active integration branch: `feature/exactlyone-platform-integration`.

## Source Map

- `src/App.tsx`: main UI, ExactlyOne project hub, section navigation, public
  section shells, blog read surface, Helios surface, Easy DB / Easy PG surface,
  Algo Lab tutorial list, dry-run view, and solution panel.
- `src/blogData.ts`: public blog post data model and published post list.
- `src/platformProgressData.ts`: homepage progress model for the four core
  ExactlyOne integration areas and production release cadence.
- `src/heliosData.ts`: public Helios status export contract, metrics, dataset
  summaries, research lanes, pipeline stages, and safety rules.
- `src/easyDbData.ts`: public Easy DB schema export contract, sanitized schema
  browser data, capabilities, and workflow notes.
- `src/platformExports.generated.json`: generated public export bundle consumed
  by the Helios and Easy DB public surfaces.
- `src/tutorialData.ts`: tutorial definitions, tutorial content, solutions,
  idea explanations, complexity text.
- `src/problemBank.ts`: problem catalog data.
- `src/search.ts`: tutorial search helpers.
- `src/App.css` and `src/index.css`: visual design.
- `server/`: Rust API, admin auth, public interactions, migrations, seed
  script, media upload, PostgreSQL access, and production static file serving.
- `server/migrations/`: SQL migrations for Blog content, owner security, Blog
  interactions, Algo notes, and Algo interactions.
- `docker-compose.blog.yml`: local PostgreSQL service for blog development.
- `Dockerfile`: Cloud Run image that builds the frontend and runs the Rust
  server as the public/API entrypoint.
- `cloudbuild.yaml`: Cloud Build recipe for image build/push and Cloud Run
  deployment.
- `scripts/deploy-gcp.sh`: local GCP deployment helper.
- `scripts/release-gate.sh`: pre-deploy gate for branch hygiene, public leak
  scan, backup-helper presence, lint, tests, frontend build, and API check.
- `scripts/check-integration-tracking.mjs`: verifies the core tracking docs and
  package scripts continue to cover Blog, Algo Lab, Helios, and Easy DB.
- `scripts/status-source-repos.mjs`: summarizes local Helios and Easy PG source
  repo readiness without making the production build depend on private repos.
- `scripts/import-platform-exports.mjs`: validates and normalizes Helios/Easy
  DB public export bundles before they are committed to the frontend.
- `scripts/review-platform-export.mjs`: validates a local candidate bundle,
  prints a current-vs-candidate summary, emits optional JSON review reports,
  appends git-ignored local JSONL audit history, flags likely export
  regressions, and can promote the candidate after review.
- `scripts/summarize-platform-export-audit.mjs`: summarizes local platform
  export review history so source-derived Helios/Easy DB candidate decisions
  can be checked without opening raw JSONL.
- `scripts/easy-pg-schema-to-platform-export.mjs`: converts Easy PG schema
  exports into the platform export bundle using an explicit public table
  allow-list or git-ignored local allow-list file.
- `scripts/inspect-easy-pg-schema-export.mjs`: summarizes local Easy PG schema
  exports before allow-list selection, including table counts and
  sensitive-name hints.
- `scripts/helios-status-to-platform-export.mjs`: converts curated Helios
  public status summaries into the platform export bundle.
- `docs/blog-content-system.md`: public-safe local content-system workflow.
- `docs/exactlyone-integration-roadmap.md`: long-task roadmap for integrating
  Blog, Algo Lab, Helios, and Easy DB.
- `docs/platform-export-contracts.md`: public export contracts for Helios and
  Easy DB.
- `docs/engineering-standards.md`: architecture, design-pattern, testing, and
  verification handoff standards.

## Engineering Boundary

- Rust server modules should separate route handlers, services, repositories,
  DTO mappers, and adapters.
- Frontend modules should separate rendering, state transitions, API clients,
  and data transformation.
- Tests should cover pure logic, persistence boundaries, API behavior, and
  critical UI flows as those layers are added or changed.
- Production should expose one public entrypoint. The Rust server owns API
  routes and serves the built frontend.

## Public Surface

- ExactlyOne Blog-first home page with major public section entry cards.
- Homepage platform progress surface covering Blog, Algo Lab, Helios, and Easy
  DB, including completed slices, next steps, and release cadence.
- Public Helios research/status section with read-only metrics, research lanes,
  data pipeline stages, research gates, and private-operation boundary copy.
- Public Helios status export contract with schema version, export date,
  signals, and dataset coverage cards.
- Public Helios data is loaded from the generated platform export bundle.
- Helios source status must pass the Helios status sanitizer before it can
  update the public bundle.
- Public Easy DB section shell with Easy PG as the PostgreSQL-focused tool.
- Easy DB public schema-browser surface with sanitized example tables, column
  search, relationship hints, workflow notes, and private-operation boundary.
- Public Easy DB schema export contract with schema version, export source,
  safety rules, and sanitized table metadata.
- Public Easy DB schema data is loaded from the generated platform export
  bundle.
- Easy PG source schema exports must pass the Easy PG sanitizer and explicit
  table allow-list before they can update the public bundle. Local source
  exports and allow-list files live under `.platform-local/`, which is ignored
  by git. Inspect local schema exports with `npm run inspect:easy-pg-schema`
  before producing a candidate bundle.
- Source-derived Helios/Easy DB changes should first produce a local candidate
  bundle, then pass review/promote before changing `src/platformExports.generated.json`.
  Candidate promotion refuses likely public export regressions unless the
  reduction is explicitly accepted. Candidate review history can be appended
  locally through `npm run audit:platform-export` and summarized through
  `npm run status:platform-export`.
- The release gate runs `npm run check:integration-tracking` so the roadmap,
  architecture snapshot, product record, export contracts, and key tracking
  scripts do not silently drift away from the four-area integration plan.
- Algo Lab search and filtering.
- Algo Lab track hierarchy with Blind 75, Top 150, rating-based practice,
  category index, and multi-tag index pages.
- Tutorial selection by problem title, number, and tags.
- Whiteboard-style dry-run steps.
- Current variable state.
- Variable timeline.
- Visualizers for arrays, linked lists, trees, and stacks.
- Full-width complete solutions with C++, Java, and JavaScript tabs.
- Algo Lab personal-note surface per problem, backed by `problem_id`.
- Algo Lab public comments and reactions per problem.
- Personal blog section with a published-only data layer, search, category/tag
  filters, article metadata, reading view, heading table of contents, and empty
  states.
- Admin page with login, optional TOTP login code, Blog post management, Algo
  problem-note management, Markdown-like authoring, live preview, save, delete,
  password change, TOTP setup/disable controls, comment moderation, and a
  platform export workbench for Helios/Easy DB generated data.
- API with published Blog reads, admin login, draft/published Blog CRUD, Algo
  note admin endpoints, public comments, public reactions, public interaction
  rate limiting, owner comment moderation, password change, optional TOTP
  verification, migration runner, admin seed script, media upload boundary, and
  backup script.

## Planned Integration Surfaces

- Blog: homepage, owner-managed posts, password change, optional TOTP, public
  comments/reactions, and owner moderation tools.
- Algo Lab: tutorial section, personal notes per problem, public replies,
  reactions, admin note UI, track hierarchy, and full-width complete solutions.
  Owner moderation tools exist for comments.
- Helios: public research/status page sourced through the safe Helios public
  status export contract and import gate, plus future authenticated
  operational dashboards. The current generated export is visible in the
  owner-only platform workbench.
- Easy DB: database tooling page sourced through the safe Easy DB public schema
  export contract and import gate, with public docs/examples and authenticated
  real connection operations. The current generated export is visible in the
  owner-only platform workbench.

## External Source Repositories

- Helios: private Helios project.
- Easy DB / Easy PG: private Easy PG project.

External source repos are not automatically part of the production build. Add an
adapter, export, or copied module only after defining the public/private
boundary in `docs/exactlyone-integration-roadmap.md`. Use
`npm run status:source-repos` locally before source-derived imports to confirm
the expected source folders and entry files are present.
