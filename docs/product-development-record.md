# Product Development Record

This file is a public-safe product record.

## Public Product Shape

- Product name: ExactlyOne.
- Main sections: games, trading strategies, quant platform, learning,
  graduate-exam prep, Algo Lab, Online Tool, and personal blog.
- Algo Lab is the public name for the algorithm-learning surface.
- Online Tool is the browser-accessible utilities section.
- Easy PG is the first listed Online Tool.
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
- Added Online Tool with Easy PG.
- Set the personal blog to an empty public state until posts are published.
- Added the published-only blog data layer, filters, search, and article reading
  view.
- Added the first Rust blog backend slice with PostgreSQL migration, admin login,
  post CRUD, local media adapter, and backup script.
- Added Markdown-like admin authoring, live preview, frontend editor tests,
  stricter Rust API validation tests, and Cloud Run deployment artifacts.
