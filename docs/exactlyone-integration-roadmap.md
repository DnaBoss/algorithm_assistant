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
| Helios | Public quant/trading research notes and selected dashboards | Market-data state, ingestion status, experiments, operational dashboards | `/Users/cash/work_space/private/Helios` |
| Easy DB | Public browser-accessible database learning/tooling surface | Safe schema export, query notes, connection profiles, admin-only DB operations | `/Users/cash/work_space/private/easy-pg` |

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

Next requirements:

- Public-safe moderation tools.
- Rate limiting / abuse controls.
- Better Markdown rendering and image handling.

### Algo Lab

Current state:

- Searchable tutorials.
- Dry-run steps.
- Variable state and timeline.
- Full-width complete solutions.
- Personal-note table and public note read endpoint keyed by `problem_id`.
- Public comments and reactions keyed by `problem_id`.
- Admin API endpoints exist for listing, upserting, and deleting problem notes.

Next requirements:

- Admin UI for editing problem notes.
- Track hierarchy such as `Algo > Blind 75`, `Algo > Top 150`, and
  rank-point-based selection.
- Moderation and rate limiting for problem comments/reactions.

### Helios

Current source:

- Repo path: `/Users/cash/work_space/private/Helios`.
- Rust workspace with Docker Compose and frontend assets.
- Known domain knowledge includes market-data ingestion, kbar collection state,
  gap scans, TXF pipeline status, and provider validation.

Integration plan:

- Phase 1: public landing page explaining Helios as research infrastructure,
  without exposing private trade operations. Initial shell exists in this
  branch.
- Phase 2: read-only dashboard cards sourced from exported/status JSON, such as
  ingestion state and research notes.
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

- Repo path: `/Users/cash/work_space/private/easy-pg`.
- Rust app with web UI, Dockerfile, Docker Compose, profiles, and schema export
  artifacts.

Integration plan:

- Phase 1: rename all public copy to Easy DB or Easy PG consistently. Preferred
  public section label: Easy DB. Tool label may remain Easy PG if the exact
  feature is PostgreSQL-specific. Initial shell exists in this branch.
- Phase 2: embed or reimplement the public landing and schema-view workflow in
  ExactlyOne.
- Phase 3: authenticated connection-profile management.
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
- Preserve branch naming hygiene.

### M1: Blog-First ExactlyOne Shell

Status: partially implemented on `feature/exactlyone-platform-integration`.

- Home is now Blog-first and keeps major section entry cards below the blog
  surface.
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
- Moderation and rate-limiting boundary remains.

### M3: Algo Lab Integration

Status: partially implemented.

- Existing Algo Lab is present.
- Complete solutions now render as an independent full-width section.
- Personal notes, public comments, and reactions have database/API foundations.
- Public Algo lesson pages render the personal-note surface and interaction UI.
- Browser screenshot review passed for the expanded complete-solution layout.
- Needs admin note editor UI, moderation, rate limiting, and track hierarchy.

### M4: Easy DB Integration

Status: partially implemented.

- Confirm whether to integrate by iframe, reverse proxy, shared Rust module, or
  reimplementation.
- Public Easy DB shell exists.
- Needs authenticated admin-only operations.

### M5: Helios Integration

Status: partially implemented.

- Public Helios shell exists.
- Define private operational dashboard.
- Choose export-file, API adapter, or database read model.
- Add read-only status proof before live operations.

### M6: Production Runtime

Status: partially designed.

- Current branch includes Cloud Run artifacts.
- Need decide whether production stays on VM/Nginx for now or moves to Cloud
  Run.
- Need database backup/restore check before storing important content.

## Next Action Queue

1. Add moderation tools and rate limiting for public Blog and Algo interactions.
2. Add Admin UI for Algo problem notes.
3. Decide Easy DB adapter style: iframe, reverse proxy, shared Rust module, or
   reimplementation.
4. Add Helios read-only status proof before live operations.
5. Decide whether this verified platform slice should deploy before the next
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
- Verified local PostgreSQL migration through `npm run db:migrate`; the
  `admin_users` table has `password_changed_at`, `totp_secret`, and
  `totp_enabled`.
- Verified local owner-security API smoke flow: login, security profile,
  password change, TOTP setup, TOTP enable, TOTP login, TOTP disable, and
  password restore.
