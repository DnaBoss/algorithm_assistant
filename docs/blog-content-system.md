# Blog Content System

The blog content system is split from the static frontend while staying in the
same repository.

All ExactlyOne services use Rust on the server side. Node is only used for the
frontend toolchain.

## Local Services

```bash
docker compose -f docker-compose.blog.yml up -d
npm run db:migrate
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD=change-me ADMIN_JWT_SECRET=dev-secret npm run db:seed-admin
npm run dev:api
npm run dev
```

The public site reads published posts from `/api/blog/posts`. If the API is not
available during frontend-only development, the site falls back to the static
published post list.

The Vite dev server proxies `/api` and `/media` to the local API on port `4174`.

## Admin

The editor is available at `/admin`. It is intentionally not linked from the
public navigation.

Admin credentials are seeded through environment variables and are not stored in
source control.

The editor accepts Markdown-like text and stores normalized JSON blocks through
the API.

The admin page includes a live article preview, draft/published status, slug,
category, tags, estimated read minutes, and delete support.

## Owner Security

- Admin login supports an optional 6-digit TOTP code after TOTP is enabled.
- Password changes use `PUT /api/admin/password` and require the current
  password plus a new password of at least 12 characters.
- TOTP setup uses `POST /api/admin/totp/setup`, then
  `POST /api/admin/totp/enable` with a valid code from the authenticator app.
- TOTP disable uses `POST /api/admin/totp/disable` and requires the owner
  password; if TOTP is enabled, it also requires a current TOTP code.

## Authoring Blocks

Supported authoring blocks:

- `## Heading`
- Paragraphs with inline Markdown links.
- `- List items`
- `> Quotes`
- Fenced code blocks.
- Video blocks.

Video block syntax:

```markdown
@[Video title](https://www.youtube.com/watch?v=example)
```

## Data Boundary

- PostgreSQL owns posts, admin users, and media metadata.
- Blog post bodies are stored as JSON blocks so they can later be rendered from
  Markdown or another editor format.
- Only posts with `status = 'published'` are returned by public APIs.
- Drafts are only available through authenticated admin APIs.
- API validation rejects blank titles, blank categories, invalid status values,
  non-positive read minutes, and empty bodies.

## Media

The first media backend stores files under `BLOG_MEDIA_DIR` and exposes them
under `BLOG_MEDIA_PUBLIC_PATH`. This is a local adapter boundary; it can later
be replaced with object storage without changing the editor contract.

## Backups

Use the backup script with `DATABASE_URL` set:

```bash
DATABASE_URL=postgres://... ./scripts/backup-blog-db.sh
```

Backups are written to `backups/`, which is ignored by git.

## Tests

```bash
npm run test
```

Current automated coverage includes frontend Markdown/block mapping tests,
video-block parsing tests, Rust API validation/password tests, and TOTP
generator tests. Add repository and API integration tests as database behavior
grows.
