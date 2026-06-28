# Algorithm Assistant

Interactive algorithm learning site inspired by Labuladong-style explanations, focused first on Blind / LeetCode 75.

## Implemented now

- React + TypeScript + Vite single-page learning site.
- Dark, documentation-oriented UI suitable for long reading.
- Multi-tag tutorial index: one problem can be `Blind 75`, `Tree`, `Beginner`, `DFS`, etc.
- Whiteboard-style dry-run player with **previous / next** controls.
- Current variable table for every step.
- Visualizers for array/hash map movement, linked-list pointer rewiring, binary-tree pointer swapping, and stack state changes.
- Initial tutorials: Two Sum, Merge Two Sorted Lists, Invert Binary Tree, Valid Parentheses.

## Roadmap

- Move the site toward a personal blog and knowledge base with Algo Lab as one
  section.
- Add post authoring, Markdown editing, comments, reactions, and owner admin.
- Add resume timeline, calendar, Markdown todo, and Easy PG.
- Continue expanding Algo Lab paths such as Blind 75, Top 150, rank-point
  selection, SQL, and category-based practice.

See [docs/product-development-record.md](docs/product-development-record.md) for
the durable product plan and [docs/current-architecture.md](docs/current-architecture.md)
for the architecture snapshot that should be updated after each feature branch.

## Development

```bash
npm install
npm run dev
npm run build
```

All normal development should start from `develop`, continue on a short-lived
topic branch, and merge back into `develop` after checks pass. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the full Git flow.

Deployment uses a manual GitHub Actions workflow that builds the Vite site and
syncs `dist/` to `essence` through `bastion`. See
[docs/deployment.md](docs/deployment.md).
