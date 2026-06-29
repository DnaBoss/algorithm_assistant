# ExactlyOne

ExactlyOne is a personal website hub for public projects, tools, learning
notes, Algo Lab, and a personal blog.

## Current Surface

- React + TypeScript + Vite single-page site shell.
- ExactlyOne home surface with project sections.
- Algo Lab tutorial index with search, tags, dry-run steps, variable state, and
  solution tabs.
- Helios and Easy DB are planned as first-class sections under the same site.
- Easy DB section with Easy PG as the first PostgreSQL-focused tool.
- Personal blog section with published-only data, search, category/tag filters,
  article reading view, and empty states.
- Rust blog API for content, admin, migrations, and media.

The active integration roadmap lives in
[docs/exactlyone-integration-roadmap.md](docs/exactlyone-integration-roadmap.md).

## Development

```bash
npm install
npm run dev
npm run test
npm run build
```

Engineering rules live in
[docs/engineering-standards.md](docs/engineering-standards.md). New work should
keep design patterns purposeful, separate logic from operations, and add tests
proportional to the risk of the change.

## Blog API

```bash
docker compose -f docker-compose.blog.yml up -d
npm run db:migrate
npm run dev:api
```

See [docs/blog-content-system.md](docs/blog-content-system.md) for the blog API,
admin editor, media boundary, and backup workflow.

## Deployment

Production targets GCP Cloud Run as a single Rust-served entrypoint for the
frontend and API. See [docs/deployment.md](docs/deployment.md).
