# Product Development Record

This file is a public-safe product record.

## Public Product Shape

- Product name: ExactlyOne.
- Public domain: `exactlyone.dev`.
- Main sections: Blog, Algo Lab, Helios, Easy DB, resume, calendar/todo,
  learning, graduate-exam prep, and selected project notes.
- Blog is the public homepage direction.
- Algo Lab is the public name for the algorithm-learning surface.
- Helios is the quant/trading research and operational-status area.
- Easy DB is the database tooling area. Easy PG may be used for the
  PostgreSQL-specific tool surface.
- Personal blog displays only posts that are explicitly ready for publication
  and supports search, category/tag filters, and a reading view.
- Blog content has an API, database migration, admin editor, local media
  boundary, and backup script.
- Server-side services are implemented in Rust.
- Production target is GCP with `exactlyone.dev` as the unified public entry.

## Public Changelog

### 2026-06-28

- Prepared the site for a broader personal project hub.

### 2026-06-29

- Renamed the top-level product to ExactlyOne.
- Added the project hub navigation.
- Added public shells for major sections.
- Added Algo Lab as the algorithm-learning section.
- Added the first public Easy PG shell.
- Set the personal blog to an empty public state until posts are published.
- Added the published-only blog data layer, filters, search, and article reading
  view.
- Added the first Rust blog backend slice with PostgreSQL migration, admin login,
  post CRUD, local media adapter, and backup script.
- Added Markdown-like admin authoring, live preview, frontend editor tests,
  stricter Rust API validation tests, and Cloud Run deployment artifacts.

### 2026-06-30

- Created the Helios, Algo Lab, Blog, and Easy DB integration roadmap.
- Renamed public navigation from generic quant/tool labels to Helios and Easy
  DB.
- Moved Algo Lab complete solutions into an independent full-width section.
- Changed the homepage direction to Blog-first while keeping Helios, Algo Lab,
  Easy DB, and other major sections reachable from the home page.
- Added owner security foundation: password change plus optional TOTP setup and
  login verification.
- Added richer blog editor content support for inline links and video blocks.
- Added the first public community layer for Blog posts: anonymous comments and
  browser-local reaction deduplication for published articles.
- Added the first Algo Lab personal-note and community layer: problem notes by
  problem id, public comments, and browser-local reactions.
- Added the first admin editor for Algo Lab problem notes.
- Reworked Easy DB into a public PostgreSQL schema-browser example with
  searchable tables, column metadata, relation hints, and private-operation
  boundaries.
- Reworked Helios into a public read-only research/status section with metrics,
  research lanes, data pipeline stages, and private-operation boundaries.
- Added a homepage platform progress surface for Blog, Algo Lab, Helios, and
  Easy DB, including completed slices, next steps, and release cadence.
- Added `npm run release:gate` as the pre-deploy gate for branch hygiene,
  public-file leak scanning, backup-helper presence, lint, tests, frontend
  build, and API check.
- Added Algo Lab track hierarchy pages for Blind 75, Top 150, rating-based
  practice, category index, and multi-tag index.
- Added first server-side public interaction rate limiting for Blog and Algo
  comments/reactions.
- Added the first owner moderation tools for Blog and Algo comments, including
  admin listing plus hide/restore controls.
- Added public export contracts for Helios status and Easy DB schema snapshots,
  and changed both public sections to render export metadata.
- Added a generated platform export bundle plus validation/import tooling for
  future Helios and Easy DB source-derived exports.
- Added an Easy PG schema sanitizer that converts source exports into the
  public platform bundle only through an explicit table allow-list.
- Added and verified the git-ignored local Easy PG import workflow for
  source-derived schema exports.
- Added a Helios status sanitizer that converts curated local status summaries
  into the public platform bundle.
- Added local candidate review and promote tooling for platform export changes.
- Added an owner-only Platform admin workbench for reviewing the current
  generated Helios and Easy DB export summaries from the site admin surface.
- Preserved the in-progress ExactlyOne platform work under
  `feature/exactlyone-platform-integration`.
- Removed the old temporary remote branch and continued branch hygiene
  with `feature/...`, `fix/...`, and `docs/...` naming.

## Active Long Task

Track the full integration in
[docs/exactlyone-integration-roadmap.md](exactlyone-integration-roadmap.md).

Completion requires more than this planning document. The long task remains
open until:

- Blog is the actual homepage and supports owner-managed content.
- Algo Lab is one section with personal notes, full-width complete solutions,
  and planned public interaction surfaces.
- Easy DB is integrated from the private Easy PG source behind safe public/admin
  boundaries.
- Helios is integrated from the private Helios source with public research pages
  and private operational boundaries.
- Production deployment path and backup/restore process are verified.
