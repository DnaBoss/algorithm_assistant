# Current Architecture

Update this file after every meaningful implementation change. It should answer
what exists now, what is planned next, and where each responsibility lives.

## Current Production Shape

- App type: static React single-page app.
- Build tool: Vite.
- Language: TypeScript.
- Styling: CSS files in `src/`.
- Hosting: Nginx on the `essence` VM.
- Deployment: manual GitHub Actions workflow from `develop`.
- Release layout: `/var/www/algorithm_assistant/releases/<commit>`.
- Active release: `/var/www/algorithm_assistant/current` symlink.
- Public domain: `https://exactlyone.dev`.

## Current Source Map

- `src/App.tsx`: main UI, navigation, tutorial list, dry-run view, solution
  panel.
- `src/tutorialData.ts`: tutorial definitions, tutorial content, solutions,
  idea explanations, complexity text.
- `src/problemBank.ts`: problem catalog data.
- `src/search.ts`: tutorial search helpers.
- `src/App.css` and `src/index.css`: visual design.
- `docs/deployment.md`: deploy setup and required secrets.
- `docs/product-development-record.md`: product direction, milestones, progress.
- `docs/current-architecture.md`: architecture snapshot and update checklist.

## Current Functional Surface

### Implemented

- Algo Lab search and filtering.
- Tutorial selection by problem title, number, and tags.
- Whiteboard-style dry-run steps.
- Current variable state.
- Variable timeline.
- Visualizers for arrays, linked lists, trees, and stacks.
- Collapsible full solutions with C++, Java, and JavaScript tabs.
- Improved idea explanations by problem pattern.

### Not Implemented Yet

- Blog home page.
- Persistent database.
- Backend API.
- Admin login.
- Password change.
- TOTP setup.
- Blog post CRUD.
- Public comments.
- Reactions.
- Per-problem personal notes stored outside static tutorial data.
- Resume timeline.
- Calendar.
- Markdown todo.
- Easy PG integration.

## Target Architecture

The likely next architecture is a small full-stack app on the same VM:

- Nginx serves the frontend and reverse-proxies API routes.
- Frontend remains React.
- API service runs in Docker.
- PostgreSQL runs in Docker with a persistent named volume.
- Database migrations are versioned in the repo.
- Admin bootstrap uses environment variables or deployment secrets.
- Backups run on a schedule before important production content is stored.

## Proposed Runtime Layout

```text
/var/www/algorithm_assistant/
  current -> releases/<commit>
  releases/

/opt/exactlyone/
  docker-compose.yml
  env/
  backups/
  data/
```

This layout keeps static site releases separate from long-lived service and
database state.

## Update Checklist

When a feature branch changes the product or architecture, update:

- `docs/product-development-record.md` progress log.
- This file's functional surface.
- This file's source map if files or services are added.
- Deployment notes if ports, services, secrets, or release steps change.
- README links if a new core document is added.

## Next Engineering Slice

Recommended next slice: build the blog-first shell without a database.

Scope:

- Home page becomes the blog surface.
- Algo Lab moves under a section route or section navigation.
- Add placeholder sections for Resume, Calendar, Todo, and Easy PG.
- Keep all existing Algo Lab behavior working.
- Do not deploy until the page shell is coherent locally unless a production
  preview is needed.
