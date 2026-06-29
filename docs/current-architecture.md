# Current Architecture

Public architecture snapshot for the ExactlyOne website.

## App Shape

- App type: static React single-page app.
- Build tool: Vite.
- Language: TypeScript.
- Server language: Rust.
- Styling: CSS files in `src/`.
- Product name: ExactlyOne.

## Source Map

- `src/App.tsx`: main UI, ExactlyOne project hub, section navigation, public
  section shells, blog read surface, Online Tool / Easy PG surface, Algo Lab
  tutorial list, dry-run view, and solution panel.
- `src/blogData.ts`: public blog post data model and published post list.
- `src/tutorialData.ts`: tutorial definitions, tutorial content, solutions,
  idea explanations, complexity text.
- `src/problemBank.ts`: problem catalog data.
- `src/search.ts`: tutorial search helpers.
- `src/App.css` and `src/index.css`: visual design.
- `server/`: Rust blog API, admin auth, migrations, seed script, media upload,
  PostgreSQL access, and production static file serving.
- `server/migrations/`: SQL migrations for the content database.
- `docker-compose.blog.yml`: local PostgreSQL service for blog development.
- `Dockerfile`: Cloud Run image that builds the frontend and runs the Rust
  server as the public/API entrypoint.
- `cloudbuild.yaml`: Cloud Build recipe for image build/push and Cloud Run
  deployment.
- `scripts/deploy-gcp.sh`: local GCP deployment helper.
- `docs/blog-content-system.md`: public-safe local content-system workflow.
- `docs/engineering-standards.md`: architecture, design-pattern, testing, and
  AI skill-usage standards.

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

- ExactlyOne home hub with public sections.
- Algo Lab search and filtering.
- Tutorial selection by problem title, number, and tags.
- Whiteboard-style dry-run steps.
- Current variable state.
- Variable timeline.
- Visualizers for arrays, linked lists, trees, and stacks.
- Collapsible full solutions with C++, Java, and JavaScript tabs.
- Online Tool section with Easy PG.
- Personal blog section with a published-only data layer, search, category/tag
  filters, article metadata, reading view, heading table of contents, and empty
  states.
- Blog admin page with login, post list, draft/published editor, Markdown-like
  authoring, live preview, save, and delete.
- Blog API with published post reads, admin login, draft/published CRUD,
  migration runner, admin seed script, media upload boundary, and backup script.
